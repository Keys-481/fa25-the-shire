// File: frontend/src/pages/Accounting/AccountingGraduationReport.jsx
import { useState } from "react";
import AccountingNavBar from "../../components/NavBars/AccountingNavBar";
import GraduationReportLayout from "../../components/GradLayout";
import SearchBar from "../../components/SearchBar";


/**
 * AccountingGraduationReport
 * Page to display the Graduation Report for accounting department
 */
export default function AccountingGraduationReport() {
  const [results, setResults] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState(null);

  const handleSearchResults = (results) => {
    if (!results || results.length === 0) {
      // Search cleared or nothing found → reset
      setResults([]);
      setHasSearched(false);
      setSelectedProgram(null);
    } else {
      setResults(results);
      setHasSearched(true);
    }
  };

  // Handle course selection from results
  const handleProgramSelect = (program) => {
    console.log("Selected Program:", program);
    setSelectedProgram(program);
  };

  // Render search results
  const renderResults = () => {
    if (!hasSearched) return null;
    if (results.length === 0) return <p style={{ color: "black" }}>No Program or Student Found.</p>;

    return (
      <ul programName="results-list">
        {results.map((program, index) => (
          <li
            key={index}
            programName={`result-item ${selectedProgram?.code === program.code ? "selected" : ""}`}
            onClick={() => handleProgramSelect(program)}
          >
            <strong>{program.name}</strong> <br />
            {program.code || program.program_code || "No code"}
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div>
      <AccountingNavBar />
      <div className="window">
        <div className="title-bar">
          <h1>Graduation Report</h1>
        </div>

        <div className="container">
          <div className="side-panel">
            <p>Search by Program</p>
            <SearchBar
              onSearch={handleSearchResults}
              searchEndpoint="/programs/search"
              placeholder1="Program Name"
              placeholder2=""
            />
            <div className="horizontal-line-half"></div>
            <div className="side-panel-results">{renderResults()}</div>
          </div>

          <div className="section-results">
            <div className="section-results-main">
              <GraduationReportLayout />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}