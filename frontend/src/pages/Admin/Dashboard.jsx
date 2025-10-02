import { useNavigate } from 'react-router-dom'
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
    const navigate = useNavigate()
    return (
        <div>
            {/* Navigation bar */}
            <div className='navbar'>
                <div style={{ position: 'absolute', left: '20px' }}>
                    <button onClick={() => navigate('/')} className='back-button'>←</button>
                </div>  {/* remove or change to a log out button later*/}
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
