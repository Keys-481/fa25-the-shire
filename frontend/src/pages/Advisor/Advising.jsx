/**
 * File: frontend/src/pages/Advisor/Advising.jsx
 * This file defines the Advising page for advisors to search for students and view their information.
 * Includes search student functionality and degree plan component
 */

import { useEffect, useState } from "react";
import AdvisorNavBar from "../../components/NavBars/AdvisorNavBar";
import SearchBar from "../../components/SearchBar";
import ProgramSelector from "../../components/ProgramSelector";
import { useApiClient } from "../../lib/apiClient";
import DegreePlan from "../../components/DegreePlanComponents/DegreePlan";

/**
 * Advising component displays the Advising page for the advisors.
 * Search for students to view their information and degree plan.
 * @component
 * @returns {JSX.Element} advisor view for searching and viewing student information
 */
export default function Advising() {

  // API client for backend requests
  const api = useApiClient();

  // State to hold search results
  const [assigned, setAssigned] = useState([]);
  const [results, setResults] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);

  // state to hold selected student and their programs
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [programs, setPrograms] = useState([]);
  const [selectedProgram, setSelectedProgram] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const list = await api.get('/api/students/assigned');
        setAssigned(Array.isArray(list) ? list : []);
      } catch (error) {
        console.error('[advising] Error fetching assigned students:', error.message);
      }
    })();
  }, [api]);

  // Handle search results from SearchBar component
  const handleSearchResults = (results) => {
    setResults(results);
    setHasSearched(true);
  }

  // Handle click on student from results list
  const handleStudentSelect = async (student) => {
    setSelectedStudent(student);

    try {
      const data = await api.get(`/api/students/${student.id}/programs`);
      setPrograms(data?.programs || []);
    } catch (error) {
      setPrograms([]);
      console.error('[advising] Error fetching student programs:', error.message);
    }
  }

  const searchStudentEndpoint = '/api/students/search';

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
      <ul className="results-list" data-testid="search-results">
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
              placeholder2="Name"
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