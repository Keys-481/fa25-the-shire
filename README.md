[![CI](https://github.com/Keys-481/fa25-the-shire/actions/workflows/ci.yml/badge.svg)](https://github.com/Keys-481/fa25-the-shire/actions/workflows/ci.yml)
# capstone-project: Graduate Advising Tool
BSU CS481 Capstone project template

## Specification Prerequisites
To run this project, you need to have the following installed on your machine:
* Node.js (LTS version)
* npm
* PostgreSQL

## Getting Started

### Build Script
If you are using the build.sh script, follow these steps:

1. Ensure the following services are installed: Podman, Node.js, npm, PostgreSQL client.

2. In the root directory, create a file named `.env` and add your local credentials. The setup script requires these variables to connect:
```
DB_HOST="<see note below>"
DB_USER="<your_postgres_user>"
DB_PASS="<your_secure_password>"
DB_NAME="<your_database_name>" # Example: "advising_tool"
DB_PORT="5432"
```

DB_HOST note: If you are running the app in a container (which is what this script is creating), then set this field to the DB container name. By default this should be `${IMAGE_NAME}-db`. Otherwise, if you're running the backend on your host, set this field to `localhost`.

3. Then, run build.sh from a linux terminal (WSL on windows) by typing:
```
./build.sh
```

If you get an error that mentions line-endings when running the build.sh script (typically happens on Windows), then enter the following command:
```
sed -i 's/\r$//' build.sh test.sh clean.sh
chmod +x build.sh test.sh clean.sh
```
Then, run `./build.sh` again.

4. When the build script finishes executing, it will output a command to run a podman image that contains the built app. Copy that command, paste it into a terminal, and execute it to boot up the container.

5. To access the local app, go to your browser and type `(http://localhost:3000)`.

6. When you are done using the app, simply press `CTRL + C` in the terminal you executed the podman command in. If you want to clean up all podman containers and images, type `./clean.sh`. If you want to run application tests, type `./test.sh`.

If you want to know more about the shell scripts, both `build.sh` and `clean.sh` have `-h` tags that show additional information about them. (`test.sh` does not have one)

If you don't want to use the `build.sh` script, then proceed with the steps below.

### Backend
Navigate to the `backend` directory and install dependencies by running the following command:
```
npm install
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
