import React, { useState, useEffect } from "react";
import data from "../data.json";
import { MagnifyingGlassIcon, XMarkIcon } from "@heroicons/react/24/solid";

// LRU Cache Implementation to store recent search results (max size 10)
const LRUCache = (maxSize) => {
  const cache = new Map();
  return {
    get: (key) => {
      if (cache.has(key)) {
        const value = cache.get(key);
        cache.delete(key);
        cache.set(key, value); // Move the accessed key to the end (most recently used)
        return value;
      }
      return null;
    },
    set: (key, value) => {
      if (cache.size >= maxSize) {
        const firstKey = cache.keys().next().value;
        cache.delete(firstKey); // Remove the least recently used key
      }
      cache.set(key, value);
    },
  };
};

const cache = LRUCache(10);

// Function to highlight the matching substring in the search results
const highlightMatch = (text, query) => {
  if (!query) return text;
  const regex = new RegExp(`(${query})`, "gi");
  const highlightedText = text.replace(regex, `<strong>$1</strong>`);
  return <span dangerouslySetInnerHTML={{ __html: highlightedText }} />;
};

const App = () => {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState(""); // Debounced query
  const [filteredData, setFilteredData] = useState([]);
  const [finalResults, setFinalResults] = useState([]); // Stores results when Enter is pressed

  // Debounce the query input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);

    return () => clearTimeout(handler); // Cleanup on re-render
  }, [query]);

  // Live filtering while typing (with LRU Cache usage)
  useEffect(() => {
    if (!debouncedQuery) {
      setFilteredData([]);
      return;
    }

    if (cache.get(debouncedQuery)) {
      setFilteredData(cache.get(debouncedQuery));
    } else {
      const filtered = data.filter((item) =>
        item.name.toLowerCase().includes(debouncedQuery.toLowerCase())
      );
      cache.set(debouncedQuery, filtered);
      setFilteredData(filtered);
    }
  }, [debouncedQuery]);

  // Handle Enter key press: store results and clear search box
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      setFinalResults(filteredData);
      setQuery("");
      setFilteredData([]);
    }
  };

  // Clear search input and results
  const handleClear = () => {
    setQuery("");
    setFilteredData([]);
    setFinalResults([]);
  };

  return (
    <div className="main-container">
      <div className="container">
        <h1 className="text-heading">SearchPro</h1>

        {/* Search Box with Live Search Results */}
        <div className="search-container">
          <MagnifyingGlassIcon className="search-icon" />
          <input
            type="text"
            placeholder="Type and press Enter..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="search-input"
          />
          {query && <XMarkIcon className="clear-icon" onClick={handleClear} />}

          {/* Live Search Results (as dropdown) */}
          {query && filteredData.length > 0 && (
            <ul className="search-results-dropdown">
              {filteredData.map((item) => (
                <li key={item.id} className="search-item">
                  <MagnifyingGlassIcon className="search-item-icon" />
                  {highlightMatch(item.name, query)}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Final Search Output (only after Enter is pressed) */}
      {finalResults.length > 0 && (
        <div className="final-results-container">
          <h2 className="final-results-heading">Final Search Output:</h2>
          <ul className="final-results">
            {finalResults.map((item) => (
              <li key={item.id} className="final-result-item">
                {highlightMatch(item.name, query)}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default App;
