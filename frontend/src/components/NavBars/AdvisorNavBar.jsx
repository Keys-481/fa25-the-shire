import { useNavigate } from 'react-router-dom'
import logo from '../../assets/images/boise_state_wbg.png'
import '../../styles/Styles.css'

export default function AdvisorNavBar({ title }) {
  const navigate = useNavigate()

  {/* Display the Advisor navigation bar */}
  return (
    <div className='navbar'>
      <div style={{ position: 'absolute', left: '20px' }}>
        <button onClick={() => navigate('/advisor/dashboard')} className='back-button'>←</button>
      </div>
      <img src={logo} alt="BSU-Logo" className='logo'/>
    </div>
  )
}
