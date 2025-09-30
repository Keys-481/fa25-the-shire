import { useState } from 'react'
import AdminNavBar from '../../components/NavBars/AdminNavBar'
import SearchBar from '../../components/SearchBar'


/**
 * AdminCourses component displays the Courses page for admin users.
 * 
 * @component
 * @returns {JSX.Element} A simple admin view for managing or viewing courses
 */
export default function AdminCourses() {
  // Defined color scheme
  const backgroundColor = '#FFFFFF'
  const mainColor = '#000000'
  const accentColor = '#09347a'

  const [results, setResults] = useState([])
  const [isAddingCourse, setIsAddingCourse] = useState(false)


  const handleSearchResults = (results) => {
    setResults(results)
  }

  // Backend endpoint for searching courses
  const searchEndpoint = '/courses/search'

  const styles = {
    container: {
      backgroundColor: backgroundColor,
      minHeight: '100%',
      width: '100%',
      display: 'flex',
      flexDirection: 'row',
    },
    searchSection: {
      display: 'flex',
      flexDirection: 'column',
    },
    resultsSection: {
      display: 'flex',
      flexDirection: 'column',
      marginLeft: '20%',
      alignItems: 'left',
    },
    h2: {
      margin: '2px',
      color: mainColor,
      fontSize: '22px',
      marginLeft: '10px',
      fontFamily: 'Arial, sans-serif',
    },
    h3: {
      margin: '2px',
      color: mainColor,
      fontSize: '18px',
      marginLeft: '5px',
      fontFamily: 'Arial, sans-serif',
      fontWeight: 'bold',
      position: 'relative',
      width: '60vw',
    },
    hhorizontalLine: {
      position: 'relative',
      width: '60vw',
      height: '2px',
      backgroundColor: mainColor,
      marginBottom: '50px',
      right: '17.5vw'
    },
    addButton: {
      padding: '6px 12px',
      backgroundColor: accentColor,
      color: backgroundColor,
      border: `2px solid ${mainColor}`,
      borderRadius: '5px',
      fontSize: '14px',
      cursor: 'pointer',
      marginBottom: '5px',
      marginRight: '10px',
      marginLeft: '10px',
    },
    h3Row: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      width: '60vw',
      position: 'relative',
      right: '17.5vw',
      marginTop: '20px',
    },
    textboxRow: {
      display: 'flex',
      justifyContent: 'left',
      alignItems: 'center',
      width: '60vw',
      position: 'relative',
      right: '17.5vw',
      marginTop: '10px',
    },
  }

  return (
    <div>
      <AdminNavBar />
      <h2 style={styles.h2}>Courses</h2>
      <div style={{ width: '100%', height: '2px', backgroundColor: mainColor }}></div>
      <div style={{ width: '2px', height: 'calc(100vh - 100px)', backgroundColor: mainColor, position: 'absolute', top: '100px', left: '20vw' }} />

      <div style={styles.container}>
        <div style={styles.searchSection}>

          <SearchBar onSearch={handleSearchResults} searchEndpoint={searchEndpoint} placeholder1="Course Name" placeholder2="Course ID" />
          <div style={{ position: 'absolute', width: '20vw', height: '2px', backgroundColor: mainColor, marginTop: '105px', right: '80vw' }}></div>
          <div>
            {results.length === 0 ? (
              <p>No results found</p>
            ) : (
              <ul>
                {results.map((item, index) => (
                  <li key={index}>
                    {item.id} - {item.name}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        <div style={styles.resultsSection}>
          {!isAddingCourse ? (
            <>
              <div style={styles.h3Row}>
                <button
                  style={styles.addButton}
                  onClick={() => setIsAddingCourse(true)}
                >
                  Add Course
                </button>
              </div>
              <div style={styles.hhorizontalLine}></div>
            </>
          ) : (
            <div style={styles.resultsSection}>
              <div style={styles.h3Row}>
                <div style={styles.h3}>Add New Course</div>
                <button style={styles.addButton}> {/* TODO: Implement call to backend for adding course to database */}
                  Add
                </button>
                <button style={styles.addButton} onClick={() => setIsAddingCourse(false)}>
                  Cancel
                </button>
              </div>
              <div style={styles.hhorizontalLine}></div>

              {/* Course Information */}
              <div style={styles.textboxRow}>
                <p style={{ width: '150px' }}>Course Name:</p>
                <input type="text" placeholder="Name" />
              </div>
              <div style={styles.textboxRow}>
                <p style={{ width: '150px' }}>Course ID:</p>
                <input type="text" placeholder="ID" />
              </div>
              <div style={styles.textboxRow}>
                <p style={{ width: '150px' }}>Course Description:</p>
                <input type="text" placeholder="Description" />
              </div>
              <div style={styles.textboxRow}>
                <p style={{ width: '150px' }}>Course Weeks:</p>
                <input type="text" placeholder="Weeks" />
              </div>
              <div style={styles.textboxRow}>
                <p style={{ width: '150px' }}>Course Cost:</p>
                <input type="text" placeholder="Cost" />
              </div>
              <div style={styles.textboxRow}>
                <p style={{ width: '150px' }}>Course Professor:</p>
                <input type="text" placeholder="Professor" />
              </div>
              <div style={styles.textboxRow}>
                <p style={{ width: '150px' }}>Course Seats:</p>
                <input type="text" placeholder="Seats" />
              </div>
              <div style={styles.textboxRow}>
                <p style={{ width: '150px' }}>Course Program:</p>
                <input type="text" placeholder="Program" />
              </div>
              <div style={styles.textboxRow}>
                <p style={{ width: '150px' }}>Course Certificates:</p>
                <input type="text" placeholder="Certificates" />
              </div>
              <div style={styles.textboxRow}>
                <p style={{ width: '150px' }}>Course Type:</p>
                <input type="text" placeholder="Type" />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
