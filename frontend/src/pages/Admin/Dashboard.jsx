/**
 * @file frontend/src/pages/admin/dashboard
 * @description Dashboard for admin users
 */

import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/AuthProvider'
import AdminNavBar from '../../components/NavBars/AdminNavBar'
import { useApiClient } from '../../lib/apiClient'
import '../../styles/Styles.css'


/**
 * Dashboard component for the Admin role.
 * Displays a top navigation bar and a grid of square buttons
 * that link to the different admin sections: Courses, Users, and Settings.
 *
 * @component
 * @returns {JSX.Element} A styled admin dashboard with navigation buttons
 */
export default function Dashboard() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const api = useApiClient();

  /**
   * useEffect hook that runs each time the Dashboard component mounts.
   */
  useEffect(() => {
    (async () => {
      try {
        const me = await api.get("/api/users/me");
        const prefs = me.preferences;
        if (prefs) {
          document.body.classList.toggle("dark-theme", prefs.theme === "dark");
          document.documentElement.style.setProperty("--font-size-change", prefs.font_size_change);
          document.documentElement.style.setProperty("--font-family-change", prefs.font_family);
        }
      } catch (err) {
        console.error("Failed to apply preferences:", err);
      }
    })();
  }, []);

  return (
    <div>
      {/* Navigation bar */}
      <AdminNavBar />

      {/* Main Content */}
      <div className='window'>
        <div className='title-bar'>
          <h1>Admin Homepage</h1>
        </div>
        <div className='container'>
          <div className='dashboard-container'>
            <div className='button-row'>
              <button className='square-button' onClick={() => navigate('/admin/courses')}>
                Courses
              </button>
              <button className='square-button' onClick={() => navigate('/admin/users')}>
                Users
              </button>
              <button className='square-button' onClick={() => navigate('/admin/settings')}>
                Settings
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
