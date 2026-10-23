# QuickNotes System Architecture & Design Document

## 1. System Overview & Requirements

### Functional Requirements
* **User Management:** Users can register, log in, and manage their authentication sessions securely.
* **Note Management:** Users can create, view, update, delete, and categorize personal text notes.
* **Search & Filter:** Users can search notes by keywords and filter notes by category or tag.
* **Sharing:** Users can generate shareable read-only links for specific notes.

### Non-Functional Requirements
* **Low Latency:** Note creation and lookup response times must remain under 100ms.
* **High Availability:** Target 99.9% uptime for note creation and retrieval services.
* **Data Integrity & Privacy:** Strict authorization checks ensuring users can only read or modify their own non-public notes.
* **Scalability:** System architecture must support smooth horizontal scaling as active user count grows.

---

## 2. Data Model & Database Schema

### Relational Database Design (PostgreSQL / MySQL)

#### `users` Table
* `user_id` (INT, Primary Key, Auto Increment)
* `username` (VARCHAR(50), UNIQUE, NOT NULL)
* `email` (VARCHAR(100), UNIQUE, NOT NULL)
* `password_hash` (VARCHAR(255), NOT NULL)
* `created_at` (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP)

#### `categories` Table
* `category_id` (INT, Primary Key, Auto Increment)
* `user_id` (INT, Foreign Key referencing `users(user_id)`)
* `name` (VARCHAR(50), NOT NULL)

#### `notes` Table
* `note_id` (INT, Primary Key, Auto Increment)
* `user_id` (INT, Foreign Key referencing `users(user_id)`)
* `category_id` (INT, Foreign Key referencing `categories(category_id)`, NULLABLE)
* `title` (VARCHAR(255), NOT NULL)
* `content` (TEXT, NOT NULL)
* `is_public` (BOOLEAN, DEFAULT FALSE)
* `share_token` (VARCHAR(64), UNIQUE, NULLABLE)
* `created_at` (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP)
* `updated_at` (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP)

### Entity Relationships
* **User to Notes:** One-to-Many ($1:N$). A single user owns multiple notes; each note belongs to one user.
* **User to Categories:** One-to-Many ($1:N$). A user can create custom categories.
* **Category to Notes:** One-to-Many ($1:N$). A category contains multiple notes; each note optionally links to one category.
---

## 3. API Design & Endpoint Specification

### Authentication Endpoints
* **`POST /api/auth/register`**
  * **Request:** `{ "username": "john_doe", "email": "john@example.com", "password": "securepassword" }`
  * **Response (201 Created):** `{ "message": "User registered successfully", "user_id": 1 }`

* **`POST /api/auth/login`**
  * **Request:** `{ "email": "john@example.com", "password": "securepassword" }`
  * **Response (200 OK):** `{ "token": "jwt_bearer_token_string", "user": { "id": 1, "username": "john_doe" } }`

---

### Note Management Endpoints

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
  * **Response (201 Created):** `{ "note_id": 11, "title": "New Note", "message": "Note created successfully" }`

* **`PUT /api/notes/:id`**
  * **Headers:** `Authorization: Bearer <jwt_token>`
  * **Request:** `{ "title": "Updated Title", "content": "Updated body content" }`
  * **Response (200 OK):** `{ "note_id": 11, "message": "Note updated successfully" }`

* **`DELETE /api/notes/:id`**
  * **Headers:** `Authorization: Bearer <jwt_token>`
  * **Response (200 OK):** `{ "message": "Note deleted successfully" }`

* **`GET /api/notes/share/:share_token`**
  * **Description:** Public read-only access for shared notes (No auth required).
  * **Response (200 OK):** `{ "title": "Shared Note", "content": "Public content", "author": "john_doe" }`
---

## 4. System Architecture Diagram & Component Roles
+-----------------------------------------------------------------------------------+
|                                 CLIENT APPLICATIONS                               |
|                             (Web App / Mobile Browser)                            |
+-----------------------------------------------------------------------------------+
|
| HTTPS Requests
v
+--------------------------+
|      Load Balancer       |
|       (Nginx / ALB)      |
+--------------------------+
|
v
+--------------------------+
|  Stateless Application   |
|      Server Cluster      |
|     (Node.js / Express)  |
+--------------------------+
/

Read / Write  /                \ Cache Queries
v                  v
+--------------------+   +--------------------+
|  Relational DB     |   |    Redis Cache     |
|  (PostgreSQL/MySQL)|   | (In-Memory Session  |
|  Primary + Replicas|   |   & Note Cache)    |
+--------------------+   +--------------------+
### Component Descriptions
1. **Client Applications:** Frontend interface built with standard web technologies (HTML, CSS, JavaScript) that allows users to interact with their notes and perform CRUD operations.
2. **Load Balancer:** Distributes incoming HTTP/HTTPS traffic across available application server instances to ensure high availability and prevent single-point congestion.
3. **Stateless Application Server Cluster:** Runs the backend Express REST API services. Being stateless allows servers to scale horizontally based on CPU/traffic demand.
4. **Relational Database (PostgreSQL/MySQL):** Primary persistent data store configured with a primary node for write transactions and read replicas for handling read query throughput.
5. **Redis Cache:** In-memory caching layer used to store user JWT session metadata, frequent note search responses, and share-token lookups to deliver sub-10ms response times.

---

## 5. Trade-offs, Indexing & Scalability Considerations

### Recommended Database Indexes
To maintain fast lookup performance as the `notes` table grows into millions of rows, the following composite and single-column indexes are created:

```sql
-- Index for fetching all notes owned by a user filtered by category
CREATE INDEX idx_notes_user_category ON notes(user_id, category_id);

-- Index for instant lookup of public notes via share tokens
CREATE INDEX idx_notes_share_token ON notes(share_token);

-- Full-text search index for searching keywords inside title and content
CREATE FULLTEXT INDEX idx_notes_search ON notes(title, content);
System Scalability Strategies
Database Read Replicas: Because users read notes and categories far more frequently than they write or edit them, read operations are routed to read-only database replicas while write operations hit the primary instance.

In-Memory Caching (Redis): Hot active notes and user session tokens are cached in Redis. When a user requests a note, the system checks Redis first before querying PostgreSQL, keeping response times under 50ms.

Database Sharding: As total storage scales, user accounts and their associated notes are horizontally partitioned (sharded) across multiple database instances using user_id as the shard key.

System Design Trade-Off Analysis
Trade-Off 1: Relational Database (PostgreSQL) vs. Document Store (MongoDB)
Option A (MongoDB Document Store): Store notes as flexible JSON documents without strict schemas.

Option B (PostgreSQL Relational DB - Chosen): Enforce ACID compliance, foreign key integrity between users, categories, and notes, and relational join constraints.

Trade-Off: PostgreSQL requires structured migrations and schema definitions up front, but eliminates data duplication, guarantees user access boundary isolation, and handles structured user-category relationships natively without orphan risks.

Trade-Off 2: Full-Text Search in SQL vs. Dedicated Search Engine (Elasticsearch)
Option A (Elasticsearch Cluster): Deploy an external Elasticsearch cluster for real-time document indexing and search.

Option B (Native SQL Full-Text Indexing - Chosen): Utilize PostgreSQL/MySQL native full-text search indexes on title and content.

Trade-Off: Native SQL indexing limits advanced fuzzy-search configurations, but avoids the infrastructure overhead, synchronization complexity, and hosting costs of running a separate search service at this scale.
---

### How to Save & Exit `nano`:
1. Press **`Ctrl` + `O`**
2. Press **`Enter`**
3. Press **`Ctrl` + `X`**
