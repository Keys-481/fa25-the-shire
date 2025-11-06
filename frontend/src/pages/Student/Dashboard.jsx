/**
 * @file frontend/src/pages/student/dashboard
 * @description Dashboard for student users
 */

import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/AuthProvider'
import LogoutButton from '../../components/LogoutButton'
import logo from '../../assets/images/boise_state_wbg.png'
import '../../styles/Styles.css'
import StudentNavBar from '../../components/NavBars/StudentNavBar'

/**
 * StudentDashboard component displays the main dashboard for students with navigation options.
 *
 * @component
 * @returns {JSX.Element} The main dashboard view for students
 */
export default function StudentDashboard() {
    const navigate = useNavigate()
    const { logout } = useAuth();

    return (
        <div>
            {/* Navigation bar */}
            <StudentNavBar />
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
