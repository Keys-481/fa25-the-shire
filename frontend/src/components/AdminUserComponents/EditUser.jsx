
export default function EditUser({
  selectedUser,
  roles,
  roleToggles,
  handleToggle,
  handleSave,
  handleDelete,
  setSelectedUser
}) {
  return (
    <div className='section-results-side'>
      <div className='h2-row'>
        <h2>Edit User</h2>
        <div className="button-row">
          <button onClick={handleSave}>Save</button>
          <button onClick={handleDelete} className='error-message'>Delete</button>
          <button onClick={() => setSelectedUser(null)} style={{ marginLeft: '10px' }}>Cancel</button>
        </div>
      </div>
      <div className='horizontal-line'></div>
      <div className="toggle-container">
        {roles.map((role, index) => {
          const roleName = role.role_name;
          return (
            <div key={index} className="toggle-row">
              <h3>{roleName}</h3>
              <label className="switch">
                <input
                  type="checkbox"
                  id={`toggle-${index}`}
                  checked={roleToggles[roleName] || false}
                  onChange={() => handleToggle(roleName)}
                />
                <span className="slider"></span>
              </label>
            </div>
          );
        })}
      </div>
    </div>
  );
}
