// components/SearchContainer.jsx
import React, { useState, useEffect } from 'react';

const SearchContainer = ({ 
  searchQuery, 
  onSearchChange, 
  kValue, 
  onKValueChange, 
  anotherSource, 
  onSourceToggleChange 
}) => {
  const [inputValue, setInputValue] = useState(searchQuery);
  
  // Debounce the search input
  useEffect(() => {
    const timer = setTimeout(() => {
      if (inputValue !== searchQuery) {
        onSearchChange(inputValue);
      }
    }, 700);
    
    return () => clearTimeout(timer);
  }, [inputValue, onSearchChange, searchQuery]);
  
  // Update local state when props change
  useEffect(() => {
    setInputValue(searchQuery);
  }, [searchQuery]);
  
  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };
  
  const handleKValueChange = (e) => {
    const value = parseInt(e.target.value) || 0;
    onKValueChange(value);
  };
  
  const handleSourceToggleChange = (e) => {
    console.log('Toggle clicked, checked:', e.target.checked); 
    onSourceToggleChange(e.target.checked);
  };
  
  
  return (
    <div className="w-full">
      <h1 className="text-2xl font-bold mb-4">CST Search</h1>
      <input 
        type="text" 
        value={inputValue}
        onChange={handleInputChange}
        className="w-full p-3 text-base border border-gray-300 rounded-md mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
        placeholder="Search proteins, genes, or UniProt IDs..." 
        autoComplete="off"
      />
      <div className="flex justify-between items-center mb-5">
        <div className="flex items-center">
          <span className="mr-2 text-sm text-gray-600">Results limit (k):</span>
          <input 
            type="number" 
            value={kValue} 
            onChange={handleKValueChange}
            className="w-16 p-2 text-sm border border-gray-300 rounded-md" 
            min="1" 
            max="100"
          />
        </div>
        <div className="flex items-center">
          <span className="mr-2 text-sm text-gray-600">From another source:</span>
          <label className="relative inline-block w-12 h-6">
            <input 
              type="checkbox" 
              className="opacity-0 w-0 h-0"
              checked={anotherSource}
              onChange={handleSourceToggleChange}
            />
            <span className={`absolute cursor-pointer top-0 left-0 right-0 bottom-0 rounded-full transition-colors duration-300 ease-in-out ${anotherSource ? 'bg-green-500' : 'bg-gray-300'}`}>
              <span 
                className={`absolute w-4 h-4 bg-white rounded-full transition-transform duration-300 ease-in-out top-1 left-1 ${anotherSource ? 'transform translate-x-6' : ''}`}
              ></span>
            </span>
          </label>
        </div>
      </div>
    </div>
  );
};

export default SearchContainer;
