import React, { useState } from 'react';

function PaperSearch({ onSearch }) {
  const [arxivId, setArxivId] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(arxivId);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Enter arXiv ID (e.g., 2104.08730)"
        value={arxivId}
        onChange={(e) => setArxivId(e.target.value)}
      />
      <button type="submit">Search Paper</button>
    </form>
  );
}

export default PaperSearch;