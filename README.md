# Event Management API

A comprehensive REST API for managing events and user registrations built with **Node.js**, **Express.js**, and **PostgreSQL**.

---

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm

---

### Installation

**Clone the repository**

```bash
git clone http://github.com/Sharanumesta/Event-Management-API
cd event-management-api
npm install
```

### Database Setup

Create a PostgreSQL database and run the following SQL commands:

```
-- Create Events Table
CREATE TABLE events (
    id VARCHAR(36) PRIMARY KEY,
    title TEXT NOT NULL,
    date_time TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    location TEXT,
    capacity INTEGER CHECK (capacity <= 1000 AND capacity > 0),
    registrations INTEGER DEFAULT 0
);

-- Create Users Table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    event_id VARCHAR REFERENCES events(id) ON DELETE CASCADE,
    name VARCHAR NOT NULL,
    email VARCHAR NOT NULL,
    UNIQUE(event_id, email)
);
```
### Environment Configuration

The application uses a single `DATABASE_URL` for PostgreSQL connection (e.g., hosted on Render, Supabase, etc.).

#### .env File

Create a `.env` file in the project root and add the following:

```env
# Server Port
PORT=8080

# PostgreSQL Connection String
DATABASE_URL=postgresql://<username>:<password>@<host>:<port>/<database>
```
### Start the Server

To start the server, run:

```bash
npm start
```
The server will start at: http://localhost:8080

## API Routes

Base URL: `http://localhost:8080/api/v1/event`

| Method | Endpoint                            | Description                          |
|--------|-------------------------------------|--------------------------------------|
| POST   | `/create`                           | Create a new event                   |
| POST   | `/register`                         | Register a user for an event         |
| GET    | `/get-all-events`                   | Get all events with registered users |
| DELETE | `/:event_id/user/:email`            | Cancel a user's registration         |
| GET    | `/upcoming`                         | List all upcoming events             |
| GET    | `/stat/:event_id`                   | Get registration stats for an event  |

#### Middleware Validation

- `validateEvent` — Validates event creation payload
- `validateUserRegistration` — Validates user registration payload


## Example Requests & Responses

### 1.Create Event

**Request**

```http
POST /api/v1/event/create
Content-Type: application/json

{
  "id": "evt_001",
  "title": "Tech Conference",
  "dateTime": "2024-10-15T09:00:00",
  "location": "Convention Center",
  "capacity": 500
}
```

**Response**

```json
{
  "message": "Event created successfully",
  "event": {
    "id": "evt_001"
  }
}
```

---

### 2. Register User

**Request**

```http
POST /api/v1/event/register
Content-Type: application/json

{
  "event_id": "evt_001",
  "name": "John Doe",
  "email": "john@example.com"
}
```

**Response**

```json
{
  "success": true,
  "registration": {
    "event_id": "evt_001",
    "name": "John Doe",
    "email": "john@example.com"
  },
  "remaining_capacity": 499,
  "message": "Successfully registered for event"
}
```

---

### 3. Get All Events with Users

**Request**

```http
GET /api/v1/event/get-all-events
```

**Response**

```json
{
  "count": 1,
  "events": [
    {
      "id": "evt_001",
      "title": "Tech Conference",
      "date_time": "2024-10-15T09:00:00.000Z",
      "location": "Convention Center",
      "capacity": 500,
      "registrations": 1,
      "registered_users": [
        {
          "name": "John Doe",
          "email": "john@example.com"
        }
      ]
    }
  ]
}
```

---

### 4. Cancel Registration

**Request**

```http
DELETE /api/v1/event/evt_001/user/john@example.com
```

**Response**

```json
{
  "message": "Registration cancelled successfully."
}
```

---

### 5. Get Upcoming Events

**Request**

```http
GET /api/v1/event/upcoming
```

**Response**

```json
{
  "count": 1,
  "events": [
    {
      "title": "Tech Conference",
      "date": "2024-10-15T09:00:00.000Z",
      "location": "Convention Center"
    }
  ]
}
```

---

### 6. Get Event Statistics

**Request**

```http
GET /api/v1/event/stat/evt_001
```

**Response**

```json
{
  "count": 1,
  "events": [
    {
      "event_id": "evt_001",
      "registration": 1,
      "available_spots": 499,
      "registration_percentage": 0.2
    }
  ]
}
```

---

## Error Response Format

All error responses follow this format:

```json
{
  "error": "Descriptive error message",
  "details": "Additional error details if available"
}
```

**Common Error Codes**

| Code | Description                          |
|------|--------------------------------------|
| 400  | Bad Request (Validation Errors)      |
| 404  | Not Found (Event/User not found)     |
| 409  | Conflict (Duplicate registration)    |
| 500  | Internal Server Error                |

---

## Notes

- All timestamps are in ISO 8601 format.
- Capacity limit is enforced: max 1000.
- Email is validated and case-insensitive.
- Past events and duplicate registrations are restricted.

## Postman Collection

You can explore and test all the API endpoints using the Postman collection below:

[Click here to view the Postman Collection](https://alone7-8517.postman.co/workspace/Alone-Workspace~e9c75852-334e-4411-a7fd-4319c6f95992/request/25239808-699c630e-b769-4d3d-87bf-349925cb91be?action=share&creator=25239808&ctx=documentation&active-environment=25239808-2435630b-424f-40f5-b152-5829f6e6db49)

Make sure to set the environment variables as needed for local or production testing.

---

## Acknowledgements

- Built with [Node.js](https://nodejs.org/), [Express.js](https://expressjs.com/), and [PostgreSQL](https://www.postgresql.org/)
- Tested with [Postman](https://www.postman.com/)
- Database hosted on [Render](https://render.com/)


## Contributing

Contributions, issues and feature requests are welcome!  
Feel free to open a pull request or raise an issue.

## 📫 Contact

For questions or support, reach out via [email](mailto:sharanumesta@gmail.com)