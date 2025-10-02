import { useState } from 'react'

/**
 * AdminPersonSearch component allows admins to search for users by name.
 * @param {*} param0 - The props object.
 * @returns {JSX.Element} The rendered component.
 */
export default function AdminPersonSearch({ onResults }) {
  const [query, setQuery] = useState('')

  /**
   * Handles the key down event for the search input.
   * @param {*} e - The keyboard event.
   */
  const handleKeyDown = async (e) => {
    if (e.key === 'Enter') {
      const endpoint = `/users/search?name=${encodeURIComponent(query)}`
      try {
        const response = await fetch(endpoint)
        const data = await response.json()
        onResults(data)
      } catch (error) {
        console.error('Search failed:', error)
        onResults([])
      }
    }
  }

  return (
    <input
      type="text"
      placeholder="Search for name"
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      onKeyDown={handleKeyDown}
      className='textbox'
      style={{ marginBottom: '5px' }}
    />
  )
}
