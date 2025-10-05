import logo from '../../assets/images/boise_state_wbg.png'
import '../../styles/Styles.css'

export default function AdvisorNavBar({ activeTab, onTabChange }) {
  const tabs = [
    { id: 'advising', label: "Advising" },
    { id: 'compare', label: "Compare Catalogues" },
    { id: 'certificates-graduation', label: "Certificates/Graduation" },
  ];

  return (
    <>
      {/* Header Navigation Bar */}
      <div className='navbar'>
        <img src={logo} alt="BSU-Logo" className='logo'/>
      </div>

      {/* Tabs Nav Bar */}
      <div className='tabs'>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => onTabChange(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </>
  );
}
