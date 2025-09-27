import { useNavigate } from 'react-router-dom'

/**
 * AdminNavBar component displays a top navigation bar for admin pages that  
 * are not the dashboard. It includes a back arrow button that navigates to 
 * the admin dashboard, and a title indicating the current page.
 *
 * @component
 * @param {Object} props - Component props
 * @param {string} props.title - The title to display in the navigation bar
 * @returns {JSX.Element} A styled navigation bar with a back button and title
 */
export default function AdminNavBar({ title }) {
  const navigate = useNavigate()

  return (
    <div style={styles.navbar}>
      <button onClick={() => navigate('/admin/dashboard')} style={styles.backButton}>←</button>
      <h2 style={styles.title}>| {title}</h2>
    </div>
  )
}

/**
 * Inline styles for the AdminNavBar component.
 * Includes styling for the navbar container, back button, and title.
 */
const styles = {
  navbar: {
    display: 'flex',
    alignItems: 'center',
    padding: '10px 20px',
    backgroundColor: '#09347a',
    borderBottom: '2px solid #f1632a',
  },
  backButton: {
    fontSize: '30px',
    marginRight: '10px',
    cursor: 'pointer',
    background: 'none',
    border: 'none',
    color: '#FFFFFF',
  },
  title: {
    margin: 0,
    color: '#FFFFFF',
    fontSize: '22px',
  },
}
