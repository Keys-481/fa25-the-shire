import { useNavigate } from 'react-router-dom'
import logo from '../../assets/images/boise_state_wbg.png'
import '../../styles/Styles.css'

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
export default function AdminNavBar() {
  const navigate = useNavigate()

  return (
    <div className='navbar'>
      <div style={{ position: 'absolute', left: '20px' }}>
        <button onClick={() => navigate('/admin/dashboard')} className='back-button'>←</button>
      </div>
      <img src={logo} alt="BSU-Logo" className='logo'/>
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
  }

}
