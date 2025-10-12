import { forwardRef, useImperativeHandle, useState } from 'react';

/**
 * SearchBar component for searching with two parameters.
 *
 * @param {*} param0 - Props containing onSearch callback and searchEndpoint URL.
 * @returns {JSX.Element} The rendered SearchBar component.
 */
const SearchBar = forwardRef(({ onSearch, searchEndpoint, placeholder1, placeholder2 }, ref) => {
  const [query1, setQuery1] = useState('');
  const [query2, setQuery2] = useState('');

  const handleSearch = async () => {
    const params = new URLSearchParams();
    if (query1) params.append('q1', query1);
    if (query2) params.append('q2', query2);

    const endpoint = `${searchEndpoint}?${params.toString()}`;
    try {
      const response = await fetch(endpoint);

      if (!response.ok) {
        console.error(`Search failed with status: ${response.status} ${response.statusText}`);
        throw new Error(`HTTP Error: ${response.status}`);
      }
      const data = await response.json();
      if (onSearch) onSearch(data);
    } catch (error) {
      console.error('Search failed:', error);
      if (onSearch) onSearch([]);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSearch();
  };

  // Expose handleSearch to parent via ref
  useImperativeHandle(ref, () => ({
    triggerSearch: handleSearch
  }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '18vw' }}>
      <input
        type="text"
        className="search-textbox"
        placeholder={placeholder1}
        value={query1}
        onChange={(e) => setQuery1(e.target.value)}
        onKeyDown={handleKeyDown}
      />
      <input
        type="text"
        className="search-textbox"
        placeholder={placeholder2}
        value={query2}
        onChange={(e) => setQuery2(e.target.value)}
        onKeyDown={handleKeyDown}
      />
    </div>
  );
});

export default SearchBar;
