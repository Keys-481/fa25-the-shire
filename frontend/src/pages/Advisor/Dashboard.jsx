/**
 * @file frontend/src/pages/advisor/dashboard
 * @description Dashboard for advisor users
 */

import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/AuthProvider'
import LogoutButton from '../../components/LogoutButton'
import logo from '../../assets/images/boise_state_wbg.png'
import '../../styles/Styles.css'
import AdvisorNavBar from '../../components/NavBars/AdvisorNavBar'

/**
 * AdvisorDashboard component displays the main dashboard for advisors with navigation options.
 *
 * @component
 * @returns {JSX.Element} The main dashboard view for advisors
 */
export default function AdvisorDashboard() {
    const navigate = useNavigate();
    const { logout } = useAuth();

    return (
        <div>
            <AdvisorNavBar />
            {/* Navigation bar */}

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
