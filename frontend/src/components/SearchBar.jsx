import { useState } from 'react'

/**
 * SearchBar component for searching with two parameters.
 *
 * @param {*} param0 - Props containing onSearch callback and searchEndpoint URL.
 * @returns {JSX.Element} The rendered SearchBar component.
 */
export default function SearchBar({ onSearch, searchEndpoint, placeholder1, placeholder2 }) {
  const [query1, setQuery1] = useState('')
  const [query2, setQuery2] = useState('')

  const handleSearch = async () => {
    const params = new URLSearchParams()
    if (query1) params.append('q1', query1)
    if (query2) params.append('q2', query2)

    const endpoint = `${searchEndpoint}?${params.toString()}`
    try {
      const response = await fetch(endpoint)

      if (!response.ok) {
        console.error(`Search failed with status: ${response.status} ${response.statusText}`)
        throw new Error(`HTTP Error: ${response.status}`)
      }
      const data = await response.json()
      if (onSearch) onSearch(data)
    } catch (error) {
      console.error('Search failed:', error)
      if (onSearch) onSearch([])
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSearch()
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '18vw' }}>
      <input
        type="text"
        placeholder={placeholder1}
        value={query1}
        onChange={(e) => setQuery1(e.target.value)}
        onKeyDown={handleKeyDown}
        style={inputStyle}
      />
      <input
        type="text"
        placeholder={placeholder2}
        value={query2}
        onChange={(e) => setQuery2(e.target.value)}
        onKeyDown={handleKeyDown}
        style={inputStyle}
      />
    </div>
  )
}

// Defined color scheme
const backgroundColor = '#FFFFFF'
const mainColor = '#000000'
const accentColor = '#09347a'

const inputStyle = {
  padding: '10px',
  fontSize: '16px',
  borderRadius: '50px',
  border: `1px solid ${mainColor}`,
  backgroundColor: backgroundColor,
  color: accentColor,
  marginTop: '5px',
}
