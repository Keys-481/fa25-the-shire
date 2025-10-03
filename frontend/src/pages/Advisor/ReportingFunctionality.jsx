import AdvisorNavBar from "../../components/NavBars/AdvisorNavBar"

/**
 * ReportingFunctionality component displays the Reporting functionality page for advisors.
 * 
 * @component
 * @returns {JSX.Element}   
 */
export default function ReportingFunctionality() {
   return (
    <div>
      <AdvisorNavBar />
      <div className='window'>
        <div className='title-bar'>
          <h1>Reporting Functionality</h1>
        </div>
      </div>
    </div>
   )
 }
