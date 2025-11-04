import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import StudentNavBar from '../../components/NavBars/StudentNavBar';
import { useApiClient } from '../../lib/apiClient';


/**
 * StudentSettings component displays the Settings page for student users.
 * It allows users to view and update their profile information, change their password,
 * switch between different role-based views, and view assigned advisor information.
 *
 * @component
 * @returns {JSX.Element} A React component rendering the student settings interface.
 */
export default function StudentSettings() {
  const navigate = useNavigate();
  const [viewType, setViewType] = useState('settings'); // Default to 'settings'
  const [userInfo, setUserInfo] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [passwordUpdateStatus, setPasswordUpdateStatus] = useState(null);
  const [newView, setNewView] = useState('');
  const [viewUpdateStatus, setViewUpdateStatus] = useState(null);
  const [advisors, setAdvisors] = useState([]);
  const api = useApiClient();
  const roleSettingsRoutes = {
    admin: '/admin/settings',
    student: '/student/settings',
    advisor: '/advisor/settings',
    accounting: '/accounting/settings'
  };

  /**
   * useEffect hook to fetch current user info and advisor relationships on component mount.
   * Sets userInfo, default view, and advisor list if applicable.
   */
  useEffect(() => {
    (async () => {
      try {
        const data = await api.get('/api/users/me');
        setUserInfo(data);
        setNewView(data.default_view);

        // Fetch advisor info
        const advisingData = await api.get(`/api/users/${data.user_id}/advising`);
        console.log('Advising response:', advisingData);
        if (advisingData?.advisors?.length > 0) {
          setAdvisors(advisingData.advisors);
        }
      } catch (error) {
        console.error('Failed to fetch user info or advising data:', error);
      }
    })();
  }, []);

  if (!userInfo) return <p>Loading user info...</p>;

  return (
    <div>
      <StudentNavBar />
      <div className='window'>
        <div className='title-bar'>
          <h1>Settings</h1>
          <div className='container'>
            <div className="view-toggle">
              <div>
                <button
                  onClick={() => setViewType('profile')}
                  className={viewType === 'profile' ? 'active' : 'inactive'}
                >
                  Profile
                </button>
                <button
                  onClick={() => setViewType('settings')}
                  className={viewType === 'settings' ? 'active' : 'inactive'}
                >
                  Settings
                </button>
              </div>
            </div>

            <div className="view-content">
              {viewType === 'profile' && (
                <div>
                  <h2 style={{ marginLeft: '15px' }}>Personal Information</h2>
                  <div className='horizontal-line'></div>
                  <div className="textbox-row">
                    <p><strong>Name:</strong> {userInfo.name}</p>
                  </div>
                  <div className="textbox-row">
                    <p><strong>ID:</strong> {userInfo.id}</p>
                  </div>
                  <div className="textbox-row">
                    <p><strong>Email:</strong> {userInfo.email}</p>
                  </div>
                  <div className="textbox-row">
                    <p><strong>Phone:</strong> {userInfo.phone}</p>
                  </div>
                  <div className="textbox-row">
                    <p><strong>Change Password:</strong></p>
                    <input
                      className="textbox"
                      type="password"
                      placeholder="New password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                    <button
                      onClick={async () => {
                        try {
                          await api.put(`/api/users/${userInfo.id}`, {
                            name: userInfo.name,
                            email: userInfo.email,
                            phone: userInfo.phone,
                            password: newPassword,
                            default_view: userInfo.default_view
                          });
                          setPasswordUpdateStatus('Password updated successfully.');
                          setNewPassword('');
                        } catch (err) {
                          console.error('Password update failed:', err);
                          setPasswordUpdateStatus('Failed to update password.');
                        }
                      }}
                    >
                      Update
                    </button>
                    {passwordUpdateStatus && <p>{passwordUpdateStatus}</p>}
                  </div>

                  {/* Display user roles if they have more than 1 */}
                  {userInfo.roles?.length > 1 && (
                    <>
                      <h2 style={{ marginLeft: '15px', marginTop: '20px' }}>Roles</h2>
                      <div className='horizontal-line'></div>
                      <ul>
                        {userInfo.roles.map((role, index) => (
                          <li key={index}>{role}</li>
                        ))}
                      </ul>
                    </>
                  )}

                  {/* Display user advisor information if they have one*/}
                  {advisors.length > 0 && (
                    <>
                      <h2 style={{ marginLeft: '15px', marginTop: '20px' }}>Advisor Information</h2>
                      <div className='horizontal-line'></div>
                      {advisors.map((advisor, index) => (
                        <div key={index}>
                          <div className="textbox-row">
                            <p><strong>Name:</strong> {advisor.name}</p>
                          </div>
                          <div className="textbox-row">
                            <p><strong>Email:</strong> {advisor.email}</p>
                          </div>
                          <div className="textbox-row">
                            <p><strong>Phone:</strong> {advisor.phone_number}</p>
                          </div>
                          <div className="horizontal-line-half"></div>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              )}
              {viewType === 'settings' && (
                <div>
                  {/* TODO: Add Generic Settings Later */}

                  {/* If user has more than 1 role display */}
                  {userInfo.roles?.length > 1 && (
                    <div>
                      <div className="textbox-row">
                        <p><strong>Current View:</strong> Student</p>
                      </div>
                      <div className="textbox-row">
                        <p><strong>Change View:</strong></p>
                        <select
                          className="textbox"
                          value={newView}
                          onChange={(e) => setNewView(e.target.value)}
                        >
                          {userInfo.roles.map((role, index) => (
                            <option key={index} value={role}>
                              {role}
                            </option>
                          ))}
                        </select>
                        <button
                          onClick={() => {
                            const route = roleSettingsRoutes[newView.toLowerCase()];
                            if (route) {
                              navigate(route);
                            } else {
                              console.warn('No route defined for role:', newView);
                            }
                          }}
                        >
                          Switch View
                        </button>
                      </div>

                      {viewUpdateStatus && <p>{viewUpdateStatus}</p>}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
