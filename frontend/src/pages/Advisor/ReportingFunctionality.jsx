/**
 * File: frontend/src/pages/Advisor/ReportingFunctionality.jsx
 * This file defines the Reporting Functionality page for advisors to generate reports.
 * Includes major selection and reporting components
 */

import { useState } from "react";
import AdvisorNavBar from "../../components/NavBars/AdvisorNavBar";
import SearchBar from "../../components/SearchBar";
import MajorSelector from "../../components/MajorSelector";

/**
 * Advising component displays the Advising page for the advisors.
 * Search for students to view their information and degree plan.
 * @component
 * @returns {JSX.Element} advisor view for generating reports
 */
export default function ReportingFunctionality() {
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
  const handleCourseSelect = async (course) => {
    setSelectedCourse(course);

    try {
      // get list of programs for course
      const response = await fetch(`/courses/${course.id}/programs`);
      const data = await response.json();
      setPrograms(data.programs || []);
    } catch (error) {
      console.error('Error fetching course programs:', error);
    }
  }

  const searchCourseEndpoint = '/students/search';

  // render results message only after a search has been made
  const renderResults = () => {
    if (!hasSearched) {
      return null;
    }

    if (results.length === 0) {
      return <p style={{ color: "black" }}>Course not found</p>;
    }

    // render results list
    return (
      <ul className="results-list">
        {results.map((course, index) => (
          <li key={index} className={`result-item ${selectedCourse?.id === course.id ? 'selected' : ''}`} onClick={() => handleCourseSelect(course)}>
            <strong>{course.name}</strong> <br />
            {course.id}
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
            <p>Search a Program or Course</p>
            <SearchBar
              onSearch={handleSearchResults}
              searchEndpoint={searchCourseFindAStudentEndpoint}
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