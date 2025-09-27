import AdminNavBar from '../../components/NavBars/AdminNavBar'


/**
 * AdminUsers component displays the Users page for admin users.
 * 
 * @component
 * @returns {JSX.Element} A simple admin view for managing or viewing users
 */
export default function AdminUsers() {
  return (
    <div>
      <AdminNavBar title="Users" />
      <p>Welcome to the Users page!</p>
    </div>
  )
}
