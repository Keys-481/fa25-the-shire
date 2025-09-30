import { useNavigate } from 'react-router-dom'
import logo from '../../assets/images/boise_state_wbg.png'

/**
 * AdvisorDashboard component displays the main dashboard for advisors with navigation options.
 *
 * @component
 * @returns {JSX.Element} The main dashboard view for advisors
 */
export default function AdvisorDashboard() {
    const navigate = useNavigate()

    // Defined color scheme
    const backgroundColor = '#FFFFFF'
    const textColor = '#FFFFFF' 
    const secondaryTextColor = '#000000'

    /**
     * Styling for the Advisor Dashboard
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
            marginLeft: '100px',
            color: '#000000',
            fontSize: '22px',
            marginLeft: '60px',
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
        backButton: {
            fontSize: '30px',
            marginLeft: '10px',
            cursor: 'pointer',
            background: 'none',
            border: 'none',
            color: '#FFFFFF',
        },
    }

    return (
        <div style={styles.container}>
            {/* Navigation bar */}
            <div style={styles.navbar}>
                
                <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-start' }}>
                    <button onClick={() => navigate('/')} style={styles.backButton}>←</button>
                </div>  {/* remove or change to a log out button later*/}

                <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
                    <img src={logo} alt="BSU-Logo" style={{ height: '45px' }} />
                </div>
                <div style={{ flex: 1 }}></div>
            </div>

            {/* Page Title */}
            <h2 style={styles.h2}>Advisor Homepage</h2>

            {/* Divider line */}
            <div style={{ width: '100%', margin: '5px', height: '2px', backgroundColor: 'black' }}></div>


            {/*  Main Content Area with Navigation Buttons */}
            <div style={styles.content}>
                <div style={styles.buttonRow}>
                    {/* Navigation Button */}
                    <button style={styles.squareButton} onClick={() => navigate('/advisor/advising')}>
                        Advising 
                    </button>
                    {/* Navigation Button */}
                    <button style={styles.squareButton} onClick={() => navigate('/advisor/reporting-functionality')}>
                        Reporting Functionality
                    </button>
                    {/* Settings Button */}
                    <button style={styles.squareButton} onClick={() => navigate('/advisor/settings')}>
                        Settings
                    </button>
                </div>
            </div>
        </div>
    )
}
