# QuickNotes Data Model & Database Schema

## PostgreSQL Schema Design

### `users` Table
* `user_id` (INT, Primary Key, Auto Increment)
* `username` (VARCHAR(50), UNIQUE, NOT NULL)
* `email` (VARCHAR(100), UNIQUE, NOT NULL)
* `password_hash` (VARCHAR(255), NOT NULL)
* `created_at` (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP)

### `categories` Table
* `category_id` (INT, Primary Key, Auto Increment)
* `user_id` (INT, Foreign Key referencing `users(user_id)`)
* `name` (VARCHAR(50), NOT NULL)

### `notes` Table
* `note_id` (INT, Primary Key, Auto Increment)
* `user_id` (INT, Foreign Key referencing `users(user_id)`)
* `category_id` (INT, Foreign Key referencing `categories(category_id)`, NULLABLE)
* `title` (VARCHAR(255), NOT NULL)
* `content` (TEXT, NOT NULL)
* `created_at` (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP)

## Database Indexing Strategy
```sql
CREATE INDEX idx_notes_user_category ON notes(user_id, category_id);
CREATE FULLTEXT INDEX idx_notes_search ON notes(title, content);
