import React, { useState, useEffect, useCallback} from "react";
import _debounce from 'lodash/debounce';
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
  return text.split(regex).map((part, i) =>
    regex.test(part) ? <strong key={i}>{part}</strong> : part
  );
};

const App = () => {
  const [query, setQuery] = useState("");
  const [filteredData, setFilteredData] = useState([]);
  const [finalResults, setFinalResults] = useState([]); // Stores results when Enter is pressed

  // debounce code
      function handleDebounceFn(inputValue) {
          console.log("making api request now", inputValue)
          if (!inputValue) {
            setFilteredData([]);
            return;
          }
      
          if (cache.get(inputValue)) {
            setFilteredData(cache.get(inputValue));
          } else {
            const filtered = data.filter((item) =>
              item.name.toLowerCase().includes(inputValue.toLowerCase())
            );
            cache.set(inputValue, filtered);
            setFilteredData(filtered);
          }
      }
      const debounceFn = useCallback(_debounce(handleDebounceFn, 300), []);

      function handleChange (event) {
          setQuery(event.target.value);
          debounceFn(event.target.value);
      };
  
     

  // Live filtering while typing
  // useEffect(() => {
  //   if (!query) {
  //     setFilteredData([]);
  //     return;
  //   }

  //   if (cache.get(query)) {
  //     setFilteredData(cache.get(query));
  //   } else {
  //     const filtered = data.filter((item) =>
  //       item.name.toLowerCase().includes(query.toLowerCase())
  //     );
  //     cache.set(query, filtered);
  //     setFilteredData(filtered);
  //   }
  // }, [query]);

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

        {/* Search Box with Icons */}
        <div className="search-container">
          <MagnifyingGlassIcon className="search-icon" />
          {/* return <input value={value} onChange={handleChange} /> */}
          <input
            type="text"
            placeholder="Type and press Enter..."
            value={query}
            onChange={handleChange}
            // onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="search-input"
          />
          {query && <XMarkIcon className="clear-icon" onClick={handleClear} />}
        </div>

        {/* Live Search Results (while typing) */}
        {query && (
          <ul className="search-results">
            {filteredData.length > 0 ? (
              filteredData.map((item) => (
                <li key={item.id} className="search-item">
                  {highlightMatch(item.name, query)}
                </li>
              ))
            ) : (
              <li className="search-item no-results">No results found</li>
            )}
          </ul>
        )}
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
