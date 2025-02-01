import React, { useState, useEffect, useRef, useCallback } from "react";
import NetworkVisualization from "../components/NetworkVisualization";
import Navbar from "../components/Navbar";
import PaperDetails from "../components/PaperDetails";
import { toast } from "react-toastify";
import Spinner from "../components/Spinner";

const Home = () => {
  // State management
  const [state, setState] = useState({
    arxivId: null,
    loading: false,
    graphData: null,
    selectedPaper: null,
    centerNodeId: null,
    fileDisabled: false,
    collaboratorSuggestions: null,
    file: null,
    flowchartImage: null
  });

  const paperDetailsRef = useRef(null);

  // Derived state
  const { 
    arxivId, loading, graphData, selectedPaper, centerNodeId, 
    fileDisabled, collaboratorSuggestions, file, flowchartImage 
  } = state;

  // Effect for initial paper selection
  useEffect(() => {
    if (graphData?.nodes?.length > 0) {
      const initialPaper = graphData.nodes[0];
      setState(prev => ({
        ...prev,
        selectedPaper: initialPaper,
        centerNodeId: initialPaper.id,
        collaboratorSuggestions: graphData.collaboratorSuggestions
      }));
    }
  }, [graphData]);

  // Fetch paper network data
  const fetchPaperNetwork = useCallback(async (id) => {
    setState(prev => ({ ...prev, loading: true }));
    
    try {
      const response = await fetch(
        `${process.env.REACT_APP_URL}/api/paper/${id}`
      );
      
      if (!response.ok) throw new Error("Network response was not ok");
      
      const data = await response.json();
      setState(prev => ({
        ...prev,
        graphData: data,
        centerNodeId: id,
        collaboratorSuggestions: data.collaboratorSuggestions
      }));
    } catch (error) {
      console.error("Error fetching paper:", error);
      toast.error("Error fetching paper details. Please try again.");
    } finally {
      setState(prev => ({ ...prev, loading: false }));
    }
  }, []);

  // Event handlers
  const handlePaperSearch = useCallback(() => {
    if (arxivId) fetchPaperNetwork(arxivId);
  }, [arxivId, fetchPaperNetwork]);

  const handlePaperSearchWithID = useCallback((nodeId) => {
    fetchPaperNetwork(nodeId.replace("/", "%2F"));
  }, [fetchPaperNetwork]);

  const handleNodeClick = useCallback((nodeId) => {
    const clickedPaper = graphData.nodes.find(node => node.id === nodeId);
    setState(prev => ({ ...prev, selectedPaper: clickedPaper }));
    
    if (nodeId !== centerNodeId) {
      setState(prev => ({ ...prev, arxivId: nodeId }));
      handlePaperSearchWithID(nodeId);
    }
    
    if (paperDetailsRef.current) {
      paperDetailsRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [graphData, centerNodeId, handlePaperSearchWithID]);

  const handleInputChange = useCallback((e) => {
    const value = e.target.value;
    setState(prev => ({
      ...prev,
      arxivId: value,
      fileDisabled: !!value
    }));
  }, []);

  const handleFileChange = useCallback(async (e) => {
    const file = e.target.files[0];
    if (!file || file.type !== "application/pdf") {
      return toast.error("Please upload a valid PDF file.");
    }

    setState(prev => ({ ...prev, file, fileDisabled: true, loading: true }));
    
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(
        `${process.env.REACT_APP_PYTHON_URL}/extract_text/`,
        { method: "POST", body: formData }
      );

      if (!response.ok) throw new Error("File upload failed.");
      
      const extractedText = await response.text();
      await generateFlowchart(extractedText);
      toast.success("File uploaded and flowchart generated successfully!");
    } catch (error) {
      console.error("Error uploading file:", error);
      toast.error("Error extracting text from the PDF. Please try again.");
    } finally {
      setState(prev => ({ ...prev, loading: false }));
    }
  }, []);

  const generateFlowchart = useCallback(async (text) => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_URL}/api/generate-flowchart`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: text })
        }
      );

      if (!response.ok) throw new Error("Flowchart generation failed.");
      
      const imageBlob = await response.blob();
      setState(prev => ({
        ...prev,
        flowchartImage: URL.createObjectURL(imageBlob)
      }));
    } catch (error) {
      console.error("Error generating flowchart:", error);
      toast.error("Error generating flowchart. Please try again.");
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col spyder-app text-text-color">
      <Navbar />
      <main className="flex-grow flex flex-col items-center px-4 py-8">
        <div className="bg-opacity-70 rounded-lg w-full max-w-2xl mb-2">
          <div className="mb-6">
            <h2 className="text-xl mb-2">Enter arXiv ID:</h2>
            <div className="flex space-x-1 items-center rounded-md">
              <input
                type="text"
                value={arxivId || ""}
                onChange={handleInputChange}
                placeholder="Enter arXiv ID"
                className="flex-grow px-4 py-2 rounded-sm text-black focus:outline-none"
              />
              <button
                className={`bg-accent-color text-white px-6 py-2 rounded-md transition-colors ${
                  loading ? "opacity-50 cursor-not-allowed" : "hover:opacity-90"
                }`}
                onClick={handlePaperSearch}
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <span className="loader mr-2" />
                    Loading...
                  </span>
                ) : (
                  "Search"
                )}
              </button>
            </div>
          </div>

          <div>
            <p>
              <b>Or</b>{" "}
              <span
                className="text-link text-accent-color underline cursor-pointer"
                onClick={() => document.getElementById("fileInput").click()}
              >
                upload
              </span>{" "}
              a scanned document
            </p>
            <input
              type="file"
              accept=".pdf"
              id="fileInput"
              className="hidden"
              onChange={handleFileChange}
              disabled={fileDisabled}
            />
          </div>
        </div>

        <div ref={paperDetailsRef}>
          {selectedPaper && (
            <PaperDetails
              paper={selectedPaper}
              collaboratorSuggestions={collaboratorSuggestions}
            />
          )}
        </div>

        {loading ? (
          <div className="mt-4">
            <Spinner />
          </div>
        ) : (
          graphData && arxivId && (
            <div className="mt-2 w-3/4 max-w-4xl bg-white rounded-lg flex mx-auto">
              <NetworkVisualization
                data={graphData}
                onNodeClick={handleNodeClick}
                centerNodeId={centerNodeId}
              />
            </div>
          )
        )}

        {flowchartImage && (
          <div className="mt-8 w-full max-w-6xl bg-gray-50 rounded-xl shadow-lg p-8">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Research Flowchart
              </h2>
              <p className="text-gray-600">Visualized using Mermaid.js</p>
            </div>
            <div className="overflow-x-auto rounded-lg border-2 border-gray-200">
              <div
                className="w-full overflow-x-auto"
                style={{ transform: 'scale(1.5)', transformOrigin: '0 0' }}
              >
                <img
                  src={flowchartImage}
                  alt="Generated Flowchart"
                  className="w-full h-auto"
                  style={{ minWidth: '1200px' }}
                />
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default React.memo(Home);