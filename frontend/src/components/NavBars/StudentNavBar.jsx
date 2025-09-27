import { useNavigate } from 'react-router-dom'
import logo from '../../assets/images/boise_state_wbg.png'

export default function StudentNavBar({ title }) {
  const navigate = useNavigate()

  {/* Display the Student navigation bar */}
  return (
    <div style={styles.navbar}>
      <button onClick={() => navigate('/student/dashboard')} style={styles.backButton}>
        ←
      </button>
      <h2 style={styles.title}>{title}</h2>
      <img src={logo} alt="BSU-Logo" style={styles.logo} />
    </div>
  )
}
/**
 * Styling for the Student Navigation Bar
 */
const styles = {
  navbar: {
    position: 'relative', 
    display: 'flex',
    alignItems: 'center',
    padding: '10px 20px',
    backgroundColor: '#09347a',
    borderBottom: '2px solid #f1632a',
    height: '40px',  
  },
  backButton: {
    fontSize: '30px',
    cursor: 'pointer',
    background: 'none',
    border: 'none',
    color: '#FFFFFF',
    marginRight: '10px',
  },
  title: {
    margin: 0,
    color: '#FFFFFF',
    fontSize: '22px',
    fontfontWeight: 'bold',
  },
  logo: {
    height: '45px',
    position: 'absolute',
    left: 0,
    right: 0,
    margin: '0 auto',  
}

}
