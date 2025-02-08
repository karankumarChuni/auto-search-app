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
  return text.split(regex).map((part, i) =>
    regex.test(part) ? <strong key={i}>{part}</strong> : part
  );
};

const App = () => {
  const [query, setQuery] = useState("");
  const [filteredData, setFilteredData] = useState([]);

  useEffect(() => {
    const handler = setTimeout(() => {
      if (cache.get(query)) {
        setFilteredData(cache.get(query));
      } else {
        const filtered = data.filter((item) =>
          item.name.toLowerCase().includes(query.toLowerCase())
        );
        cache.set(query, filtered);
        setFilteredData(filtered);
      }
    }, 300);
    return () => clearTimeout(handler);
  }, [query]);

  const handleClear = () => {
    setQuery("");
    setFilteredData([]);
  };

  return (
    <div className="main-container">
      <div className="container">
        <h1 className="text-heading">SearchPro</h1>

        {/* Search Box with Icons */}
        <div className="search-container">
          <MagnifyingGlassIcon className="search-icon" />
          <input
            type="text"
            placeholder="Search..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="search-input"
          />
          {query && <XMarkIcon className="clear-icon" onClick={handleClear} />}
        </div>

        {/* Search Results */}
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
    </div>
  );
};

export default App;
