import { useState } from "react";

export default function ReportLayout() {
  const [query, setQuery] = useState(""); // course code (e.g., CS101)
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Fetch enrollment data for the next 4 semesters of a given course_code.
   */
  const fetchReport = async (q) => {
    if (!q.trim()) return;
    setLoading(true);
    setError(null);
    setReport(null);

    try {
      // Generate the next 4 semesters starting from the current term
      const getNextFourSemesters = () => {
        const now = new Date();
        let year = now.getFullYear();
        const month = now.getMonth(); // 0 = Jan, 11 = Dec

        // Determine current term: Spring (Jan–Jul) or Fall (Aug–Dec)
        let term = month >= 7 ? "Fall" : "Spring";

        const semesters = [];
        for (let i = 0; i < 4; i++) {
          semesters.push({ term, year });
          if (term === "Spring") {
            term = "Fall"; // next term same year
          } else {
            term = "Spring";
            year += 1; // next term is next year
          }
        }
        return semesters;
      };

      const semesters = getNextFourSemesters();

      // Fetch all semesters in parallel
      const responses = await Promise.all(
        semesters.map(({ term, year }) =>
          fetch(
            `/courses/enrollments?courseCode=${encodeURIComponent(q)}&term=${term}&year=${year}`
          )
        )
      );

      const dataArr = await Promise.all(
        responses.map((res) => {
          if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
          return res.json();
        })
      );

      // Normalize and flatten data
      const allEnrollments = dataArr.flatMap((data) => {
        const enrollments =
          data.enrollments ||
          data.data?.enrollments ||
          (Array.isArray(data) ? data : []);

        return enrollments.map((row) => {
          const code =
            row.course_code ||
            row.code ||
            row.courseCode ||
            row.course_id ||
            q; // fallback to search query

          return {
            course_code: code,
            term: row.term || row.semester || "N/A",
            year: row.year || row.academic_year || "N/A",
            section: row.section || row.section_number || "N/A",
            enrolled: Number(
              row.enrolled ?? row.enrollment_count ?? row.count ?? 0
            ),
            capacity: Number(row.capacity ?? row.max_capacity ?? 0),
            instructor: row.instructor || row.instructor_name || "TBD",
          };
        });
      });

      setReport(allEnrollments);
    } catch (err) {
      console.error("Error fetching report:", err);
      setError(err.message || "Unknown error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="report-layout" style={{ padding: "1.5rem" }}>
      <h2 style={{ marginBottom: "1rem" }}>📊 Course Enrollment Report</h2>

      {/* Search input */}
      <div style={{ marginBottom: 16 }}>
        <input
          type="text"
          placeholder="Enter course code (e.g., CS101)"
          value={query}
          onChange={(e) => setQuery(e.target.value.toUpperCase())}
          style={{
            marginRight: 8,
            padding: 6,
            fontSize: 14,
            border: "1px solid #ccc",
            borderRadius: 4,
          }}
        />
        <button
          onClick={() => fetchReport(query)}
          disabled={loading || !query.trim()}
          style={{
            padding: "6px 12px",
            backgroundColor: "#005bbb",
            color: "white",
            border: "none",
            borderRadius: 4,
            cursor: "pointer",
          }}
        >
          {loading ? "Loading..." : "Search"}
        </button>
      </div>

      {/* Error or Empty States */}
      {error && <p style={{ color: "red" }}>Error: {error}</p>}
      {!loading && report && report.length === 0 && (
        <p>No enrollment data found for "{query}".</p>
      )}

      {/* Enrollment Table */}
      {report && report.length > 0 && (
        <table
          className="report-table"
          style={{
            width: "100%",
            borderCollapse: "collapse",
            backgroundColor: "white",
          }}
        >
          <thead style={{ backgroundColor: "#f0f0f0" }}>
            <tr>
              <th style={{ border: "1px solid #ccc", padding: 6 }}>Course Code</th>
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
      )}
    </div>
  );
}
