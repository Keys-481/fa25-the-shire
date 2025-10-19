
import { useEffect, useState } from 'react';
import AdminNavBar from '../../components/NavBars/AdminNavBar';
import SearchBar from '../../components/SearchBar';

export default function AdminUsers() {
  const [allUsers, setAllUsers] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [roles, setRoles] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);

  const searchEndpoint = '/users/search'

/**
 * Fetches all users and roles from the backend on component mount.
 * Initializes role toggle states.
 */
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersRes, rolesRes] = await Promise.all([
          fetch('/users/all'),
          fetch('/users/roles')
        ]);

        const usersData = await usersRes.json();
        const rolesData = await rolesRes.json();

        setAllUsers(usersData);
        setRoles(rolesData);

        // Initialize toggle state for each role
        const initialToggles = {};
        rolesData.forEach(role => {
          initialToggles[role] = false;
        });
        setRoleToggles(initialToggles);
      } catch (err) {
        console.error('Failed to fetch data:', err);
      }
    };

    fetchData();
  }, []);

/**
 * Callback for handling search results from the SearchBar component.
 * @param {Array} results - Array of user objects returned from the search.
 */
  const handleSearchResults = (results) => {
    setSearchResults(results)
  }

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
                {searchResults.length === 0 ? (
                  <p>No results found</p>
                ) : (
                  <ul className='results-list'>
                    {searchResults.map((item, index) => (
                      <li
                        key={index}
                        className={`result-item ${selectedUser?.id === item.id ? 'selected' : ''}`}
                        onClick={() => setSelectedUser(prev => (prev?.id === item.id ? null : item))}

                        style={{ cursor: 'pointer' }}
                      >
                        {item.name}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>

          <div className='section-results'>
              <>
                <div className='header-row'>
                  <button onClick={() => {
                    setSelectedUser(null);
                    setIsAddingUser(true);
                  }}> + Add User</button>
                </div>
                {roles.length === 0 ? (
                  <p>Loading roles...</p>
                ) : (
                  roles.map(role => {
                    const usersInRole = allUsers
                      .filter(user => user.roles.includes(role))
                      .map(user => user.name);

                    return (
                      <div key={role}>
                        <div className='h2-row'>
                          <h2>{role}</h2>
                        </div>
                        <div className='horizontal-line' />
                        {usersInRole.length === 0 ? (
                          <ul>
                            <li><em>No users</em></li>
                          </ul>
                        ) : (
                          <ul>
                            {usersInRole.map((user, idx) => (
                              <li key={idx}>{user}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    );
                  })
                )}
              </>
          </div>
        </div>
      </div>
    </div>
  )
}
