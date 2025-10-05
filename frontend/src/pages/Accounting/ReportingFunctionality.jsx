import AccountingNavBar from "../../components/NavBars/AccountingNavBar"

/**
 * ReportingFunctionality component displays the Reporting functionality page for accounting.
 * 
 * @component
 * @returns {JSX.Element}   
 */
export default function AccountingReportingFunctionality() {
   return (
    <div>
      <AccountingNavBar />
      <div className='window'>
        <div className='title-bar'>
          <h1>Reporting Functionality</h1>
        </div>
      </div>
    </div>
   )
 }
