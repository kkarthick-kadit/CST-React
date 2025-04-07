// App.jsx - Main Application Component
import React, { useState, useEffect } from 'react';
import SearchContainer from './components/SearchContainer';
import ResultsContainer from './components/ResultsContainer';

function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [kValue, setKValue] = useState(5);
  const [anotherSource, setAnotherSource] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Get URL parameters when component mounts
    const urlParams = new URLSearchParams(window.location.search);
    const initialQuery = urlParams.get('query');
    const initialK = urlParams.get('k');
    const initialSource = urlParams.get('from_another_source');
    
    // Set initial values from URL parameters if available
    if (initialK) {
      setKValue(parseInt(initialK));
    }
    
    if (initialSource === 'true') {
      setAnotherSource(true);
    }
    
    if (initialQuery) {
      setSearchQuery(initialQuery);
      performSearch(initialQuery);
    }
  }, []);

  // Debounced search function
  const debouncedSearch = (query) => {
    setSearchQuery(query);
    
    if (!query || query.trim() === '') {
      setSearchResults([]);
      return;
    }
    
    performSearch(query);
  };

  // Function to perform the actual search
  const performSearch = async (query,sourceOverride = anotherSource) => {
    if (!query || query.trim() === '') {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Build the query URL with all parameters
      const searchUrl = `http://localhost:8000/search?query=${encodeURIComponent(query)}&k=${kValue}&from_another_source=${sourceOverride}`;
      
      const response = await fetch(searchUrl);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      
      const data = await response.json();
      setSearchResults(data.results || []);
    } catch (error) {
      console.error('Error performing search:', error);
      setError('An error occurred while searching.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle changes to k value
  const handleKValueChange = (newValue) => {
    setKValue(newValue);
    if (searchQuery.trim() !== '') {
      performSearch(searchQuery);
    }
  };

  // Handle changes to another source toggle
  const handleSourceToggleChange = (checked) => {
    setAnotherSource(checked);
    if (searchQuery.trim() !== '') {
      performSearch(searchQuery,checked);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md p-6">
        <SearchContainer 
          searchQuery={searchQuery}
          onSearchChange={debouncedSearch}
          kValue={kValue}
          onKValueChange={handleKValueChange}
          anotherSource={anotherSource}
          onSourceToggleChange={handleSourceToggleChange}
        />
        <ResultsContainer 
          results={searchResults}
          isLoading={isLoading}
          error={error}
        />
      </div>
    </div>
  );
}

export default App;