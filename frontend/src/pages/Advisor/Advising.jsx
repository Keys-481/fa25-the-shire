/**
 * File: frontend/src/pages/Advisor/Advising.jsx
 * This file defines the Advising page for advisors to search for students and view their information.
 * Includes search student functionality and degree plan component
 */

import { useState } from "react";
import DegreePlan from "../../components/DegreePlan";
import AdvisorNavBar from "../../components/NavBars/AdvisorNavBar";
import SearchBar from "../../components/SearchBar";

/**
 * Advising component displays the Advising page for the advisors.
 * Search for students to view their information and degree plan.
 * @component
 * @returns {JSX.Element} advisor view for searching and viewing student information
 */
export default function Advising() {
  const [activeTab, setActiveTab] = useState('advising');
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
      <ul className="results-list">
        {results.map((student, index) => (
          <li key={index} className={`result-item ${selectedStudent?.id === student.id ? 'selected' : ''}`} onClick={() => handleStudentSelect(student)}>
            <strong>{student.name}</strong> <br />
            {student.id}
          </li>
        ))}
      </ul>
    );
  }


  return (
  <div>
    {/* Combined NavBar (Top + Tabs) */}
    <AdvisorNavBar activeTab={activeTab} onTabChange={setActiveTab} />

    <div className="window">
      <div className="title-bar">
        <h1>Advising</h1>
      </div>

      <div className="container">
        {activeTab === 'advising' && (
          <div className="side-panel">
            <p>Find a Student</p>
            <SearchBar
              onSearch={handleSearchResults}
              searchEndpoint={searchStudentEndpoint}
              placeholder1="School ID"
              placeholder2="Not Implemented"
            />
            <div className="horizontal-line-half"></div>
            <div className="side-panel-results">{renderResults()}</div>

            <div className="section-results">
              <div className="section-results-side">
                {selectedStudent ? (
                  <DegreePlan student={selectedStudent} />
                ) : (
                  <p className="p2">No student selected</p>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'compare' && (
          <div className="side-panel">
            <h2>Compare Catalogues</h2>
            <p>Content for comparing catalogues goes here.</p>
          </div>
        )}

        {activeTab === 'certificates-graduation' && (
          <div className="side-panel">
            <h2>Certificates / Graduation</h2>
            <p>Content for certificates and graduation goes here.</p>
          </div>
        )}
      </div>
    </div>
  </div>
);
}
