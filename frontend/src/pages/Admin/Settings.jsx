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
      <AdminNavBar title="Settings" />
      <p>Welcome to the Settings page!</p>
    </div>
  )
}
