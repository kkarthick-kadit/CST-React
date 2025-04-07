
// components/ResultsContainer.jsx
import React from 'react';
import ResultItem from './ResultItem';

const ResultsContainer = ({ results, isLoading, error }) => {
  if (isLoading) {
    return (
      <div className="border-t border-gray-200 pt-3">
        <div className="text-center py-5 text-gray-500">Searching...</div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="border-t border-gray-200 pt-3">
        <div className="text-center py-5 text-gray-500">{error}</div>
      </div>
    );
  }
  
  if (!results || results.length === 0) {
    return (
      <div className="border-t border-gray-200 pt-3">
        <div className="text-center py-5 text-gray-500">No results found.</div>
      </div>
    );
  }
  
  return (
    <div className="border-t border-gray-200 pt-3">
      {results.map((result, index) => (
        <ResultItem key={index} result={result} />
      ))}
    </div>
  );
};

export default ResultsContainer;

