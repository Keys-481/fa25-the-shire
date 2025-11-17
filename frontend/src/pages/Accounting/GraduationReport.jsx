import AccountingNavBar from "../../components/NavBars/AccountingNavBar"

/**
 * AccountingGraduationReport component displays the Graduation Report page for accounting.
 * 
 * @component
 * @returns {JSX.Element}      
 */
export default function AccountingGraduationReport() {
   return (
    <div>
      {/* Accounting Navigation Bar */}
      <AccountingNavBar />
      <div className='window'>
        <div className='title-bar'>
          <h1>Graduation Report</h1>
        </div>
      </div>
    </div>
   )
 }
