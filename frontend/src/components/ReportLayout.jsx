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
    if (!q.trim()) return;
    setLoading(true);
    setError(null);
    setReport(null);

    try {
      const getNextFourSemesters = () => {
        const now = new Date();
        let year = now.getFullYear();
        const month = now.getMonth();
        let term = month >= 7 ? "Fall" : "Spring";
        const semesters = [];
        for (let i = 0; i < 4; i++) {
          semesters.push({ term, year });
          if (term === "Spring") {
            term = "Fall";
          } else {
            term = "Spring";
            year += 1;
          }
        }
        return semesters;
      };

      const semesters = getNextFourSemesters();
      const responses = await Promise.all(
        semesters.map(({ term, year }) =>
          fetch(`/courses/enrollments?courseCode=${encodeURIComponent(q)}&term=${term}&year=${year}`)
        )
      );

      const dataArr = await Promise.all(
        responses.map((res) => (res.ok ? res.json() : Promise.reject(res.statusText)))
      );

      const allEnrollments = dataArr.flatMap((data) => {
        const enrollments = data.enrollments || data.data?.enrollments || (Array.isArray(data) ? data : []);
        return enrollments.map((row) => ({
          course_code: row.course_code || q,
          term: row.term || "N/A",
          year: row.year || "N/A",
          section: row.section || "N/A",
          enrolled: Number(row.enrolled ?? 0),
          capacity: Number(row.capacity ?? 0),
          instructor: row.instructor || "TBD",
        }));
      });

      setReport(allEnrollments);
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
  if (report.length === 0) return <p>No enrollment data found for {courseCode}.</p>;

  return (
    <table className="report-table" style={{ width: "100%", borderCollapse: "collapse" }}>
      <thead style={{ backgroundColor: "#f0f0f0" }}>
        <tr>
          <th>Course Code</th>
          <th>Term</th>
          <th>Year</th>
          <th>Section</th>
          <th>Enrolled</th>
          <th>Capacity</th>
          <th>Instructor</th>
        </tr>
      </thead>
      <tbody>
        {report.map((r, idx) => (
          <tr key={idx}>
            <td>{r.course_code}</td>
            <td>{r.term}</td>
            <td>{r.year}</td>
            <td>{r.section}</td>
            <td>{r.enrolled}</td>
            <td>{r.capacity}</td>
            <td>{r.instructor}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
