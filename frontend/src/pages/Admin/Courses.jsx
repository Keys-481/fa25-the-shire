import AdminNavBar from '../../components/NavBars/AdminNavBar'


/**
 * AdminCourses component displays the Courses page for admin users.
 * 
 * @component
 * @returns {JSX.Element} A simple admin view for managing or viewing courses
 */
export default function AdminCourses() {
  return (
    <div>
      <AdminNavBar title="Courses" />
      <p>Welcome to the Courses page!</p>
    </div>
  )
}
