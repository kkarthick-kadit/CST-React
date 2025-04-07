// components/ResultItem.jsx
import React from 'react';

const ResultItem = ({ result }) => {
  // Function to safely get a property from an object
  const safeGetProperty = (obj, propPath, defaultValue = 'N/A') => {
    if (!obj) return defaultValue;
    
    // Handle property names with special characters or bracket notation
    if (propPath.includes('#')) {
      // Use bracket notation for properties with special characters
      return obj["Reference #"] || defaultValue;
    }
    
    return obj[propPath] || defaultValue;
  };
  
  // Function to extract UniProt ID from a string (either direct ID or full URL)
  const extractUniProtId_from_hgnc = (value) => {
    if (!value) return 'N/A';
  
    if (typeof value === 'string' && value.includes('uniprot.org')) {
      // Extract the ID part from the URL
      return value;
    }
  
    // Otherwise, return the value as is (assuming it's just the ID)
    return `https://www.uniprot.org/uniprotkb/${value}`;
  };

  
  // Extract protein name (first synonym if available)
  const synonyms = result.text ? result.text.split(';').map(s => s.trim()) : [];
  const proteinName = synonyms.length > 0 ? synonyms[0] : 'Unknown Protein';
  
  // Get the metadata safely
  const organism = safeGetProperty(result.metadata, 'Organism', 'Unknown');
  const geneSymbols = safeGetProperty(result.metadata, 'Gene Symbols') || 
                    safeGetProperty(result.metadata, 'Gene_Symbols');
  const hgncid = safeGetProperty(result.metadata, "HGNC_ID");
  const source = safeGetProperty(result.metadata, "Source");
  
  // Get and process UniProt ID
  let rawUniprotValue = result.metadata ? 
    (result.metadata["Reference #"] || 'N/A') : 'N/A';
  const uniprotId = extractUniProtId_from_hgnc(rawUniprotValue);
  console.log(rawUniprotValue, uniprotId)
  
  return (
    <div className="py-4 px-3 border-b border-gray-200 cursor-pointer transition-colors duration-200 hover:bg-gray-50">
      <div className="text-lg font-bold mb-1">{proteinName}</div>
      <div className="text-sm text-gray-600">{organism}</div>
      <div className="mt-2 flex flex-wrap gap-2">
        <span className="text-sm text-gray-500">gene</span>
        <span className="text-sm">{geneSymbols}</span>
        <span className="text-sm text-gray-500">Source</span>
        <span className="text-sm">{source}</span>
        <span className="text-sm text-gray-500">uniprot</span>
        <a 
          href={uniprotId} 
          className="text-sm text-red-600 hover:underline" 
          target="_blank" 
          rel="noopener noreferrer"
        >
          {uniprotId}
        </a>
        <span className="text-sm text-gray-500">HGNC ID</span>
        <a 
          href={`https://www.genenames.org/data/gene-symbol-report/#!/hgnc_id/HGNC:${hgncid}`} 
          className="text-sm text-red-600 hover:underline" 
          target="_blank"
          rel="noopener noreferrer"
        >
          {hgncid}
        </a>
      </div>
      {synonyms.length > 1 && (
        <div className="mt-2 text-sm text-gray-500">
          <span className="mr-1">synonyms</span>
          {synonyms.slice(1).join(', ')}
        </div>
      )}
    </div>
  );
};

export default ResultItem;