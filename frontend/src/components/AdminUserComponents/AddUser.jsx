import { useEffect, useState } from 'react';

export default function AddUser({
  roles,
  defaultView,
  setdefaultView,
  newUserName,
  setNewUserName,
  newUserEmail,
  setNewUserEmail,
  newUserPhone,
  setNewUserPhone,
  newUserPassword,
  setNewUserPassword,
  handleAddUser,
  setIsAddingUser,
  selectedRoles,
  setSelectedRoles
}) {
  const [allPermissions, setAllPermissions] = useState([]);
  const [rolePermissionMap, setRolePermissionMap] = useState({});

  /**
   * Automatically adds the default view role to the selectedRoles set whenever defaultView changes.
   *
   * @effect
   * @dependency defaultView
   * @sideEffect Updates selectedRoles state to include defaultView.
   */
  useEffect(() => {
    if (defaultView) {
      setSelectedRoles(prev => {
        const updated = new Set(prev);
        updated.add(defaultView);
        return updated;
      });
    }
  }, [defaultView]);

  /**
   * Fetches all available permissions and maps each role to its associated permissions.
   *
   * @effect
   * @dependency roles
   * @sideEffect Updates allPermissions and rolePermissionMap state.
   *
   * @remarks
   * - Requires `/api/users/permissions` and `/api/users/roles/:roleName/permissions` endpoints to be available.
   * - Executes only when roles are populated.
   */
  useEffect(() => {
    const fetchAllPermissions = async () => {
      try {
        const res = await fetch('/api/users/permissions'); // You must expose this endpoint
        const perms = await res.json();
        setAllPermissions(perms);
      } catch (err) {
        console.error('Failed to fetch all permissions:', err);
        setAllPermissions([]);
      }
    };

    const fetchRolePermissions = async () => {
      const map = {};
      for (const role of roles) {
        try {
          const res = await fetch(`/api/users/roles/${role.role_name}/permissions`);
          const perms = await res.json();
          map[role.role_name] = perms;
        } catch (err) {
          console.error(`Failed to fetch permissions for ${role.role_name}:`, err);
          map[role.role_name] = [];
        }
      }
      setRolePermissionMap(map);
    };

    if (roles.length > 0) {
      fetchAllPermissions();
      fetchRolePermissions();
    }
  }, [roles]);

  /**
   * Toggles a role in the selectedRoles set.
   * Prevents unselecting the defaultView role.
   *
   * @function handleRoleToggle
   * @param {string} roleName - The name of the role to toggle.
   * @sideEffect Updates selectedRoles state.
   */
  const handleRoleToggle = (roleName) => {
    if (roleName === defaultView) return; // prevent unchecking defaultView
    setSelectedRoles(prev => {
      const updated = new Set(prev);
      if (updated.has(roleName)) {
        updated.delete(roleName);
      } else {
        updated.add(roleName);
      }
      return updated;
    });
  };

  return (
    <div className="section-results-side">
      <div className='h2-row'>
        <h2>Add New User</h2>
        <div className="button-row">
          <button onClick={handleAddUser}>Add</button>
          <button onClick={() => setIsAddingUser(false)} style={{ marginLeft: '10px' }}>Cancel</button>
        </div>
      </div>
      <div className='horizontal-line'></div>
      <div className='textbox-row'>
        <p className='layout'>Name:</p>
        <input
          type="text"
          value={newUserName}
          className='textbox'
          onChange={e => setNewUserName(e.target.value)}
          placeholder="Enter full name"
        />
      </div>
      <div className='textbox-row'>
        <p className='layout'>Email:</p>
        <input
          type="email"
          value={newUserEmail}
          className='textbox'
          onChange={e => setNewUserEmail(e.target.value)}
          placeholder="Enter email"
        />
      </div>
      <div className='textbox-row'>
        <p className='layout'>Phone Number:</p>
        <input
          type="tel"
          value={newUserPhone}
          className='textbox'
          onChange={e => setNewUserPhone(e.target.value)}
          placeholder="Enter phone number"
        />
      </div>
      <div className='textbox-row'>
        <p className='layout'>Password:</p>
        <input
          type="password"
          value={newUserPassword}
          className='textbox'
          onChange={e => setNewUserPassword(e.target.value)}
          placeholder="Enter password"
        />
      </div>
      <div className='textbox-row'>
        <p className='layout'>Default View:</p>
        <select
          className='textbox'
          value={defaultView}
          onChange={e => setdefaultView(e.target.value)}
        >
          <option value="">Select a default view</option>
          {roles.map(role => (
            <option key={role.role_id} value={role.role_name}>
              {role.role_name.charAt(0).toUpperCase() + role.role_name.slice(1)}
            </option>
          ))}
        </select>
      </div>
      <div className="toggle-container">
        <h3>Assign Roles:</h3>
        {roles.map(role => (
          <div key={role.role_id} className="toggle-row">
            <strong>{role.role_name.charAt(0).toUpperCase() + role.role_name.slice(1)}</strong>
            <label className="switch">
              <input
                type="checkbox"
                checked={selectedRoles.has(role.role_name)}
                disabled={role.role_name === defaultView}
                onChange={() => handleRoleToggle(role.role_name)}
              />
              <span className="slider"></span>
            </label>
          </div>
        ))}
        <p className = "subtext">*Please note that Advisor-Student relationships are assigned when editing current users.</p>
      </div>
      <div className="toggle-container">
        <h3>Selected Permissions:</h3>
        <ul>
          {allPermissions.map((perm, index) => {
            const isHighlighted = Array.from(selectedRoles).some(role =>
              (rolePermissionMap[role] || []).includes(perm)
            );
            return (
              <li
                key={index}
                className={isHighlighted ? 'permission-highlighted' : ''}
              >
                {perm.replace(/_/g, ' ')}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
