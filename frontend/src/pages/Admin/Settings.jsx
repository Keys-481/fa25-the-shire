import AdminNavBar from '../../components/NavBars/AdminNavBar'

/**
 * AdminSettings component displays the Settings page for admin users.
 * 
 * @component
 * @returns {JSX.Element} A simple admin view for managing application settings
 */
export default function AdminSettings() {
  return (
    <div>
      <AdminNavBar/>
      <div className='window'>
      <div className='title-bar'>
        <h1>Settings</h1>
      </div>
      </div>
    </div>
  )
}
