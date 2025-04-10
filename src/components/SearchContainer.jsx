import React, { useState, useEffect, useRef } from 'react';

const SearchContainer = ({ 
  searchQuery, 
  onSearchSubmit, 
  kValue, 
  onKValueChange, 
  anotherSource, 
  onSourceToggleChange 
}) => {
  const [inputValue, setInputValue] = useState(searchQuery);
  const [suggestions, setSuggestions] = useState({
    symbolSuggester: [],
    groupNameBlendSuggester: [],
    pageTitleBlendSuggester: [],
    prevSymbolSuggester: [],
    nameBlendSuggester: [],
    aliasSymbolSuggester: []
  });
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionsRef = useRef(null);
  
  // Fetch suggestions with debounce
  useEffect(() => {
    if (!inputValue || inputValue.trim() === '') {
      setSuggestions({
        symbolSuggester: [],
        groupNameBlendSuggester: [],
        pageTitleBlendSuggester: [],
        prevSymbolSuggester: [],
        nameBlendSuggester: [],
        aliasSymbolSuggester: []
      });
      return;
    }
    
    const timer = setTimeout(() => {
      fetchSuggestions(inputValue);
    }, 300);
    
    return () => clearTimeout(timer);
  }, [inputValue]);
  
  // Handle clicks outside the suggestions dropdown to close it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Fetch suggestions from API
  const fetchSuggestions = async (query) => {
    try {
      // Replace with your actual suggestions API endpoint
      const response = await fetch(`http://host.docker.internal:8000/suggest?query=${encodeURIComponent(query)}`);
      if (!response.ok) {
        throw new Error('Failed to fetch suggestions');
      }
      const data = await response.json();
      setSuggestions(data.results);
      setShowSuggestions(true);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    }
  };
  
  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };
  
  // Extract the term from suggestion object or use suggestion directly if it's a string
  const getSuggestionTerm = (suggestion) => {
    if (typeof suggestion === 'object' && suggestion !== null) {
      return suggestion.term || suggestion.payload || '';
    }
    return suggestion;
  };
  
  // Convert HTML entities and strip HTML tags for clean display
  const cleanHtmlContent = (content) => {
    if (typeof content !== 'string') return '';
    
    // Decode HTML entities like \u003C to < and \u003E to >
    const decodedContent = content
      .replace(/\\u003C/g, '<')
      .replace(/\\u003E/g, '>')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>');
    
    // Strip HTML tags for search input value
    const plainText = decodedContent.replace(/<\/?[^>]+(>|$)/g, '');
    
    return plainText;
  };
  
  // Get clean term for displaying and searching
  const getCleanTerm = (suggestion) => {
    const term = getSuggestionTerm(suggestion);
    return cleanHtmlContent(term);
  };
  
  // Get term with HTML formatting for display in dropdown (allows bold highlights)
  const getFormattedTerm = (suggestion) => {
    const term = getSuggestionTerm(suggestion);
    if (typeof term !== 'string') return '';
    
    // Decode HTML entities but keep tags for formatting
    return term
      .replace(/\\u003C/g, '<')
      .replace(/\\u003E/g, '>')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>');
  };
  
  const handleSuggestionClick = (suggestion) => {
    const term = getCleanTerm(suggestion);
    setInputValue(term);
    setShowSuggestions(false);
    onSearchSubmit(term);
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    onSearchSubmit(inputValue);
    setShowSuggestions(false);
  };
  
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onSearchSubmit(inputValue);
      setShowSuggestions(false);
    }
  };
  
  const handleKValueChange = (e) => {
    const value = parseInt(e.target.value) || 0;
    onKValueChange(value);
  };
  
  const handleSourceToggleChange = (e) => {
    onSourceToggleChange(e.target.checked);
  };
  
  // Check if a suggestions array has items
  const hasSuggestions = (array) => {
    return Array.isArray(array) && array.length > 0;
  };
  
  // Render suggestion section if it has data
  const renderSuggestionSection = (suggestions, title, keyPrefix) => {
    if (!hasSuggestions(suggestions)) return null;
    
    return (
      <div>
        <div className="px-4 py-2 bg-gray-100 text-sm font-semibold">{title}</div>
        {suggestions.map((suggestion, index) => {
          const formattedTerm = getFormattedTerm(suggestion);
          return (
            <div 
              key={`${keyPrefix}-${index}`}
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
              onClick={() => handleSuggestionClick(suggestion)}
              dangerouslySetInnerHTML={{ __html: formattedTerm }}
            />
          );
        })}
      </div>
    );
  };
  
  // Check if any suggestion category has items
  const hasAnySuggestions = Object.values(suggestions).some(category => 
    Array.isArray(category) && category.length > 0
  );
  
  return (
    <div className="w-full">
      <h1 className="text-2xl font-bold mb-4">CST Search</h1>
      <div className="relative" ref={suggestionsRef}>
        <form onSubmit={handleSubmit}>
          <div className="flex">
            <input 
              type="text" 
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              className="w-full p-3 text-base border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
              placeholder="Search proteins, genes, or UniProt IDs..." 
              autoComplete="off"
            />
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-r-md transition-colors duration-200"
            >
              Search
            </button>
          </div>
        </form>
        
        {showSuggestions && hasAnySuggestions && (
          <div className="absolute z-10 w-full bg-white mt-1 border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
            {renderSuggestionSection(suggestions.symbolSuggester, "Symbols", "symbol")}
            {renderSuggestionSection(suggestions.nameBlendSuggester, "Names", "name")}
            {renderSuggestionSection(suggestions.aliasSymbolSuggester, "Alias Symbols", "alias")}
            {renderSuggestionSection(suggestions.prevSymbolSuggester, "Previous Symbols", "prev")}
            {renderSuggestionSection(suggestions.pageTitleBlendSuggester, "Page Titles", "title")}
            {renderSuggestionSection(suggestions.groupNameBlendSuggester, "Group Names", "group")}
          </div>
        )}
      </div>
      
      <div className="flex justify-between items-center mt-3 mb-5">
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