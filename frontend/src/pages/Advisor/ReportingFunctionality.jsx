/**
 * File: frontend/src/pages/Advisor/ReportingFunctionality.jsx
 * This file defines the Reporting Functionality page for advisors to generate reports.
 * Advisors can search for a course and view its enrollment report across 4 future semesters.
 */

import { useState } from "react";
import AdvisorNavBar from "../../components/NavBars/AdvisorNavBar";
import SearchBar from "../../components/SearchBar";
import ProgramSelector from "../../components/ProgramSelector";

export default function ReportingFunctionality() {
  // -----------------------------
  // State for searching and selection
  // -----------------------------
  const [results, setResults] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [programs, setPrograms] = useState([]);
  const [selectedProgram, setSelectedProgram] = useState(null);

  // -----------------------------
  // State for report table
  // -----------------------------
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // -----------------------------
  // Handle search results
  // -----------------------------
  const handleSearchResults = (results) => {
    setResults(results);
    setHasSearched(true);
  };

  // -----------------------------
  // Handle selecting a course
  // -----------------------------
  const handleCourseSelect = async (course) => {
    setSelectedCourse(course);
    setReport(null);
    setError(null);

    // Prefer course code fields only (not ID)
    const courseKey = course.code || course.course_code;
    if (!courseKey) {
      console.warn("No course code found for selected course:", course);
      return;
    }

    try {
      // fetch programs for the course
      const programsRes = await fetch(`/courses/${encodeURIComponent(courseKey)}/programs`);
      if (programsRes.ok) {
        const data = await programsRes.json();
        setPrograms(data.programs || []);
      } else {
        console.warn("Programs fetch returned", programsRes.status);
        setPrograms([]);
      }

      // Automatically fetch report for this course
      await fetchReport(courseKey);
    } catch (error) {
      console.error("Error fetching course programs or report:", error);
    }
  };

  // -----------------------------
  // Generate next four semesters
  // -----------------------------
  const getNextFourSemesters = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth(); // 0 = Jan

    let term = month >= 7 ? "Fall" : "Spring";
    let currentYear = year;

    const semesters = [];
    for (let i = 0; i < 4; i++) {
      semesters.push({ term, year: currentYear });
      if (term === "Spring") {
        term = "Fall";
      } else {
        term = "Spring";
        currentYear += 1;
      }
    }
    return semesters;
  };

  // -----------------------------
  // Fetch course enrollment report
  // -----------------------------
  const fetchReport = async (courseKey) => {
    if (!courseKey) return;
    setLoading(true);
    setError(null);
    setReport(null);

    try {
      const semesters = getNextFourSemesters();
      console.log("Fetching for semesters:", semesters);

      const requests = semesters.map(({ term, year }) =>
        fetch(`/courses/${encodeURIComponent(courseKey)}/enrollments?term=${term}&year=${year}`)
      );

      const responses = await Promise.all(requests);
      const dataArr = await Promise.all(
        responses.map((res) =>
          res.ok ? res.json() : Promise.reject(`Fetch failed: ${res.status}`)
        )
      );

      const allEnrollments = dataArr.flatMap((data) => {
        const enrollments =
          data.enrollments ||
          data.data?.enrollments ||
          (Array.isArray(data) ? data : []);

        return enrollments.map((row) => ({
          term: row.term || row.semester || "N/A",
          year: row.year || row.academic_year || "N/A",
          section: row.section || row.section_number || "N/A",
          course_code: row.course_code || row.code || courseKey,
          enrolled: Number(row.enrolled ?? row.enrollment_count ?? row.count ?? 0),
          capacity: Number(row.capacity ?? row.max_capacity ?? 0),
          instructor: row.instructor || row.instructor_name || "TBD",
        }));
      });

      setReport(allEnrollments);
    } catch (err) {
      console.error("Error fetching report:", err);
      setError(err.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  // -----------------------------
  // Render search results list
  // -----------------------------
  const renderResults = () => {
    if (!hasSearched) return null;

    if (results.length === 0) {
      return <p style={{ color: "black" }}>Course not found</p>;
    }

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

  // -----------------------------
  // Render report table
  // -----------------------------
  const renderReportTable = () => {
    if (loading) return <p>Loading enrollment data...</p>;
    if (error) return <p className="error">Error: {error}</p>;
    if (!report) return null;
    if (report.length === 0)
      return <p>No enrollment data found for "{selectedCourse?.code || selectedCourse?.course_code}".</p>;

    return (
      <table className="report-table" style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={{ border: "1px solid #ccc", padding: 6 }}>Course</th>
            <th style={{ border: "1px solid #ccc", padding: 6 }}>Term</th>
            <th style={{ border: "1px solid #ccc", padding: 6 }}>Year</th>
            <th style={{ border: "1px solid #ccc", padding: 6 }}>Section</th>
            <th style={{ border: "1px solid #ccc", padding: 6 }}>Enrolled</th>
            <th style={{ border: "1px solid #ccc", padding: 6 }}>Capacity</th>
            <th style={{ border: "1px solid #ccc", padding: 6 }}>Instructor</th>
          </tr>
        </thead>
        <tbody>
          {report.map((r, idx) => (
            <tr key={idx}>
              <td style={{ border: "1px solid #eee", padding: 6 }}>{r.course_code}</td>
              <td style={{ border: "1px solid #eee", padding: 6 }}>{r.term}</td>
              <td style={{ border: "1px solid #eee", padding: 6 }}>{r.year}</td>
              <td style={{ border: "1px solid #eee", padding: 6 }}>{r.section}</td>
              <td style={{ border: "1px solid #eee", padding: 6 }}>{r.enrolled}</td>
              <td style={{ border: "1px solid #eee", padding: 6 }}>{r.capacity}</td>
              <td style={{ border: "1px solid #eee", padding: 6 }}>{r.instructor}</td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  // -----------------------------
  // Main Render
  // -----------------------------
  return (
    <div>
      <AdvisorNavBar />
      <div className="window">
        <div className="title-bar">
          <h1>
            Reporting Functionality
            {selectedCourse && (
              <span style={{ fontSize: "0.8em", color: "#555", marginLeft: "0.5em" }}>
                — {selectedCourse.code || selectedCourse.course_code}
              </span>
            )}
          </h1>
        </div>

        <div className="container">
          <div className="side-panel">
            <p>Search a Course</p>
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
            <div className="section-results-side">
              <ProgramSelector
                student={selectedCourse}
                programs={programs}
                selectedStudentProgram={selectedProgram}
                setSelectedProgram={setSelectedProgram}
              />
            </div>

            <div className="section-results-main">{renderReportTable()}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
