import { useNavigate, useLocation } from 'react-router-dom'
import logo from '../../assets/images/boise_state_wbg.png'
import '../../styles/Styles.css'

export default function AdvisorNavBar({ title }) {
  const navigate = useNavigate()
  const location = useLocation()

  const tabs =[
    { id: 'advising', label: "Advising" },
    { id: 'compare', label: "Compare Catalogues" },
    { id: 'certificates-graduation', label: "Certificates/Graduation" },
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
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`tab-button ${location.pathname === tab.path ? 'active' : ''}`}
            onClick={() => navigate(tab.path)}
          >
            {tab.label}
          </button>
        ))}
        
      </div>
    </>
  )
}
