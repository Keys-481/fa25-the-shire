import { useNavigate } from 'react-router-dom'

export default function Dashboard() {
    const navigate = useNavigate()
    const backgroundColor = '#FFFFFF' // White background
    const textColor = '#FFFFFF' // White text
    const secondaryTextColor = '#000000' // Black secondary text

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
            padding: '10px 20px',
            backgroundColor: '#09347a',
            borderBottom: '2px solid #f1632a',
            height: '35px',
        },
        title: {
            margin: 0,
            color: textColor,
            fontSize: '22px',
            marginLeft: '60px',
        },
        content: {
            display: 'flex',
            padding: '2rem',
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
            <div style={styles.navbar}>
                <h2 style={styles.title}>Dashboard</h2>
            </div>
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
