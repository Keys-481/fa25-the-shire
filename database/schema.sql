-- Drop tables in a specific order to avoid foreign key constraints errors
DROP TABLE IF EXISTS comments, notifications;
DROP TABLE IF EXISTS degree_plans, enrollments;
DROP TABLE IF EXISTS student_certificates;
DROP TABLE IF EXISTS advising_relations;
DROP TABLE IF EXISTS student_courses, certificate_courses;
DROP TABLE IF EXISTS requirement_courses;
DROP TABLE IF EXISTS semester_offerings;
DROP TABLE IF EXISTS course_prerequisites;
DROP TABLE IF EXISTS user_roles, user_permissions, role_permissions;
DROP TABLE IF EXISTS students, advisors, users;
DROP TABLE IF EXISTS semesters, programs, courses, certificates;
DROP TYPE IF EXISTS grade, program_type, requirement_type, notif_type, cert_status, permission_name, role_name;

-- Define Custom Types --
CREATE TYPE grade AS ENUM('A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'D-', 'F', 'W');
CREATE TYPE program_type AS ENUM('masters', 'certificate', 'undergraduate');
CREATE TYPE requirement_type AS ENUM('core', 'elective', 'culminating_activity', 'portfolio', 'thesis');
CREATE TYPE notif_type AS ENUM('info', 'warning', 'alert');
CREATE TYPE cert_status AS ENUM('in_progress', 'completed');
CREATE TYPE role_name AS ENUM('admin', 'advisor', 'student', 'accounting');
CREATE TYPE permission_name AS ENUM('view_all_students', 'view_assigned_students',
                                    'view_own_data', 'edit_degree_plan', 'comment_create',
                                    'comment_edit', 'comment_delete', 'enrollment_reporting',
                                    'graduation_reporting', 'user_create', 'user_modify', 'user_delete',
                                    'user_grant_permissions');

-- Core User and Access Management Tables --
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    password_hash VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone_number VARCHAR(20) UNIQUE,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
);

CREATE TABLE roles (
    role_id SERIAL PRIMARY KEY,
    role_name role_name UNIQUE NOT NULL,
);

CREATE TABLE permissions (
    permission_id SERIAL PRIMARY KEY,
    permission_name permission_name UNIQUE NOT NULL,
);

CREATE TABLE role_permissions (
    role_id INT REFERENCES roles(role_id) ON DELETE CASCADE,
    permission_id INT REFERENCES permissions(permission_id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id),
);

CREATE TABLE user_roles (
    user_id INT REFERENCES users(user_id) ON DELETE CASCADE,
    role_id INT REFERENCES roles(role_id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, role_id),
);

-- optional direct user-permission grants/revokes that override role-based permissions --
CREATE TABLE user_permissions (
    user_id INT REFERENCES users(user_id) ON DELETE CASCADE,
    permission_id INT REFERENCES permissions(permission_id) ON DELETE CASCADE,
    grant_or_revoke BOOLEAN NOT NULL, -- TRUE = grant, FALSE = revoke --
    PRIMARY KEY (user_id, permission_id),
)

-- Student and Advisor Tables --
CREATE TABLE students (
    student_id SERIAL PRIMARY KEY,
    school_student_id VARCHAR(9) UNIQUE NOT NULL,
    user_id INT REFERENCES users(user_id) ON DELETE CASCADE,
    program_id VARCHAR(100) NOT NULL,
);

CREATE TABLE advisors (
    advisor_id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(user_id) ON DELETE CASCADE,
);

CREATE TABLE advising_relations (
    advisor_id INT REFERENCES advisors(advisor_id) ON DELETE CASCADE,
    student_id INT REFERENCES students(student_id) ON DELETE CASCADE,
    PRIMARY KEY (advisor_id, student_id),
);

-- Programs and Courses Tables --
CREATE TABLE programs (
    program_id SERIAL PRIMARY KEY,
    program_name VARCHAR(255) NOT NULL,
    program_type program_type NOT NULL,
);

CREATE TABLE courses (
    course_id SERIAL PRIMARY KEY,
    course_code VARCHAR(20) UNIQUE NOT NULL,
    course_name VARCHAR(255) NOT NULL,
    credits INT NOT NULL,
);

CREATE TABLE semesters (
    semester_id SERIAL PRIMARY KEY,
    semester_name VARCHAR(50) UNIQUE NOT NULL,
    sem_start_date DATE NOT NULL,
    sem_end_date DATE NOT NULL,
);

CREATE TABLE course_prerequisites (
    course_id INT REFERENCES courses(course_id) ON DELETE CASCADE,
    prerequisite_course_id INT REFERENCES courses(course_id) ON DELETE CASCADE,
    PRIMARY KEY (course_id, prerequisite_course_id),
);

CREATE TABLE semester_offerings (
    course_id INT REFERENCES courses(course_id) ON DELETE CASCADE,
    semester_id INT REFERENCES semesters(semester_id) ON DELETE CASCADE,
    PRIMARY KEY (course_id, semester_id),
);

CREATE TABLE program_requirements (
    requirement_id SERIAL PRIMARY KEY,
    program_id INT REFERENCES programs(program_id) ON DELETE CASCADE,
    requirement_type requirement_type NOT NULL,
    req_description TEXT NOT NULL,
    required_credits INT NOT NULL,
    parent_requirement_id INT REFERENCES program_requirements(requirement_id) ON DELETE CASCADE,
);

CREATE TABLE requirement_courses (
    requirement_id INT REFERENCES program_requirements(requirement_id) ON DELETE CASCADE,
    course_id INT REFERENCES courses(course_id) ON DELETE CASCADE,
    PRIMARY KEY (requirement_id, course_id),
);

CREATE TABLE certificates (
    certificate_id SERIAL PRIMARY KEY,
    certificate_name VARCHAR(255) NOT NULL,
    program_id INT REFERENCES programs(program_id) ON DELETE CASCADE,
)

CREATE TABLE certificate_courses (
    certificate_id SERIAL PRIMARY KEY,
    course_id INT REFERENCES courses(course_id) ON DELETE CASCADE,
);

-- Student Plans and Enrollment Tables --
CREATE TABLE degree_plans (
    plan_id SERIAL PRIMARY KEY,
    student_id INT REFERENCES students(student_id) ON DELETE CASCADE,
    course_id INT REFERENCES courses(course_id) ON DELETE CASCADE,
    semester_id INT REFERENCES semesters(semester_id) ON DELETE CASCADE,
);

CREATE TABLE enrollments (
    enrollment_id SERIAL PRIMARY KEY,
    student_id INT REFERENCES students(student_id) ON DELETE CASCADE,
    course_id INT REFERENCES courses(course_id) ON DELETE CASCADE,
    semester_id INT REFERENCES semesters(semester_id) ON DELETE CASCADE,
    grade grade,
);

CREATE TABLE student_certificates (
    student_id INT REFERENCES students(student_id) ON DELETE CASCADE,
    certificate_id INT REFERENCES certificates(certificate_id) ON DELETE CASCADE,
    cert_status cert_status NOT NULL,
    PRIMARY KEY (student_id, certificate_id),
)

-- Comments and Notifications Tables --
CREATE TABLE degree_plan_comments (
    comment_id SERIAL PRIMARY KEY,
    plan_id INT REFERENCES degree_plans(plan_id) ON DELETE CASCADE,
    author_id INT REFERENCES users(user_id) ON DELETE SET NULL,
    comment_text TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
)

CREATE TABLE notifications (
    notification_id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(user_id) ON DELETE CASCADE,
    notif_message TEXT NOT NULL,
    notif_type notif_type NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMP,
);