import { useEffect, useState } from 'react'
import AdminPersonSearch from '../../components/AdminPersonSearch'
import AdminNavBar from '../../components/NavBars/AdminNavBar'
import SearchBar from '../../components/SearchBar'


/**
 * AdminUsers component displays the Users page for admin users.
 * 
 * @component
 * @returns {JSX.Element} A simple admin view for managing or viewing users
 */
export default function AdminUsers() {
  const [results, setResults] = useState([])
  const [addingUserPrivilege, setAddingUserPrivilege] = useState(null)
  const [privilegeType, setPrivilegeType] = useState(null)
  const [personResults, setPersonResults] = useState([])
  const [selectedPersonId, setSelectedPersonId] = useState(null)
  const [privilegedUsers, setPrivilegedUsers] = useState({
    admin: [],
    accounting: [],
    advisor: [],
    student: [],
  })

  /**
   * Fetches users categorized by their privilege levels from the backend.
   * Updates the privilegedUsers state with the fetched data.
   * Handles any errors that occur during the fetch operation.
   */
  const fetchPrivilegedUsers = async () => {
    try {
      const response = await fetch('/users/by-privilege') // TODO: Fix endpoint to match backend
      const data = await response.json()
      setPrivilegedUsers(data)
    } catch (error) {
      console.error('Failed to fetch privileged users:', error)
    }
  }


  /**
   * Handles the search results from the user search.
   * @param {*} results - The search results returned from the API.
   */
  const handleSearchResults = (results) => {
    setResults(results)
  }

  /**
   * Handles the search results from the person search.
   * @param {*} results - The search results returned from the API.
   */
  const handlePersonSearchResults = (results) => {
    setPersonResults(results)
  }

  /**
   * Fetch privileged users when the component mounts.
   */
  useEffect(() => {
    fetchPrivilegedUsers()
  }, [])


  // TODO: Make sure endpoint for searching users matches backend
  const searchEndpoint = '/users/search'

  return (
    <div>
      <AdminNavBar />
      <div className='window'>
        <div className='title-bar'>
          <h1>Users</h1>
        </div>
        <div className='container'>
          <div className='side-panel'>
            <SearchBar onSearch={handleSearchResults} searchEndpoint={searchEndpoint} placeholder1="Privilege Type" placeholder2="Name" />
            <div className="horizontal-line-half"></div>
            <div className="side-panel-results">
              <div>
                {results.length === 0 ? (
                  <p>No results found</p>
                ) : (
                  <ul>
                    {results.map((item, index) => (
                      <li key={index}>
                        {item.id} - {item.name}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
          <div className='section-results'>
            {!addingUserPrivilege ? (
              <div className="section-results-side">
                {/* Admin Section */}
                <div className='h2-row'>
                  <h2>Admin</h2>
                  <button onClick={() => { setAddingUserPrivilege(true); setPrivilegeType('admin'); }}>Add</button>
                </div>
                <div className='horizontal-line'></div>
                {/* Displays List of Admin Users */}
                {privilegedUsers.admin.length === 0 ? (
                  <p>No current users</p>
                ) : (
                  <ul>
                    {privilegedUsers.admin.map((user) => (
                      <li key={user.id}>{user.name}</li>
                    ))}
                  </ul>
                )}

                {/* Accounting Section */}
                <div className='h2-row'>
                  <h2>Accounting</h2>
                  <button onClick={() => { setAddingUserPrivilege(true); setPrivilegeType('accounting'); }}>Add</button>
                </div>
                <div className='horizontal-line'></div>
                {/* Displays List of Accounting Users */}
                {privilegedUsers.accounting.length === 0 ? (
                  <p>No current users</p>
                ) : (
                  <ul>
                    {privilegedUsers.accounting.map((user) => (
                      <li key={user.id}>{user.name}</li>
                    ))}
                  </ul>
                )}

                {/* Advisor Section */}
                <div className='h2-row'>
                  <h2>Advisor</h2>
                  <button onClick={() => { setAddingUserPrivilege(true); setPrivilegeType('advisor'); }}>Add</button>
                </div>
                <div className='horizontal-line'></div>
                {/* Displays List of Advisor Users */}
                {privilegedUsers.advisor.length === 0 ? (
                  <p>No current users</p>
                ) : (
                  <ul>
                    {privilegedUsers.advisor.map((user) => (
                      <li key={user.id}>{user.name}</li>
                    ))}
                  </ul>
                )}

                {/* Student Section */}
                <div className='h2-row'>
                  <h2>Student</h2>
                  <button onClick={() => { setAddingUserPrivilege(true); setPrivilegeType('student'); }}>Add</button>
                </div>
                <div className='horizontal-line'></div>
                {/* Displays List of Student Users */}
                {privilegedUsers.student.length === 0 ? (
                  <p>No current users</p>
                ) : (
                  <ul>
                    {privilegedUsers.student.map((user) => (
                      <li key={user.id}>{user.name}</li>
                    ))}
                  </ul>
                )}
              </div>
            ) : (
              <div className="section-results-side">
                <div className='h2-row'>
                  <h2>New {privilegeType.charAt(0).toUpperCase() + privilegeType.slice(1)}</h2>
                  <button onClick={() => { /* TODO: Logic to add the privilege */ alert(`Added ${privilegeType} privilege`); setAddingUserPrivilege(false); setPrivilegeType(null); }}>Add</button>
                  <button onClick={() => { setAddingUserPrivilege(false); setPrivilegeType(null); }}>Cancel</button>
                </div>
                <div className='horizontal-line'></div>

                {/* Person Search */}
                <div className='textbox-row'>
                  <p className='layout'>Name:</p>
                  <AdminPersonSearch onResults={setPersonResults} />
                </div>
                <div className='horizontal-line'></div>

                {/* List of Results to select from */}
                <div className='textbox-row'>
                  {personResults.length === 0 ? (
                    <p>No person found.</p>
                  ) : (
                    <ul>
                      {personResults.map((person) => (
                        <li>
                          <label>
                            <input
                              type="checkbox"
                              checked={selectedPersonId === person.id}
                              onChange={() => setSelectedPersonId(person.id)}
                            />
                            {person.name}
                          </label>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
