import AccountingNavBar from "../../components/NavBars/AccountingNavBar"

/**
 * AccountingSettings component displays the Settings page for accounting.
 * 
 * @component
 * @returns {JSX.Element} 
 */
export default function AccountingSettings() {
  return (
    <div>
      {/* Accounting Navigation Bar */}
      <AccountingNavBar />
      <div className='window'>
        <div className='title-bar'>
          <h1>Settings</h1>
        </div>
      </div>
    </div>
  )
}
