const db = require('../db') // your database connection

module.exports = {
  async findByName(name) {
    return db.query(
      'SELECT course_id, course_name FROM courses WHERE course_name ILIKE $1',
      [`%${name}%`]
    ).then(res => res.rows)
  },

  async findById(id) {
    return db.query(
      'SELECT course_id, course_name FROM courses WHERE course_id ILIKE $1',
      [`%${id}%`]
    ).then(res => res.rows)
  },

  async findByNameAndId(name, id) {
    return db.query(
      'SELECT course_id, course_name FROM courses WHERE course_name ILIKE $1 AND course_id ILIKE $2',
      [`%${name}%`, `%${id}%`]
    ).then(res => res.rows)
  },
}
