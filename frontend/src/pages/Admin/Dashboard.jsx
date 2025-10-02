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

    // Defined color scheme
    const backgroundColor = '#FFFFFF'
    const textColor = '#FFFFFF'
    const secondaryTextColor = '#000000'

    /**
     * Inline styles for the Dashboard layout and elements.
     */
    const styles = {
        container: {
            backgroundColor: backgroundColor,
            color: textColor,
            minHeight: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
        },
        navbar: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '10px 20px',
            backgroundColor: '#09347a',
            borderBottom: '2px solid #f1632a',
            height: '60px',
            width: '100%',
            position: 'absolute',
            top: 0,
            left: 0,
            boxSizing: 'border-box',
        },
        backButton: {
            fontSize: '30px',
            marginRight: '10px',
            cursor: 'pointer',
            background: 'none',
            border: 'none',
            color: '#FFFFFF',
        },
        logo: {
            height: '45px',
            maxWidth: '100%',
        },
        h2: {
            margin: '2px',
            color: secondaryTextColor,
            fontSize: '22px',
            marginLeft: '10px',
            fontFamily: 'Arial, sans-serif',
        },
        content: {
            display: 'flex',
            padding: '1rem',
            backgroundColor: 'transparent',
        },
        buttonRow: {
            display: 'flex',
            flexWrap: 'wrap',
            gap: '2rem',
        },
        squareButton: {
            width: '200px',
            height: '200px',
            backgroundColor: backgroundColor,
            color: secondaryTextColor,
            border: '1px solid ' + secondaryTextColor,
            borderRadius: '8px',
            fontSize: '1.2rem',
            fontWeight: 'bold',
            cursor: 'pointer',
            display: 'flex',
            justifyContent: 'center',
            transition: 'transform 0.2s ease',
            boxShadow: '0 8px 8px rgba(0, 0, 0, 0.1)',
            padding: '1rem',
        }
    }

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
