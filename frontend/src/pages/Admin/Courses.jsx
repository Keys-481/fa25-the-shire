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

  const [results, setResults] = useState([])
  const [isAddingCourse, setIsAddingCourse] = useState(false)


  const handleSearchResults = (results) => {
    setResults(results)
  }

  // Backend endpoint for searching courses
  const searchEndpoint = '/courses/search'

  return (
    <div>
      <AdminNavBar />
      <div className="window">

        <div className="title-bar">
          <h1>Courses</h1>
        </div>

        <div className="container">

          <div className="side-panel">
            <SearchBar onSearch={handleSearchResults} searchEndpoint={searchEndpoint} placeholder1="Course Name" placeholder2="Course ID" />
            <div className="horizontal-line-half"></div>
            <div className="side-panel-results">
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
          <div className="section-results">
            {!isAddingCourse ? (
              <div className="section-results-side">
                <div className="h2-row">
                  <button onClick={() => setIsAddingCourse(true)}>
                    Add Course
                  </button>
                </div>
                <div className="horizontal-line"></div>
              </div>
            ) : (
              <div className="section-results-side">
                <div className="h2-row">
                  <h2>Add New Course</h2>
                  <button> {/* TODO: Implement call to backend for adding course to database */}
                    Add
                  </button>
                  <button onClick={() => setIsAddingCourse(false)}>
                    Cancel
                  </button>
                </div>
                <div className="horizontal-line"></div>

                {/* Course Information */}
                <div className="textbox-row">
                  <p className="layout">Course Name:</p>
                  <input type="text" className="textbox" placeholder="Name" />
                </div>
                <div className="textbox-row">
                  <p className="layout">Course ID:</p>
                  <input type="text" className="textbox" placeholder="ID" />
                </div>
                <div className="textbox-row">
                  <p className="layout">Course Description:</p>
                  <input type="text" className="textbox" placeholder="Description" />
                </div>
                <div className="textbox-row">
                  <p className="layout">Course Weeks:</p>
                  <input type="text" className="textbox" placeholder="Weeks" />
                </div>
                <div className="textbox-row">
                  <p className="layout">Course Cost:</p>
                  <input type="text" className="textbox" placeholder="Cost" />
                </div>
                <div className="textbox-row">
                  <p className="layout">Course Professor:</p>
                  <input type="text" className="textbox" placeholder="Professor" />
                </div>
                <div className="textbox-row">
                  <p className="layout">Course Seats:</p>
                  <input type="text" className="textbox" placeholder="Seats" />
                </div>
                <div className="textbox-row">
                  <p className="layout">Course Program:</p>
                  <input type="text" className="textbox" placeholder="Program" />
                </div>
                <div className="textbox-row">
                  <p className="layout">Course Certificates:</p>
                  <input type="text" className="textbox" placeholder="Certificates" />
                </div>
                <div className="textbox-row">
                  <p className="layout">Course Type:</p>
                  <input type="text" className="textbox" placeholder="Type" />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
