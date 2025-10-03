import { useNavigate } from 'react-router-dom'
import logo from '../../assets/images/boise_state_wbg.png'
import '../../styles/Styles.css'

/**
 * StudentDashboard component displays the main dashboard for students with navigation options.
 *
 * @component
 * @returns {JSX.Element} The main dashboard view for students
 */
export default function StudentDashboard() {
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
