/**
 * @file frontend/src/pages/advisor/dashboard
 * @description Dashboard for advisor users
 */

import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/AuthProvider'
import AdvisorNavBar from '../../components/NavBars/AdvisorNavBar'
import { useApiClient } from '../../lib/apiClient'
import '../../styles/Styles.css'

/**
 * AdvisorDashboard component displays the main dashboard for advisors with navigation options.
 *
 * @component
 * @returns {JSX.Element} The main dashboard view for advisors
 */
export default function AdvisorDashboard() {
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
            <AdvisorNavBar />
            <div className='window'>
                {/* Page Title */}
                <div className='title-bar'>
                    <h1>Advisor Homepage</h1>
                </div>
                <div className='container'>
                    <div className='dashboard-container'>
                        {/* Navigation Buttons */}
                        <div className='button-row'>
                            <button className='square-button' onClick={() => navigate('/advisor/advising')}>
                                Advising
                            </button>
                            <button className='square-button' onClick={() => navigate('/advisor/reporting-functionality')}>
                                Reporting Functionality
                            </button>
                            <button className='square-button' onClick={() => navigate('/advisor/settings')}>
                                Settings
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
