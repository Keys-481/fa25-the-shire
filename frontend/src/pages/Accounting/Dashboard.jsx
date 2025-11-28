/**
 * @file frontend/src/pages/accounting/dashboard
 * @description Dashboard for accounting users
 */

import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/AuthProvider'
import AccountingNavBar from '../../components/NavBars/AccountingNavBar'
import { useApiClient } from '../../lib/apiClient'
import '../../styles/Styles.css'

/**
 * AccountingDashboard component displays the main dashboard for accounting with navigation options.
 *
 * @component
 * @returns {JSX.Element} The main dashboard view for accounting
 */
export default function AccountingDashboard() {
    const navigate = useNavigate();
    const { logout } = useAuth();
    const api = useApiClient();

    /**
     * useEffect hook that runs each time the Dashboard component mounts.
     */
    useEffect(() => {
        (async () => {
            try {
                const me = await api.get("/users/me");
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
            {/* Navigation bar */}\
            <AccountingNavBar />
            {/* <div className='navbar'>
                <div style={{ position: 'absolute', left: '20px' }}>
                    <LogoutButton />
                </div>
                <img src={logo} alt="BSU-Logo" className='logo' />

                <div style={{ position: 'absolute', right: '20px' }}>
                    <NotificationsButton />
                </div>
            </div> */}

            <div className='window'>
                {/* Page Title */}
                <div className='title-bar'>
                    <h1>Accounting Homepage</h1>
                </div>
                {/*  Main Content Area with Navigation Buttons */}
                <div className='container'>
                    <div className='dashboard-container'>
                        <div className='button-row'>
                            {/* Navigation Button */}
                            <button className='square-button' onClick={() => navigate('/accounting/graduation-report')}>
                                Graduation Report
                            </button>
                            {/* Reporting Functionality Button */}
                            <button className='square-button' onClick={() => navigate('/accounting/reporting-functionality')}>
                                Enrollment Report
                            </button>
                            {/* Settings Button */}
                            <button className='square-button' onClick={() => navigate('/accounting/settings')}>
                                Settings
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
