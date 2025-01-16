# Task Management API

## Project Description
The Task Management API is a RESTful API built with Node.js and Express.js that allows users to manage tasks. Users can sign up, sign in, create tasks, update tasks, delete tasks, and fetch tasks. The API also includes features for user authentication, password reset, and token refresh.

## Project Setup Instructions

### Prerequisites
- Docker
- Docker Compose

### Installation

1. Clone the repository:
    ```sh
    git clone https://github.com/your-username/task-management-api.git
    cd task-management-api
    ```

2. Create an [.env](http://_vscodecontentref_/1) file in the root directory and add the following environment variables:
    ```env
    DB_USER=admin
    DB_PASSWORD=90700675
    DB_DATABASE=taskdb
    ACCESS_TOKEN_SECRET=KLFJPMC2I4U987549RYGCB3H42I9U89Y7394
    REFRESH_TOKEN_SECRET=kbfioiejiuryyuwuedbdsjnk
    EMAIL_USER=your_email_user
    EMAIL_PASS=your_email_password
    ```

3. Build and start the Docker containers:
    ```sh
    docker-compose --env-file .env up --build
    ```

4. The API will be available at `http://localhost:2300`.

### Running Tests
To run the tests, use the following command:
```sh
    docker-compose --env-file .env run test
```
## Role-Based Access Control (RBAC)

- **User Roles**:
  - **User**:
    - Can create, update, delete, and fetch their own tasks.
  - **Admin**:
    - Can create, update, delete, and fetch their own tasks.
    - Can create, update, delete, and fetch tasks for other users.
  - **Manager**:
    - Can create, update, and fetch their own tasks.
    - Can create, update, and fetch tasks for other users.
    - Cannot delete tasks for other users, only their own tasks.

- **Permissions**:
  - **Create Task**:
    - Users, Admins, and Managers can create tasks.
  - **Update Task**:
    - Users, Admins, and Managers can update their own tasks.
    - Admins and Managers can update tasks for other users.
  - **Delete Task**:
    - Users and Admins can delete their own tasks.
    - Admins can delete tasks for other users.
    - Managers can only delete their own tasks.
  - **Fetch Tasks**:
    - Users, Admins, and Managers can fetch their own tasks.
    - Admins and Managers can fetch tasks for other users.

This section outlines the role-based access control (RBAC) implemented in the Task Management API, detailing the permissions and capabilities of each user role.

## API Documentation

### Authentication

#### Sign Up
- **Endpoint**: `POST /api/v1/auth/sign-up`
- **Description**: Registers a new user.
- **Request Body**:
    ```json
    {
        "email": "tester@tester.com",
        "password": "Tester12$",
        "name": "Tester"
    }
    ```
- **Response**:
    ```json
    {
        "success": true,
        "message": "User signed up successfully, an email has been sent to your email address to get verified!",
        "data": null
    }
    ```

#### Sign In
- **Endpoint**: `POST /api/v1/auth/sign-in`
- **Description**: Authenticates a user and returns an access token.
- **Request Body**:
    ```json
    {
        "email": "tester@tester.com",
        "password": "Tester12$"
    }
    ```
- **Response**:
    ```json
    {
        "success": true,
        "message": "User signed in successfully",
        "data": "accessToken"
    }
    ```

#### Verify Email
- **Endpoint**: `GET /api/v1/auth/verify-email/:token`
- **Description**: Verifies a user's email address.
- **Response**:
    ```json
    {
        "success": true,
        "message": "User verified successfully",
        "data": null
    }
    ```

#### Refresh Token
- **Endpoint**: `POST /api/v1/auth/refresh-token`
- **Description**: Refreshes the access token.
- **Response**:
    ```json
    {
        "success": true,
        "message": "Token refreshed successfully",
        "data": "newAccessToken"
    }
    ```

#### Logout
- **Endpoint**: `POST /api/v1/auth/logout`
- **Description**: Logs out the user by clearing the refresh token cookie.
- **Response**:
    ```json
    {
        "success": true,
        "message": "User logged out successfully",
        "data": null
    }
    ```

### Tasks

#### Get All Tasks
- **Endpoint**: `GET /api/v1/tasks`
- **Description**: Fetches all tasks.
- **Response**:
    ```json
    {
        "success": true,
        "message": "Tasks fetched successfully",
        "data": [
            {
                "id": 1,
                "title": "Task 1",
                "description": "Description 1",
                "due_date": "2023-12-31",
                "user_id": 1
            },
            {
                "id": 2,
                "title": "Task 2",
                "description": "Description 2",
                "due_date": "2023-12-31",
                "user_id": 1
            }
        ]
    }
    ```

#### Create Task
- **Endpoint**: `POST /api/v1/tasks`
- **Description**: Creates a new task.
- **Request Body**:
    ```json
    {
        "title": "New Task",
        "description": "Task Description",
        "due_date": "2023-12-31"
    }
    ```
- **Response**:
    ```json
    {
        "success": true,
        "message": "Task created successfully",
        "data": {
            "id": 1,
            "title": "New Task",
            "description": "Task Description",
            "due_date": "2023-12-31",
            "user_id": 1
        }
    }
    ```

#### Get User Tasks
- **Endpoint**: `GET /api/v1/tasks/user`
- **Description**: Fetches tasks for the authenticated user.
- **Response**:
    ```json
    {
        "success": true,
        "message": "User tasks fetched successfully",
        "data": [
            {
                "id": 1,
                "title": "Task 1",
                "description": "Description 1",
                "due_date": "2023-12-31",
                "user_id": 1
            },
            {
                "id": 2,
                "title": "Task 2",
                "description": "Description 2",
                "due_date": "2023-12-31",
                "user_id": 1
            }
        ]
    }
    ```

#### Get A Task
- **Endpoint**: `GET /api/v1/tasks/:taskId`
- **Description**: Fetches a specific task by ID.
- **Response**:
    ```json
    {
        "success": true,
        "message": "Task fetched successfully",
        "data": {
            "id": 1,
            "title": "Task 1",
            "description": "Description 1",
            "due_date": "2023-12-31",
            "user_id": 1
        }
    }
    ```

#### Update Task Status
- **Endpoint**: `PUT /api/v1/tasks/:taskId`
- **Description**: Updates the status of a specific task.
- **Request Body**:
    ```json
    {
        "status": "completed"
    }
    ```
- **Response**:
    ```json
    {
        "success": true,
        "message": "Task updated successfully",
        "data": {
            "id": 1,
            "title": "Task 1",
            "description": "Description 1",
            "due_date": "2023-12-31",
            "user_id": 1,
            "status": "completed"
        }
    }
    ```
## Implemented Features
- **User Authentication**:
  - Users can sign up, sign in, and verify their email addresses through email.
  - Passwords are hashed before storing in the database.
  - Access and refresh tokens are generated for authenticated sessions.
  - Refresh tokens are stored as HTTP-only cookies.

- **Task Management**:
  - Users can create, update, delete, and fetch tasks.
  - Tasks can be filtered by status, start date, and end date.
  - Tasks can be sorted by various fields.
  - Pagination support for fetching tasks.

- **Password Reset**:
  - Users can request a password reset and reset their passwords using an OTP.
  - OTPs are generated and sent to the user's email.
  - Passwords are hashed before updating in the database.

- **Token Refresh**:
  - Users can refresh their access tokens using a refresh token.
  - Refresh tokens are verified and new access tokens are generated.

- **Logout**:
  - Users can log out by clearing the refresh token cookie.

- **Database Connection**:
  - Configured to connect to a PostgreSQL database.
  - Environment variables are used for database configuration.

- **Error Handling**:
  - Middleware for handling errors and sending appropriate responses.

- **Health Check**:
  - Health check for the PostgreSQL database using `pg_isready`.

- **Environment Variables**:
  - Uses environment variables for configuration, including database credentials, JWT secrets, and email credentials.

- **Email Notifications**:
  - Sends email notifications for account verification and password reset.

- **Security**:
  - Uses HTTP-only cookies for storing refresh tokens.
  - Passwords are hashed using bcrypt.
  - JWT tokens are used for securing API endpoints.

- **Testing**:
  - Unit tests and integration tests using Jest and Supertest.
  - Docker Compose setup for running tests in a containerized environment.

- **About RBAC**:
  - Users can create, update, delete, and fetch tasks as long as there are authorized.
  -Admin can also create task for theirself, update, delete and fetch their task or others task.
  -Manager can also create task for theirself, update, and fetch their task or others task but manager cannot delete others task, only theirs.
