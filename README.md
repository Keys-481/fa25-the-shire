# capstone-project: Graduate Advising Tool
BSU CS481 Capstone project template

## Specification Prerequisites
To run this project, you need to have the following installed on your machine:
* Node.js (LTS version)
* npm
* PostgreSQL

## Getting Started

### Backend
Navigate to the `backend` directory and install dependencies by running the following command:
```
npm installl
```

#### Required Configuration
Before you can run the database setup script, you must complete the following steps:

1. In the root directory, create a file named `.env` and add your local credentials. The setup script requires these variables to connect:
```
DB_HOST="localhost"
DB_USER="<your_postgres_user>"
DB_PASS="<your_secure_password>"
DB_NAME="<your_database_name>" # Example: "advising_tool"
DB_PORT="5432"
```
2. Use your local PostgreSQL client (`psql`) to create the database and user that matches the credentials in your .env file. (The `db:setup` script cannot create the database itself).

```
# 1. Start psql, usually as the default 'postgres' superuser (you'll be prompted for the password):
psql -U postgres

# 2. Execute the setup commands:
-- Option 1: Create a dedicated user
CREATE USER <your_postgres_user> WITH PASSWORD '<your_secure_password>';
CREATE DATABASE <your_database_name> OWNER <your_postgres_user>;

-- Option 2: Alternatively, create the database using the default root user
-- You must use the password you set during PostgreSQL installation.
CREATE DATABASE <your_database_name>;

-- Exit psql
\q

```

#### Database Setup
To connect to the local database, create the tables defined in `schema.sql`, and populate them with mock data from `seeds.sql`, run the following command before you can start the server:

```
npm run db:setup
```

Run the following command to start the server:
```
# development mode (auto-restarts on file changes)
npm run dev

# production mode (for single run)
npm run start
```


To run the backend test suite, run the following command:
```
npm run test
```

### Frontend
Navigate to the `frontend` directory and install dependencies by running the following command:
```
npm install
```

To start the React app, run the following command:
```
# development mode (auto-reloads browser on file changes)
npm run dev
```

To create an optimized build of the app, run the following command:
```
npm run build
```

To view a local preview of the build, run the following command:
```
npm run preview
```

To check the code for style and potential errors, run the following command:
```
npm run lint
```