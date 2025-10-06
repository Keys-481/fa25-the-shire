/**
 * File: frontend/src/pages/Advisor/Advising.jsx
 * This file defines the Advising page for advisors to search for students and view their information.
 * Includes search student functionality and degree plan component
 */

import { useState } from "react";
import AdvisorNavBar from "../../components/NavBars/AdvisorNavBar";
import SearchBar from "../../components/SearchBar";
import ProgramSelector from "../../components/ProgramSelector";

/**
 * Advising component displays the Advising page for the advisors.
 * Search for students to view their information and degree plan.
 * @component
 * @returns {JSX.Element} advisor view for searching and viewing student information
 */
export default function Advising() {
  // State to hold search results
  const [results, setResults] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);

  // state to hold selected student and their programs
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [programs, setPrograms] = useState([]);
  const [selectedProgram, setSelectedProgram] = useState(null);


  // Handle search results from SearchBar component
  const handleSearchResults = (results) => {
    setResults(results);
    setHasSearched(true);
  }

  // Handle click on student from results list
  const handleStudentSelect = async (student) => {
    setSelectedStudent(student);

    try {
      // get list of programs for student
      const response = await fetch(`/students/${student.id}/programs`);
      const data = await response.json();
      setPrograms(data.programs || []);
    } catch (error) {
      console.error('Error fetching student programs:', error);
    }
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
      {/* Advisor Navigation Bar */}
      <AdvisorNavBar />
      <div className="window">
        <div className="title-bar">
          {/* Title */}
          <h1>Advising</h1>
        </div>

        <div className="container">
          <div className="side-panel">
            {/* Search Section */}
            <p>Find a Student</p>
            <SearchBar
              onSearch={handleSearchResults}
              searchEndpoint={searchStudentEndpoint}
              placeholder1="School ID"
              placeholder2="Not Implemented"
            />
            <div className="horizontal-line-half"></div>
            <div className="side-panel-results">
              {/* Results list below search bar */}
              <div>
                {renderResults()}
              </div>
            </div>

            <div className="section-results">
              {/* Right panel for future implementation */}
              <div className="section-results-side">
                <ProgramSelector
                  student={selectedStudent}
                  programs={programs}
                  selectedStudentProgram={selectedProgram}
                  setSelectedProgram={setSelectedProgram}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
