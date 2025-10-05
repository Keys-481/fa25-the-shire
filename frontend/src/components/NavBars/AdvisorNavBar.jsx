import { useNavigate } from 'react-router-dom'
import logo from '../../assets/images/boise_state_wbg.png'
import '../../styles/Styles.css'

export default function AdvisorNavBar({ title }) {
  const navigate = useNavigate()
  const location = useLocation()

  const tabs =[
    { id: 'advising', label: "Advising", path: '/advisor/advising' },
    { id: 'compare', label: "Compare Catalogues", path: '/advisor/compare' },
    { id: 'certificates-graduation', label: "Certificates/Graduation", path: '/advisor/certificates-graduation' },
  ]
  
  // Display the Advisor navigation bar
  return (
    <>
      {/* Header Navigation Bar */}
      <div className='navbar'>
        <div style={{ position: 'absolute', left: '20px' }}>
          <button onClick={() => navigate('/advisor/dashboard')} className='back-button'>←</button>
        </div>
        <img src={logo} alt="BSU-Logo" className='logo'/>
      </div>

      {/* Advising Tabs Nav Bar */}
      <div className='tabs'>
        
      </div>
    </>
  )
}
