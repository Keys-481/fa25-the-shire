import { useNavigate } from 'react-router-dom'
import logo from '../../assets/images/boise_state_wbg.png'
import '../../styles/Styles.css'

/**
 * Placeholder Login page
 *
 * @component
 * @returns {JSX.Element} 
 */
export default function PlaceHolder_LogIn() {
    const navigate = useNavigate()
    return (
        <div className='page-wrapper'>
            {/* Navigation bar */}
            <div className='navbar'>
                <img src={logo} alt="BSU-Logo" style={{ height: '45px', alignItems: 'center', top: '-3px' }} />
            </div>

            <div className='window'>
                {/* Page Title */}
                <div className='title-bar'>
                    <h1>User Log In</h1>
                </div>
                <div className='container'>
                    {/*  Main Content Area with Navigation Buttons */}
                    <div className='dashboard-container'>
                        <div className='button-row'>
                            {/* Navigation Button */}
                            <button className='square-button' onClick={() => navigate('/admin/dashboard')}>
                                Administrator
                            </button>
                            {/* Navigation Button */}
                            <button className='square-button' onClick={() => navigate('/advisor/dashboard')}>
                                Advisor
                            </button>
                            {/* Settings Button */}
                            <button className='square-button' onClick={() => navigate('/student/dashboard')}>
                                Student
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
