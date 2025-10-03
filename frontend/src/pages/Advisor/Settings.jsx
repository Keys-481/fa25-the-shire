import AdvisorNavBar from "../../components/NavBars/AdvisorNavBar"

/**
 * AdvisorSettings component displays the Settings page for advisors.
 * 
 * @component
 * @returns {JSX.Element} 
 */
export default function AdvisorSettings() {
  return (
    <div>
      <AdvisorNavBar />
      <div className='window'>
        <div className='title-bar'>
          <h1>Advisor Settings</h1>
        </div>
      </div>
    </div>
  )
}
