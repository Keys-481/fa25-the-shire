// File: frontend/src/components/ReportLayout.jsx
import { useState, useEffect } from "react";

export default function ReportLayout({ courseCode }) {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!courseCode) return;
    fetchReport(courseCode);
  }, [courseCode]);

   const fetchReport = async (q) => {
    if (!q || !q.trim()) return;
    setLoading(true);
    setError(null);
    setReport(null);

    try {
      // return an array of the next 4 semesters as { term, year }
      const getNextFourSemesters = () => {
        const terms = ['Spring', 'Summer', 'Fall'];
        const now = new Date();
        const month = now.getMonth(); // 0-11
        let termIndex;
        let year = now.getFullYear();

        if (month >= 8) { // Sep-Dec -> Fall
          termIndex = 2;
        } else if (month >= 5) { // Jun-Aug -> Summer
          termIndex = 1;
        } else { // Jan-May -> Spring
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
        `/courses/enrollments?courseCode=${encodeURIComponent(q)}`
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

      setReport(pivoted);
    } catch (err) {
      console.error("Error fetching report:", err);
      setError(err.message || "Error fetching report");
    } finally {
      setLoading(false);
    }
  };

  if (!courseCode) return <p style={{ color: "#666" }}>Select a course to view its report.</p>;
  if (loading) return <p>Loading report for {courseCode}...</p>;
  if (error) return <p style={{ color: "red" }}>Error: {error}</p>;
  if (!report) return null;

  const semesterLabels = Object.keys(report);

  return (
    <table className="report-table" style={{ width: "100%", borderCollapse: "collapse" }}>
      <thead style={{ backgroundColor: "#f0f0f0" }}>
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