# QuickNotes API Design Specification

## Global Response Codes
* **200 OK:** Request succeeded.
* **201 Created:** Resource successfully created.
* **400 Bad Request:** Missing or invalid request parameters.
* **401 Unauthorized:** Authentication token missing or expired.
* **403 Forbidden:** User lacks permission for this resource.
* **404 Not Found:** Requested resource or note ID does not exist.
* **500 Internal Server Error:** Unexpected server-side failure.

---

## Authentication Endpoints

### `POST /api/auth/register`
* **Request:** `{ "username": "john_doe", "email": "john@example.com", "password": "password123" }`
* **Response (201 Created):** `{ "message": "User registered successfully", "user_id": 1 }`
* **Error (400 Bad Request):** `{ "error": "Email already registered" }`

### `POST /api/auth/login`
* **Request:** `{ "email": "john@example.com", "password": "password123" }`
* **Response (200 OK):** `{ "token": "jwt_bearer_token", "user": { "id": 1, "username": "john_doe" } }`
* **Error (401 Unauthorized):** `{ "error": "Invalid credentials" }`

---

## Notes Endpoints

### `GET /api/notes`
* **Headers:** `Authorization: Bearer <jwt_token>`
* **Query Params:** `?tag_id=2&search=meeting&page=1&limit=10`
* **Response (200 OK):**
  ```json
  [
    {
      "note_id": 10,
      "title": "Team Sync",
      "content": "Discuss architecture plans",
      "tags": ["work", "meeting"],
      "created_at": "2026-10-23T10:00:00Z"
    }
  ]
Error (401 Unauthorized): { "error": "Missing or invalid token" }

POST /api/notes
Headers: Authorization: Bearer <jwt_token>

Request: { "title": "New Note", "content": "Note body here", "tag_ids": [1, 2] }

Response (201 Created): { "note_id": 11, "title": "New Note", "message": "Created" }

Error (400 Bad Request): { "error": "Title and content are required" }

PUT /api/notes/:id
Headers: Authorization: Bearer <jwt_token>

Request: { "title": "Updated Title", "content": "Updated body" }

Response (200 OK): { "note_id": 11, "message": "Note updated successfully" }

Error (404 Not Found): { "error": "Note not found" }

DELETE /api/notes/:id
Headers: Authorization: Bearer <jwt_token>

Response (200 OK): { "message": "Note deleted successfully" }

Error (403 Forbidden): { "error": "Unauthorized to delete this note" }
