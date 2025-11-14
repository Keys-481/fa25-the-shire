/**
 * @file frontend/src/pages/student/dashboard
 * @description Dashboard for student users
 */

import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/AuthProvider'
import StudentNavBar from '../../components/NavBars/StudentNavBar'
import { useApiClient } from '../../lib/apiClient'
import '../../styles/Styles.css'

/**
 * StudentDashboard component displays the main dashboard for students with navigation options.
 *
 * @component
 * @returns {JSX.Element} The main dashboard view for students
 */
export default function StudentDashboard() {
    const navigate = useNavigate()
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
            <StudentNavBar />

            <div className='window'>
                {/* Page Title */}
                <div className='title-bar'>
                    <h1>Student Homepage</h1>
                </div>
                {/*  Main Content Area with Navigation Buttons */}
                <div className='container'>
                    <div className='dashboard-container'>
                        <div className='button-row'>
                            {/* Navigation Button */}
                            <button className='square-button' onClick={() => navigate('/student/degree-tracking')}>
                                Degree Tracking
                            </button>
                            {/* Settings Button */}
                            <button className='square-button' onClick={() => navigate('/student/settings')}>
                                Settings
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
