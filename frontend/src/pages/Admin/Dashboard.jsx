/**
 * @file frontend/src/pages/admin/dashboard
 * @description Dashboard for admin users
 */

import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/AuthProvider'
import LogoutButton from '../../components/LogoutButton'
import logo from '../../assets/images/boise_state_wbg.png'
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
    return (
        <div>
            {/* Navigation bar */}
            <div className='navbar'>
                <div style={{ position: 'absolute', left: '20px' }}>
                    <LogoutButton />
                </div>
                <img src={logo} alt="BSU-Logo" className='logo' />
            </div>

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
