/**
 * File: frontend/src/pages/Advisor/ReportingFunctionality.jsx
 * Advisors can search for a course and view its enrollment report across 4 future semesters.
 */
import { useState } from "react";
import AdvisorNavBar from "../../components/NavBars/AdvisorNavBar";
import SearchBar from "../../components/SearchBar";
import ReportLayout from "../../components/ReportLayout";

export default function ReportingFunctionality() {
  const [results, setResults] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);

  const handleSearchResults = (results) => {
    setResults(results);
    setHasSearched(true);
  };

  const handleCourseSelect = (course) => {
    console.log("Selected course:", course);
    setSelectedCourse(course);
  };

  const renderResults = () => {
    if (!hasSearched) return null;
    if (results.length === 0) return <p style={{ color: "black" }}>No courses found.</p>;

    return (
      <ul className="results-list">
        {results.map((course, index) => (
          <li
            key={index}
            className={`result-item ${selectedCourse?.code === course.code ? "selected" : ""}`}
            onClick={() => handleCourseSelect(course)}
          >
            <strong>{course.name}</strong> <br />
            {course.code || course.course_code || "No code"}
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div>
      <AdvisorNavBar />
      <div className="window">
        <div className="title-bar">
          <h1>Reporting Functionality</h1>
        </div>

        <div className="container">
          <div className="side-panel">
            <p>Search for a Course</p>
            <SearchBar
              onSearch={handleSearchResults}
              searchEndpoint="/courses/search"
              placeholder1="Course Name"
              placeholder2="Course Code"
            />
            <div className="horizontal-line-half"></div>
            <div className="side-panel-results">{renderResults()}</div>
          </div>

          <div className="section-results">
            <div className="section-results-main">
              <ReportLayout courseCode={selectedCourse?.code || selectedCourse?.course_code} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
