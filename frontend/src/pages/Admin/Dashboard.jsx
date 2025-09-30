import { useNavigate } from 'react-router-dom'
import logo from '../../assets/images/boise_state_wbg.png'

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
            justifyContent: 'center',
            alignItems: 'center',
            padding: '5px 20px',
            backgroundColor: '#09347a',
            borderBottom: '2px solid #f1632a',
            height: '50px',
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
        },
    }

    return (
        <div style={styles.container}>
            {/* Navigation bar */}
            <div style={styles.navbar}>
                <img src={logo} alt="BSU-Logo" style={{ height: '45px', alignItems: 'center', top: '-3px'}} />
            </div>

            <h2 style={styles.h2}>Admin Homepage</h2>
            <div style={{ width: '100%', height: '2px', backgroundColor: 'black' }}></div>

            {/* Main Content */}
            <div style={styles.content}>
                <div style={styles.buttonRow}>
                    <button style={styles.squareButton} onClick={() => navigate('/admin/courses')}>
                        Courses
                    </button>
                    <button style={styles.squareButton} onClick={() => navigate('/admin/users')}>
                        Users
                    </button>
                    <button style={styles.squareButton} onClick={() => navigate('/admin/settings')}>
                        Settings
                    </button>
                </div>
            </div>
        </div>
    )
}
