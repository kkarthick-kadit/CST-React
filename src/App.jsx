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

  // Function to perform search when submit button is clicked or suggestion is selected
  const handleSearchSubmit = (query) => {
    setSearchQuery(query);
    
    if (!query || query.trim() === '') {
      setSearchResults([]);
      return;
    }
    
    performSearch(query);
    
    // Update URL with search parameters
    const urlParams = new URLSearchParams();
    urlParams.set('query', query);
    urlParams.set('k', kValue.toString());
    urlParams.set('from_another_source', anotherSource.toString());
    
    const newUrl = `${window.location.pathname}?${urlParams.toString()}`;
    window.history.pushState({ path: newUrl }, '', newUrl);
  };

  // Function to perform the actual search
  const performSearch = async (query) => {
    if (!query || query.trim() === '') {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Build the query URL with all parameters
      const searchUrl = `http://localhost:8000/search?query=${encodeURIComponent(query)}&k=${kValue}&from_another_source=${anotherSource}`;
      
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
  };

  // Handle changes to another source toggle
  const handleSourceToggleChange = (checked) => {
    setAnotherSource(checked);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md p-6">
        <SearchContainer 
          searchQuery={searchQuery}
          onSearchSubmit={handleSearchSubmit}
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