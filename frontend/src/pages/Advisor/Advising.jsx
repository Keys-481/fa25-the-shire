import AdvisorNavBar from "../../components/NavBars/AdvisorNavBar"

/**
 * Advising component displays the Advising page for the advisors.
 * 
 * @component
 * @returns {JSX.Element}  
 */
export default function Advising() {
// Defined color scheme
      const backgroundColor = '#FFFFFF'
      const textColor = '#FFFFFF' 
      const secondaryTextColor = '#000000'
  
    /**
     * Styling for the Degree Tracking page
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
        {/* Advisor Navigation Bar */}
       <AdvisorNavBar />
        
        {/* Title */}
       <h2 style={styles.h2}>Advising</h2>

        {/* Divider line */}
        <div style={{ width: '100%', margin: '5px', height: '2px', backgroundColor: 'black' }}></div>
     </div>
   )
 }
