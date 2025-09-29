import StudentNavBar from "../../components/NavBars/StudentNavBar"

/**
 * StudentSettings component displays the Settings page for students.
 * 
 * @component
 * @returns {JSX.Element} A simple admin view for managing or viewing courses
 */
export default function StudentSettings() {
  // Defined color scheme
      const backgroundColor = '#FFFFFF'
      const textColor = '#FFFFFF' 
      const secondaryTextColor = '#000000'
  
     /**
     * Styling for the Settings page
     */
    const styles = {
        container: {
        backgroundColor,
        color: textColor,
        minHeight: '100%',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
    },
    h2: {
        margin: '2px',
        marginLeft: '100px',
        color: '#000000',
        fontSize: '22px',
        marginLeft: '60px',
        fontFamily: 'Arial, sans-serif',
    },
  }

  return (
    <div style={styles.container}>
        {/* Student Navigation Bar */}
         <StudentNavBar/>
         
        {/* Title */}
        <h2 style={styles.h2}>Student Settings</h2>

       {/* Divider line */}
        <div style={{ width: '100%', margin: '5px', height: '2px', backgroundColor: 'black' }}></div>
    </div>
  )
}
