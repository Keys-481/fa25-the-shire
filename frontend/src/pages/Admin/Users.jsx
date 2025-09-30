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
  // Defined color scheme
  const backgroundColor = '#FFFFFF'
  const mainColor = '#000000'
  const accentColor = '#09347a'

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

  /** Inline styles for the component */
  const styles = {
    container: {
      backgroundColor: backgroundColor,
      minHeight: '100%',
      width: '100%',
      display: 'flex',
      flexDirection: 'row',
    },
    searchSection: {
      display: 'flex',
      flexDirection: 'column',
    },
    resultsSection: {
      display: 'flex',
      flexDirection: 'column',
      marginLeft: '20%',
      alignItems: 'left',
    },
    h2: {
      margin: '2px',
      color: mainColor,
      fontSize: '22px',
      marginLeft: '10px',
      fontFamily: 'Arial, sans-serif',
    },
    h3: {
      margin: '2px',
      color: mainColor,
      fontSize: '18px',
      marginLeft: '5px',
      fontFamily: 'Arial, sans-serif',
      fontWeight: 'bold',
      position: 'relative',
      width: '60vw',
    },
    hhorizontalLine: {
      position: 'relative',
      width: '60vw',
      height: '2px',
      backgroundColor: mainColor,
      marginBottom: '10px',
      right: '17.5vw'
    },
    addButton: {
      padding: '6px 12px',
      backgroundColor: accentColor,
      color: backgroundColor,
      border: `2px solid ${mainColor}`,
      borderRadius: '5px',
      fontSize: '14px',
      cursor: 'pointer',
      marginBottom: '5px',
      marginRight: '10px',
      marginLeft: '10px',
    },
    h3Row: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      width: '60vw',
      position: 'relative',
      right: '17.5vw',
      marginTop: '20px',
    },
    textboxRow: {
      display: 'flex',
      justifyContent: 'left',
      alignItems: 'center',
      width: '60vw',
      position: 'relative',
      right: '17.5vw',
      marginTop: '10px',
    },
  }

  return (
    <div>
      <AdminNavBar />
      <h2 style={styles.h2}>Users</h2>
      <div style={{ width: '100%', height: '2px', backgroundColor: mainColor }}></div>
      <div style={{ width: '2px', height: 'calc(100vh - 100px)', backgroundColor: mainColor, position: 'absolute', top: '100px', left: '20vw' }} />

      <div style={styles.container}>
        <div style={styles.searchSection}>

          <SearchBar onSearch={handleSearchResults} searchEndpoint={searchEndpoint} placeholder1="Privilege Type" placeholder2="Name" />
          <div style={{ position: 'absolute', width: '20vw', height: '2px', backgroundColor: mainColor, marginTop: '105px', right: '80vw' }}></div>
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
        <div style={styles.resultsSection}>
          {!addingUserPrivilege ? (
            <>
              {/* Admin Section */}
              <div style={styles.h3Row}>
                <div style={styles.h3}>Admin</div>
                <button style={styles.addButton} onClick={() => { setAddingUserPrivilege(true); setPrivilegeType('admin'); }}>Add</button>
              </div>
              <div style={styles.hhorizontalLine}></div>
              {/* Displays List of Admin Users */}
              {privilegedUsers.admin.length === 0 ? (
                <p>No current users</p>
              ) : (
                <ul style={{ listStyle: 'none', paddingLeft: '10px', marginBottom: '10px' }}>
                  {privilegedUsers.admin.map((user) => (
                    <li key={user.id}>{user.name}</li>
                  ))}
                </ul>
              )}

              {/* Accounting Section */}
              <div style={styles.h3Row}>
                <div style={styles.h3}>Accounting</div>
                <button style={styles.addButton} onClick={() => { setAddingUserPrivilege(true); setPrivilegeType('accounting'); }}>Add</button>
              </div>
              <div style={styles.hhorizontalLine}></div>
              {/* Displays List of Accounting Users */}
              {privilegedUsers.accounting.length === 0 ? (
                <p>No current users</p>
              ) : (
                <ul style={{ listStyle: 'none', paddingLeft: '10px', marginBottom: '10px' }}>
                  {privilegedUsers.accounting.map((user) => (
                    <li key={user.id}>{user.name}</li>
                  ))}
                </ul>
              )}

              {/* Advisor Section */}
              <div style={styles.h3Row}>
                <div style={styles.h3}>Advisor</div>
                <button style={styles.addButton} onClick={() => { setAddingUserPrivilege(true); setPrivilegeType('advisor'); }}>Add</button>
              </div>
              <div style={styles.hhorizontalLine}></div>
              {/* Displays List of Advisor Users */}
              {privilegedUsers.advisor.length === 0 ? (
                <p>No current users</p>
              ) : (
                <ul style={{ listStyle: 'none', paddingLeft: '10px', marginBottom: '10px' }}>
                  {privilegedUsers.advisor.map((user) => (
                    <li key={user.id}>{user.name}</li>
                  ))}
                </ul>
              )}

              {/* Student Section */}
              <div style={styles.h3Row}>
                <div style={styles.h3}>Student</div>
                <button style={styles.addButton} onClick={() => { setAddingUserPrivilege(true); setPrivilegeType('student'); }}>Add</button>
              </div>
              <div style={styles.hhorizontalLine}></div>
              {/* Displays List of Student Users */}
              {privilegedUsers.student.length === 0 ? (
                <p>No current users</p>
              ) : (
                <ul style={{ listStyle: 'none', paddingLeft: '10px', marginBottom: '10px' }}>
                  {privilegedUsers.student.map((user) => (
                    <li key={user.id}>{user.name}</li>
                  ))}
                </ul>
              )}
            </>
          ) : (
            <div style={styles.resultsSection}>
              <div style={styles.h3Row}>
                <div style={styles.h3}>New {privilegeType.charAt(0).toUpperCase() + privilegeType.slice(1)}</div>
                <button style={styles.addButton} onClick={() => { /* TODO: Logic to add the privilege */ alert(`Added ${privilegeType} privilege`); setAddingUserPrivilege(false); setPrivilegeType(null); }}>Add</button>
                <button style={styles.addButton} onClick={() => { setAddingUserPrivilege(false); setPrivilegeType(null); }}>Cancel</button>
              </div>
              <div style={styles.hhorizontalLine}></div>

              {/* Person Search */}
              <div style={styles.textboxRow}>
                <p style={{ width: '100px' }}>Name:</p>
                <AdminPersonSearch onResults={setPersonResults} />
              </div>
              <div style={styles.hhorizontalLine}></div>

              {/* List of Results to select from */}
              <div style={styles.textboxRow}>
                {personResults.length === 0 ? (
                  <p>No person found.</p>
                ) : (
                  <ul style={{ listStyle: 'none', padding: 0 }}>
                    {personResults.map((person) => (
                      <li key={person.id} style={{ marginBottom: '8px' }}>
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
  )
}
