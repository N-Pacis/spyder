import React from "react";
import "../App.css";
import Navbar from "../components/Navbar";

const Mission = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br spyder-app text-white">
      <Navbar />
      <main className="flex-grow flex flex-col justify-center items-center px-4 py-8">
        <div className="bg-opacity-70 p-8 rounded-lg max-w-3xl w-full">
          <h1 className="text-4xl text-center font-bold mb-8">Our Mission</h1>
          <div className="text-lg mb-8">
            <p>
              At Spyder, our mission is to democratize academic research by
              making it more accessible and actionable for researchers from all
              disciplines. We believe that groundbreaking research should not be
              confined to those with extensive technical skills, but should be
              available to anyone looking to further their knowledge. Spyder
              simplifies the complexity of academic papers, providing a powerful
              visualization tool that helps researchers, students, and
              professionals alike explore new ideas, track the influence of key
              research, and find potential collaborators based on shared
              methodologies and research interests.
            </p>
            <p className="mt-4">
              We are committed to enhancing the research experience by breaking
              down barriers and making it easier for people to engage with
              complex academic material. By incorporating advanced technologies
              such as OCR and NLP, we transform even physical papers into
              interactive, easy-to-navigate insights, making research inclusive
              for all. Our vision is to build a future where knowledge flows
              freely, across borders, disciplines, and generations.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Mission;
