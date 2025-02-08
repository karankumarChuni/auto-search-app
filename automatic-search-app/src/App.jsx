import React, { useState, useEffect } from "react";
import data from "../data.json";
import { MagnifyingGlassIcon, XMarkIcon } from "@heroicons/react/24/solid";

// LRU Cache Implementation
const LRUCache = (maxSize) => {
  const cache = new Map();
  return {
    get: (key) => {
      if (cache.has(key)) {
        const value = cache.get(key);
        cache.delete(key);
        cache.set(key, value);
        return value;
      }
      return null;
    },
    set: (key, value) => {
      if (cache.size >= maxSize) {
        const firstKey = cache.keys().next().value;
        cache.delete(firstKey);
      }
      cache.set(key, value);
    },
  };
};

const cache = LRUCache(10);

// Highlight matching search term
const highlightMatch = (text, query) => {
  if (!query) return text;

  const regex = new RegExp(`(${query})`, "gi");
  const highlightedText = text.replace(regex, `<strong>$1</strong>`);

  return <span dangerouslySetInnerHTML={{ __html: highlightedText }} />;
};

const App = () => {
  const [query, setQuery] = useState("");
  const [filteredData, setFilteredData] = useState([]);
  const [finalResults, setFinalResults] = useState([]); // Stores results when Enter is pressed

  // Live filtering while typing
  useEffect(() => {
    if (!query) {
      setFilteredData([]);
      return;
    }

    if (cache.get(query)) {
      setFilteredData(cache.get(query));
    } else {
      const filtered = data.filter((item) =>
        item.name.toLowerCase().includes(query.toLowerCase())
      );
      cache.set(query, filtered);
      setFilteredData(filtered);
    }
  }, [query]);

  // Handle Enter Key to set final results & clear search
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      setFinalResults(filteredData); // Store the current search results as final output
      setQuery(""); // Clear search input
      setFilteredData([]); // Clear live search results
    }
  };

  const handleClear = () => {
    setQuery("");
    setFilteredData([]);
    setFinalResults([]); // Clear everything
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
