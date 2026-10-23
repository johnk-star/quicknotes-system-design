# QuickNotes API Design Specification

## Authentication
* **`POST /api/auth/register`**
  * **Request:** `{ "username": "john_doe", "email": "john@example.com", "password": "password123" }`
  * **Response (201 Created):** `{ "message": "User registered successfully", "user_id": 1 }`

* **`POST /api/auth/login`**
  * **Request:** `{ "email": "john@example.com", "password": "password123" }`
  * **Response (200 OK):** `{ "token": "jwt_bearer_token", "user": { "id": 1, "username": "john_doe" } }`

---

## Notes Endpoints
* **`GET /api/notes`**
  * **Headers:** `Authorization: Bearer <jwt_token>`
  * **Query Params:** `?category_id=2&search=meeting`
  * **Response (200 OK):**
    ```json
    [
      {
        "note_id": 10,
        "title": "Team Sync",
        "content": "Discuss architecture plans",
        "category_id": 2,
        "created_at": "2026-10-23T10:00:00Z"
      }
    ]
    ```

* **`POST /api/notes`**
  * **Headers:** `Authorization: Bearer <jwt_token>`
  * **Request:** `{ "title": "New Note", "content": "Note body here", "category_id": 1 }`
  * **Response (201 Created):** `{ "note_id": 11, "title": "New Note", "message": "Created" }`

* **`DELETE /api/notes/:id`**
  * **Headers:** `Authorization: Bearer <jwt_token>`
  * **Response (200 OK):** `{ "message": "Note deleted successfully" }`
