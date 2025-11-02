/**
 * @file frontend/src/pages/accounting/dashboard
 * @description Dashboard for accounting users
 */

import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/AuthProvider'
import LogoutButton from '../../components/LogoutButton'
import logo from '../../assets/images/boise_state_wbg.png'
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

    return (
        <div>
            {/* Navigation bar */}
            <div className='navbar'>
                <div style={{ position: 'absolute', left: '20px' }}>
                    <LogoutButton />
                </div>
                <img src={logo} alt="BSU-Logo" className='logo' />
            </div>

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
