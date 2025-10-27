/**
 * AdminUsers Component
 *
 * This component provides an administrative interface for managing users and their roles.
 * It allows administrators to:
 * - View all users grouped by roles
 * - Search for users by name or privilege type
 * - Add new users with selected roles
 * - Edit roles for existing users
 * - Delete users
 */
import { useEffect, useState } from 'react';
import AddUser from '../../components/AdminUserComponents/AddUser';
import EditUser from '../../components/AdminUserComponents/EditUser';
import RoleList from '../../components/AdminUserComponents/RoleList';
import AdminNavBar from '../../components/NavBars/AdminNavBar';
import SearchBar from '../../components/SearchBar';

export default function AdminUsers() {
  const [allUsers, setAllUsers] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [roles, setRoles] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [roleToggles, setRoleToggles] = useState({});
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPhone, setNewUserPhone] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [defaultView, setdefaultView] = useState('');
  const [selectedRoles, setSelectedRoles] = useState(new Set());

  const searchEndpoint = '/users/search';

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
   * Fetches roles for the selected user and updates toggle states accordingly.
   */
  useEffect(() => {
    const fetchUserRoles = async () => {
      if (selectedUser) {
        try {
          const res = await fetch(`/users/${selectedUser.id}/roles`);
          const userRoles = await res.json();

          const toggles = {};
          roles.forEach(role => {
            toggles[role] = userRoles.includes(role);
          });
          setRoleToggles(toggles);
        } catch (err) {
          console.error('Failed to fetch user roles:', err);
        }
      }
    };

    fetchUserRoles();
  }, [selectedUser, roles]);

  /**
   * Refreshes user and role data from the backend.
   * Resets role toggles.
   */
  const refreshData = async () => {
    try {
      const [usersRes, rolesRes] = await Promise.all([
        fetch('/users/all'),
        fetch('/users/roles')
      ]);

      const usersData = await usersRes.json();
      const rolesData = await rolesRes.json();

      setAllUsers(usersData);
      setRoles(rolesData);

      const initialToggles = {};
      rolesData.forEach(role => {
        initialToggles[role] = false;
      });
      setRoleToggles(initialToggles);
    } catch (err) {
      console.error('Failed to refresh data:', err);
    }
  };

  /**
   * Handles adding a new user with selected roles.
   * Sends a POST request to the backend and updates state.
   */
  const handleAddUser = async () => {
    const allRoles = Array.from(selectedRoles);

    try {
      const res = await fetch('/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newUserName,
          email: newUserEmail,
          phone: newUserPhone,
          password: newUserPassword,
          default_view: defaultView,
          roles: allRoles
        })
      });

      if (res.ok) {
        alert('User added successfully');
        setIsAddingUser(false);
        setNewUserName('');
        setdefaultView('');
        const newUser = await res.json();
        setAllUsers(prev => [...prev, { id: newUser.userId, name: newUser.name, roles: allRoles }]);
        await refreshData();
      } else {
        alert('Failed to add user');
      }
    } catch (err) {
      console.error('Add user error:', err);
      alert('Error adding user');
    }
  };

  /**
   * Handles saving updated roles for the selected user.
   * Sends a PUT request to the backend.
   */
  const handleSave = async () => {
    if (!selectedUser) return;

    const updatedRoles = Object.entries(roleToggles)
      .filter(([_, isEnabled]) => isEnabled)
      .map(([role]) => role);

    try {
      const res = await fetch(`/users/${selectedUser.id}/roles`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roles: updatedRoles })
      });

      if (res.ok) {
        alert('Roles updated successfully');
        setSearchResults([]);
        setSelectedUser(null);
        await refreshData();
      } else {
        alert('Failed to update roles');
      }
    } catch (err) {
      console.error('Save error:', err);
      alert('Error saving roles');
    }
  };

  /**
   * Handles deleting the selected user.
   * Sends a DELETE request to the backend.
   */
  const handleDelete = async () => {
    if (!selectedUser) return;

    if (!window.confirm(`Are you sure you want to delete ${selectedUser.name}?`)) return;

    try {
      const res = await fetch(`/users/${selectedUser.id}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        alert('User deleted');
        setSelectedUser(null);
        setSearchResults(prev => prev.filter(u => u.id !== selectedUser.id));
        setAllUsers(prev => prev.filter(u => u.id !== selectedUser.id));
        await refreshData();
      } else {
        alert('Failed to delete user');
      }
    } catch (err) {
      console.error('Delete error:', err);
      alert('Error deleting user');
    }
  };

  /**
   * Callback for handling search results from the SearchBar component.
   * @param {Array} results - Array of user objects returned from the search.
   */
  const handleSearchResults = (results) => {
    setSearchResults(results);
  };

  /**
   * Toggles the state of a role checkbox.
   * @param {string} role - The role to toggle.
   */
  const handleToggle = (role) => {
    setRoleToggles(prev => ({
      ...prev,
      [role]: !prev[role]
    }));
  };

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
                        <strong>{item.name}</strong> <br />
                        {`PID: ${item.public}`}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>

          <div className='section-results'>
            {selectedUser ? (
              <EditUser
                selectedUser={selectedUser}
                roles={roles}
                roleToggles={roleToggles}
                handleToggle={handleToggle}
                handleSave={handleSave}
                handleDelete={handleDelete}
              />
            ) : isAddingUser ? (
              <AddUser
                roles={roles}
                defaultView={defaultView}
                setdefaultView={setdefaultView}
                newUserName={newUserName}
                setNewUserName={setNewUserName}
                newUserEmail={newUserEmail}
                setNewUserEmail={setNewUserEmail}
                newUserPhone={newUserPhone}
                setNewUserPhone={setNewUserPhone}
                newUserPassword={newUserPassword}
                setNewUserPassword={setNewUserPassword}
                handleAddUser={handleAddUser}
                setIsAddingUser={setIsAddingUser}
                selectedRoles={selectedRoles}
                setSelectedRoles={setSelectedRoles}
              />
            ) : (
              <RoleList
                roles={roles}
                allUsers={allUsers}
                setIsAddingUser={setIsAddingUser}
                setSelectedUser={setSelectedUser}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
