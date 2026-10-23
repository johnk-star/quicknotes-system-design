# QuickNotes Data Model & Database Schema

## PostgreSQL Executable Schema DDL

```sql
-- Users Table
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Notes Table
CREATE TABLE notes (
    note_id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    is_public BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tags Table
CREATE TABLE tags (
    tag_id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    name VARCHAR(50) NOT NULL,
    UNIQUE(user_id, name)
);

-- Many-to-Many Note-Tags Join Table
CREATE TABLE note_tags (
    note_id INT NOT NULL REFERENCES notes(note_id) ON DELETE CASCADE,
    tag_id INT NOT NULL REFERENCES tags(tag_id) ON DELETE CASCADE,
    PRIMARY KEY (note_id, tag_id)
);

-- Composite Index for User Notes Search
CREATE INDEX idx_notes_user_created ON notes(user_id, created_at DESC);

-- Join Query to Fetch Notes with Associated Tags
SELECT n.note_id, n.title, n.content, t.name AS tag_name
FROM notes n
JOIN note_tags nt ON n.note_id = nt.note_id
JOIN tags t ON nt.tag_id = t.tag_id
WHERE n.user_id = 1;
