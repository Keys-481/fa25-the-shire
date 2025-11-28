/**  File: frontend/src/components/ReportLayout.jsx
 *  Component to display enrollment report for a selected course across next 4 semesters.
 * */
import { useEffect, useState } from "react";
import { useApiClient } from "../lib/apiClient";

export default function ReportLayout({ courseCode }) {
  const [report, setReport] = useState(null);   // single course OR all courses
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [semesterLabels, setSemesterLabels] = useState([]);
  const apiClient = useApiClient();

  // Generate semester labels once when component loads
  useEffect(() => {
    const terms = ["Spring", "Summer", "Fall"];
    const now = new Date();
    const month = now.getMonth();
    let termIndex;
    let year = now.getFullYear();

    if (month >= 8) termIndex = 2;
    else if (month >= 5) termIndex = 1;
    else termIndex = 0;

    const result = [];
    for (let i = 0; i < 4; i++) {
      const idx = (termIndex + i) % terms.length;
      const addYear = Math.floor((termIndex + i) / terms.length);
      result.push(`${terms[idx]} ${year + addYear}`);
    }

    setSemesterLabels(result);
  }, []);

  // When component loads OR the selected course changes
  useEffect(() => {
    if (!semesterLabels.length) return;

    if (!courseCode) {
      fetchAllCourses();
    } else {
      fetchReport(courseCode);
    }
  }, [courseCode, semesterLabels]);

  /**
   * Fetch single course report
   */
  const fetchReport = async (q) => {
    if (!q || !q.trim()) return;
    setLoading(true);
    setError(null);
    setReport(null);

    try {
      const data = await apiClient.get(`/courses/enrollments?courseCode=${encodeURIComponent(q)}`);
      const enrollments = data.enrollments || [];

      const pivoted = {};
      semesterLabels.forEach((label) => {
        const match = enrollments.find((e) => e.semester === label);
        pivoted[label] = match ? match.count : 0;
      });

      setReport([{ course_code: q, ...pivoted }]);
    } catch (err) {
      setError(err.message || "Error fetching report");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Fetch ALL courses report
   */
  const fetchAllCourses = async () => {
    setLoading(true);
    setError(null);
    setReport(null);

    try {
      const data = await apiClient.get(`/courses/enrollments/all`);
      const list = data.enrollments || [];

      const map = {};

      list.forEach((row) => {
        const c = row.course_code;
        if (!map[c]) {
          map[c] = { course_code: c };
          semesterLabels.forEach((label) => (map[c][label] = 0));
        }
        if (semesterLabels.includes(row.semester)) {
          map[c][row.semester] = row.count;
        }
      });

      setReport(Object.values(map));
    } catch (err) {
      setError(err.message || "Error fetching all courses");
    } finally {
      setLoading(false);
    }
  };

  // Render logic
  if (loading) return <p>Loading report...</p>;
  if (error) return <p style={{ color: "red" }}>Error: {error}</p>;
  if (!report) return null;

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
        {report.map((row) => (
          <tr key={row.course_code}>
            <td>{row.course_code}</td>
            {semesterLabels.map((label) => (
              <td key={label}>{row[label]}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}