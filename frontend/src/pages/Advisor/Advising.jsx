/**
 * File: frontend/src/pages/Advisor/Advising.jsx
 * This file defines the Advising page for advisors to search for students and view their information.
 * Includes search student functionality and degree plan component
 */

import AdvisorNavBar from "../../components/NavBars/AdvisorNavBar"
import SearchBar from "../../components/SearchBar"
import DegreePlan from "../../components/DegreePlan"
import { useState } from "react"

/**
 * Advising component displays the Advising page for the advisors.
 * Search for students to view their information and degree plan.
 * @component
 * @returns {JSX.Element} advisor view for searching and viewing student information
 */
export default function Advising() {
  // Defined color scheme
  const backgroundColor = '#FFFFFF';
  const textColor = '#FFFFFF';
  const secondaryTextColor = '#000000';

  // State to hold search results
  const [results, setResults] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);

  // state to hold selected student
  const [selectedStudent, setSelectedStudent] = useState(null);

  // Handle search results from SearchBar component
  const handleSearchResults = (results) => {
    setResults(results);
    setHasSearched(true);
  }

  // Handle click on studnet from results list
  const handleStudentSelect = (student) => {
    setSelectedStudent(student);
  }

  const searchStudentEndpoint = '/students/search';
  
  /**
   * Styling for the advising page
   */
  const styles = {
    container: {
      backgroundColor,
      color: textColor,
      minHeight: '100vh',
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
    },
    h2: {
      margin: '2px',
      marginLeft: '60px',
      color: secondaryTextColor,
      fontSize: '22px',
      fontFamily: 'Arial, sans-serif',
    },
    content: {
      display: 'flex',
      flexDirection: 'row',
      flex: 1,
      minHeight: '100%',
    },
    searchSection: {
      display: 'flex',
      flexDirection: 'column',
      width: '20%',
      borderRight: `2px solid ${secondaryTextColor}`,
      minHeight: '100%',
      padding: '10px',
    },
    searchHeader: {
      color: secondaryTextColor,
      fontSize: '18px',
      fontWeight: 'bold',
      margin: '0',
    },
    resultsList: {
      listStyleType: 'none',
      paddingLeft: '0',
      paddingRight: '0',
      color: secondaryTextColor,
      maxWidth: '90%',
      margin: '0 auto',
    },
    resultItem: {
      marginBottom: '10px',
      padding: '8px',
      border: `1px solid #ccc`,
      borderRadius: '5px',
      backgroundColor: '#f9f9f9',
      margin: '0 auto 10px auto',
    },
    rightPanel: {
      flex: 1,
      padding: '20px',
    },
    divider: {
      width: '100%',
      margin: '0',
      height: '2px',
      backgroundColor: secondaryTextColor,
    },
    searchDivider: {
      borderBottom: `2px solid ${secondaryTextColor}`,
      marginTop: '15px',
      width: '100%',
      marginLeft: '-10px',
      marginRight: '-10px',
    }
  }

  // render results message only after a search has been made
  const renderResults = () => {
    if (!hasSearched) {
      return null;
    }

    if (results.length === 0) {
      return <p style={{ color: "black" }}>Student not found</p>;
    }

    // render results list
    return (
      <ul style={styles.resultsList}>
        {results.map((student, index) => (
          <li key={index}
              style={{
                ...styles.resultItem,
                cursor: 'pointer',
                backgroundColor: selectedStudent?.id === student.id ? '#D3D3D3' : '#f9f9f9',
              }} onClick={() => handleStudentSelect(student)}
>
            <strong>{student.name}</strong> <br />
            {student.id}
          </li>
        ))}
      </ul>
    );
  }

  return (
  <div style={styles.container}>
    {/* Advisor Navigation Bar */}
    <AdvisorNavBar />
        
    {/* Title */}
    <h2 style={styles.h2}>Advising</h2>

    {/* Divider line */}
    {/* <div style={{ width: '100%', margin: '5px', height: '2px', backgroundColor: 'black' }}></div> */}
    <div style={styles.divider}></div>

    <div style={styles.content}>
      {/* Search Section */}
      <div style={styles.searchSection}>
        <h3 style={styles.searchHeader}>Find a Student</h3> 
        <SearchBar
          onSearch={handleSearchResults}
          searchEndpoint={searchStudentEndpoint}
          placeholder1="School ID"
          placeholder2="Not Implemented"
        />
        <div style={styles.searchDivider}></div>


        {/* Results list below search bar */}
        <div style={ { marginTop: '20px' } }>
          {renderResults()}
        </div>
      </div>

      {/* Right panel for future implementation */}
      <div style={styles.rightPanel}>
        {selectedStudent ? (
          <DegreePlan student={selectedStudent} />
        ) : (
          <p style={{ marginTop: "20px" }}> No student selected</p>
        )}
      </div>
  </div>
</div>
)}
