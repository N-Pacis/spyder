import React from 'react';

function PaperDetails({ paper,  collaboratorSuggestions }) {
  if (!paper) {
    return <div className="text-center text-gray-400 italic">Select a paper to view details</div>;
  }

  return (
    <div className="paper-details bg-gray-800 p-6 rounded-lg shadow-md text-white max-w-3xl mx-auto mt-4">
      <h2 className="text-2xl font-semibold mb-4 text-accent-color">{paper.title}</h2>
      
      <p className="mb-2">
        <strong className="text-gray-300">Authors:</strong> {paper.authors.join(', ')}
      </p>
      
      <p className="mb-2">
        <strong className="text-gray-300">Categories:</strong> {paper.categories.join(', ')}
      </p>
      
      <p className="mb-4">
        <strong className="text-gray-300">Abstract:</strong> {paper.abstract}
      </p>
      
      <a 
        href={paper.link} 
        target="_blank" 
        rel="noopener noreferrer" 
        className="inline-block bg-accent-color text-white px-4 py-2 rounded-md hover:bg-accent-color-dark transition-colors"
      >
        View on arXiv
      </a>

      {collaboratorSuggestions && collaboratorSuggestions.length > 0 && (
        <div className="collaborator-suggestions">
          <h3>Potential Collaborators</h3>
          <ul>
            {collaboratorSuggestions.map((collaborator, index) => (
              <li key={index}>
                <strong>{collaborator.name}</strong> (Similarity Score: {collaborator.score})
                <br />
                <em>Reason: {collaborator.reason}</em>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default PaperDetails;
