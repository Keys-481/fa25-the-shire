import { useEffect, useState } from 'react';
import AdminNavBar from '../../components/NavBars/AdminNavBar';
import SearchBar from '../../components/SearchBar';

export default function AdminCourses() {
  const [results, setResults] = useState([]);
  const [isAddingCourse, setIsAddingCourse] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [courseForm, setCourseForm] = useState({
    name: '',
    code: '',
    credits: ''
  });

  const searchEndpoint = '/courses/search';

  /**
   * Handles search results returned from the SearchBar component.
   * Clears any selected course and resets the form.
   */
  const handleSearchResults = (results) => {
    setResults(results);
    setSelectedCourse(null);
    resetForm();
  };

   /**
   * Clears selected course on initial load.
   */
  useEffect(() => {
    setSelectedCourse(null);
  }, []);


  /**
   * When a course is selected, populate the form with its data
   * and switch to edit mode.
   */
  useEffect(() => {
    if (selectedCourse) {
      setCourseForm({
        name: selectedCourse.name || '',
        code: selectedCourse.code || '',
        credits: selectedCourse.credits || ''
      });
      setIsAddingCourse(true);
    }
  }, [selectedCourse]);

  /**
   * Sends a POST request to add a new course to the database.
   * Updates the results list and resets the form.
   */
  const handleAddCourse = async () => {
    try {
      const response = await fetch('/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(courseForm)
      });

      if (!response.ok) throw new Error('Failed to add course');

      const addedCourse = await response.json();
      setResults([...results, addedCourse]);
      resetForm();
    } catch (error) {
      console.error('Error adding course:', error);
    }
  };

  /**
   * Sends a PUT request to update an existing course.
   * Replaces the updated course in the results list and resets the form.
   */
  const handleUpdateCourse = async () => {
    try {
      const response = await fetch(`/courses/${courseForm.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(courseForm)
      });

      if (!response.ok) throw new Error('Failed to update course');

      const updatedCourse = await response.json();
      setResults(results.map(c => c.id === updatedCourse.id ? updatedCourse : c));
      resetForm();
    } catch (error) {
      console.error('Error updating course:', error);
    }
  };

   /**
   * Resets the form and exits add/edit mode.
   */
  const resetForm = () => {
    setIsAddingCourse(false);
    setSelectedCourse(null);
    setCourseForm({
      name: '',
      code: '',
      credits: '',
    });
  };

  return (
    <div>
      <AdminNavBar />
      <div className="window">
        <div className="title-bar">
          <h1>Courses</h1>
        </div>

        <div className="container">
          <div className="side-panel">
            <SearchBar
              onSearch={handleSearchResults}
              searchEndpoint={searchEndpoint}
              placeholder1="Course Name"
              placeholder2="Course Code"
            />
            <div className="horizontal-line-half"></div>
            <div className="side-panel-results">
              {results.length === 0 ? (
                <p>No results found</p>
              ) : (
                <ul className="results-list">
                  {results.map((item, index) => (
                    <li
                      key={index}
                      className={`result-item ${selectedCourse?.id === item.id ? 'selected' : ''}`}
                      onClick={() => {
                        if (selectedCourse?.id === item.id) {
                          setSelectedCourse(null); // unselect if already selected
                          resetForm();
                        } else {
                          setSelectedCourse(item); // select if not selected
                        }
                      }}
                    >
                      <strong>{item.code}</strong> — {item.name}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div className="section-results">
            {isAddingCourse ? (
              <div className="section-results-side">
                <div className="h2-row">
                  <h2>{selectedCourse ? 'Edit Course' : 'Add New Course'}</h2>
                  <button onClick={selectedCourse ? handleUpdateCourse : handleAddCourse}>
                    {selectedCourse ? 'Save' : 'Add'}
                  </button>
                  <button onClick={resetForm}>Cancel</button>
                  {selectedCourse && (
                    <button className="error-message">Delete</button>
                  )}
                </div>
                <div className="horizontal-line"></div>

                {[
                  { label: 'Course Name', key: 'name' },
                  { label: 'Course Code', key: 'code' },
                  { label: 'Course Credits', key: 'credits' },
                ].map(({ label, key }) => (
                  <div className="textbox-row" key={key}>
                    <p className="layout">{label}:</p>
                    <input
                      type="text"
                      className="textbox"
                      value={courseForm[key]}
                      onChange={(e) =>
                        setCourseForm({ ...courseForm, [key]: e.target.value })
                      }
                      placeholder={label}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="section-results-side">
                <div className="h2-row">
                  <button onClick={() => setIsAddingCourse(true)}>Add Course</button>
                </div>
                <div className="horizontal-line"></div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
