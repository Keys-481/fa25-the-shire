/**  File: frontend/src/components/ReportLayout.jsx
 *  Component to display enrollment report for a selected course across next 4 semesters.
 * */
import { useEffect, useState } from "react";

//
export default function ReportLayout({ courseCode }) {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch report data when courseCode changes
  useEffect(() => {
    if (!courseCode) return;
    fetchReport(courseCode);
  }, [courseCode]);

  // Function to fetch enrollment report data
  const fetchReport = async (q) => {
    if (!q || !q.trim()) return;
    setLoading(true);
    setError(null);
    setReport(null);

    try {
      // return an array of the next 4 semesters 
      const getNextFourSemesters = () => {
        const terms = ['Spring', 'Summer', 'Fall'];
        const now = new Date();
        const month = now.getMonth();
        let termIndex;
        let year = now.getFullYear();

        if (month >= 8) {
          termIndex = 2;
        } else if (month >= 5) {
          termIndex = 1;
        } else {
          termIndex = 0;
        }

        const result = [];
        for (let i = 0; i < 4; i++) {
          const idx = (termIndex + i) % terms.length;
          const addYear = Math.floor((termIndex + i) / terms.length);
          result.push({ term: terms[idx], year: year + addYear });
        }
        return result;
      };

      const semesters = Array.isArray(getNextFourSemesters()) ? getNextFourSemesters() : [];

      const res = await fetch(
        `/api/courses/enrollments?courseCode=${encodeURIComponent(q)}`
      );

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || res.statusText || `HTTP ${res.status}`);
      }

      const data = await res.json();
      const enrollments = Array.isArray(data.enrollments) ? data.enrollments : [];

      const pivoted = {};
      semesters.forEach(({ term, year }) => {
        const label = `${term} ${year}`;
        const match = enrollments.find(e => e.semester === label);
        pivoted[label] = match ? match.count : 0;
      });

      // Update report state
      setReport(pivoted);
    } catch (err) {
      console.error("Error fetching report:", err);
      setError(err.message || "Error fetching report");
    } finally {
      setLoading(false);
    }
  };

  // Render logic
  if (!courseCode) return <p style={{ color: "#666" }}>Select a course to view its report.</p>;
  if (loading) return <p>Loading report for {courseCode}...</p>;
  if (error) return <p style={{ color: "red" }}>Error: {error}</p>;
  if (!report) return null;

  const semesterLabels = Object.keys(report);

  // Render the report table
  return (
    <table className="requirements-table" style={{ width: "100%", borderCollapse: "collapse" }}>
      <thead>
        <tr>
          <th>Course Code</th>
          {semesterLabels.map((label) => (
            <th key={label}>{label}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>{courseCode}</td>
          {semesterLabels.map((label) => (
            <td key={label}>{report[label]}</td>
          ))}
        </tr>
      </tbody>
    </table>
  );
}