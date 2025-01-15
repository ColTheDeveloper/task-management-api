# Task Management API

## Project Description
The Task Management API is a RESTful API built with Node.js and Express.js that allows users to manage tasks. Users can sign up, sign in, create tasks, update tasks, delete tasks, and fetch tasks. The API also includes features for user authentication, password reset, and token refresh.

## Project Setup Instructions

### Prerequisites
- Node.js (v14.x or higher)
- npm (v6.x or higher)
- PostgreSQL

### Installation

1. Clone the repository:
    ```sh
    git clone https://github.com/your-username/task-management-api.git
    cd task-management-api
    ```

2. Install dependencies:
    ```sh
    npm install
    ```

3. Set up environment variables:
    Create a [.env](http://_vscodecontentref_/2) file in the root directory and add the following environment variables:
    ```env
    NODE_ENV=development
    PORT=5000
    DATABASE_URL=your_database_url
    JWT_SECRET=your_jwt_secret
    REFRESH_TOKEN_SECRET=your_refresh_token_secret
    ACCESS_TOKEN_SECRET=your_access_token_secret
    BACKEND_URL=http://localhost:5000
    ```

4. Run database migrations:
    ```sh
    npm run migrate
    ```

5. Start the server:
    ```sh
    npm start
    ```

### Running Tests
To run the tests, use the following command:
```sh
npm test