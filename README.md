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
docker-compose run app npm test