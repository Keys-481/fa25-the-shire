import StudentNavBar from "../../components/NavBars/StudentNavBar"

/**
 * StudentDegreeTracking component displays the Degree Tracking page for students.
 * 
 * @component
 * @returns {JSX.Element}   A simple admin view for managing or viewing courses
 */
export default function StudentDegreeTracking() {
   return (
    <div>
      {/* Student Navigation Bar */}
      <StudentNavBar />
      <div className='window'>
        <div className='title-bar'>
          <h1>Degree Tracking</h1>
        </div>
      </div>
    </div>
   )
 }
