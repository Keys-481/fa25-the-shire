import { useNavigate } from 'react-router-dom'
import logo from '../../assets/images/boise_state_wbg.png'
import '../../styles/Styles.css'

/**
 * AccountingNavBar component renders the navigation bar for accounting users.
 * It includes a back button that navigates to the accounting dashboard and displays the BSU logo.
 *
 * @component
 * @returns {JSX.Element} The rendered accounting navigation bar.
 */
export default function AccountingNavBar() {
  const navigate = useNavigate()

  {/* Display the Accounting navigation bar */}
  return (
    <div className='navbar'>
      <div style={{ position: 'absolute', left: '20px' }}>
        <button onClick={() => navigate('/accounting/dashboard')} className='back-button'>←</button>
      </div>
      <img src={logo} alt="BSU-Logo" className='logo'/>
    </div>
  )
}
