const API_BASE_URL = 'https://jsonplaceholder.typicode.com/posts';

const notesList = document.getElementById('notes-list');
const statusMessage = document.getElementById('status-message');
const addBtn = document.getElementById('add-btn');
const titleInput = document.getElementById('note-title');
const contentInput = document.getElementById('note-content');

// Helper to update status messages (loading, error, empty)
function setStatus(message, className) {
  statusMessage.textContent = message;
  statusMessage.className = className;
}

// GET: Fetch notes
async function fetchNotes() {
  setStatus('Loading notes...', 'loading');
  try {
    const response = await fetch(`${API_BASE_URL}?_limit=5`);
    if (!response.ok) throw new Error('Failed to load notes');
    const notes = await response.json();
    
    if (notes.length === 0) {
      setStatus('No notes found.', 'empty');
      notesList.innerHTML = '';
      return;
    }

    setStatus('', '');
    renderNotes(notes);
  } catch (err) {
    setStatus(`Error: ${err.message}`, 'error');
  }
}

// Render notes to DOM
function renderNotes(notes) {
  notesList.innerHTML = '';
  notes.forEach(note => {
    const li = document.createElement('li');
    li.className = 'note-item';
    li.innerHTML = `
      <div>
        <strong>${note.title}</strong>
        <p>${note.body || note.content}</p>
      </div>
      <button class="delete-btn" onclick="deleteNote(${note.id})">Delete</button>
    `;
    notesList.appendChild(li);
  });
}

// POST: Create a note
addBtn.addEventListener('click', async () => {
  const title = titleInput.value.trim();
  const content = contentInput.value.trim();

  if (!title || !content) {
    alert('Please fill out both title and content');
    return;
  }

  setStatus('Adding note...', 'loading');
  try {
    const response = await fetch(API_BASE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, body: content, userId: 1 })
    });

    if (!response.ok) throw new Error('Failed to create note');
    
    titleInput.value = '';
    contentInput.value = '';
    setStatus('Note added successfully!', 'loading');
    setTimeout(() => fetchNotes(), 1000);
  } catch (err) {
    setStatus(`Error: ${err.message}`, 'error');
  }
});

// DELETE: Remove a note
async function deleteNote(id) {
  setStatus('Deleting note...', 'loading');
  try {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'DELETE'
    });

    if (!response.ok) throw new Error('Failed to delete note');
    
    setStatus('Note deleted successfully!', 'loading');
    setTimeout(() => fetchNotes(), 1000);
  } catch (err) {
    setStatus(`Error: ${err.message}`, 'error');
  }
}

document.addEventListener('DOMContentLoaded', fetchNotes);
