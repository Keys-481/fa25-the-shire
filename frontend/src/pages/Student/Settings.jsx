import StudentNavBar from "../../components/NavBars/StudentNavBar"

/**
 * StudentSettings component displays the Settings page for students.
 * 
 * @component
 * @returns {JSX.Element} A simple admin view for managing or viewing courses
 */
export default function StudentSettings() {
  return (
    <div>
      {/* Student Navigation Bar */}
      <StudentNavBar />
      <div className='window'>
        <div className='title-bar'>
          <h1>Settings</h1>
        </div>
      </div>
    </div>
  )
}
