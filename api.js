const API_BASE_URL = 'https://jsonplaceholder.typicode.com/posts';

const notesList = document.getElementById('notes-list');
const statusMessage = document.getElementById('status-message');
const loadBtn = document.getElementById('load-btn');
const addBtn = document.getElementById('add-btn');
const titleInput = document.getElementById('note-title');
const contentInput = document.getElementById('note-content');

let localNotes = [];

function setStatus(message, className) {
  statusMessage.textContent = message;
  statusMessage.className = className;
}

function setButtonsDisabled(disabled) {
  loadBtn.disabled = disabled;
  addBtn.disabled = disabled;
  const deleteBtns = document.querySelectorAll('.delete-btn');
  deleteBtns.forEach(btn => btn.disabled = disabled);
}

// Safely render notes using DOM manipulation & textContent (prevents XSS)
function renderNotes() {
  notesList.innerHTML = '';
  
  if (localNotes.length === 0) {
    setStatus('No notes found.', 'empty');
    return;
  }

  setStatus('', '');
  localNotes.forEach(note => {
    const li = document.createElement('li');
    li.className = 'note-item';

    const textDiv = document.createElement('div');
    textDiv.className = 'note-text';

    const titleElem = document.createElement('strong');
    titleElem.textContent = note.title;

    const bodyElem = document.createElement('p');
    bodyElem.textContent = note.body || note.content;

    textDiv.appendChild(titleElem);
    textDiv.appendChild(bodyElem);

    const delBtn = document.createElement('button');
    delBtn.className = 'delete-btn';
    delBtn.textContent = 'Delete';
    delBtn.onclick = () => deleteNote(note.id);

    li.appendChild(textDiv);
    li.appendChild(delBtn);
    notesList.appendChild(li);
  });
}

// GET: Fetch 10 notes on button click
loadBtn.addEventListener('click', async () => {
  setStatus('Loading notes...', 'loading');
  setButtonsDisabled(true);

  try {
    const response = await fetch(`${API_BASE_URL}?_limit=10`);
    if (!response.ok) throw new Error(`HTTP Error ${response.status}`);
    
    localNotes = await response.json();
    renderNotes();
  } catch (err) {
    setStatus(`Error loading notes: ${err.message}`, 'error');
  } finally {
    setButtonsDisabled(false);
  }
});

// POST: Add note with optimistic state mutation
addBtn.addEventListener('click', async () => {
  const title = titleInput.value.trim();
  const content = contentInput.value.trim();

  if (!title || !content) {
    alert('Please enter both title and content.');
    return;
  }

  setStatus('Adding note...', 'loading');
  setButtonsDisabled(true);

  try {
    const response = await fetch(API_BASE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, body: content, userId: 1 })
    });

    if (!response.ok) throw new Error(`HTTP Error ${response.status}`);
    
    const createdNote = await response.json();
    // Assign incremental ID for mock backend demonstration
    createdNote.id = localNotes.length ? Math.max(...localNotes.map(n => n.id)) + 1 : 1;
    
    localNotes.unshift(createdNote);
    titleInput.value = '';
    contentInput.value = '';
    
    renderNotes();
    setStatus('Note added successfully!', 'loading');
    setTimeout(() => setStatus('', ''), 2000);
  } catch (err) {
    setStatus(`Error adding note: ${err.message}`, 'error');
  } finally {
    setButtonsDisabled(false);
  }
});

// DELETE: Remove note locally
async function deleteNote(id) {
  setStatus('Deleting note...', 'loading');
  setButtonsDisabled(true);

  try {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'DELETE'
    });

    if (!response.ok) throw new Error(`HTTP Error ${response.status}`);

    localNotes = localNotes.filter(note => note.id !== id);
    renderNotes();
    setStatus('Note deleted successfully!', 'loading');
    setTimeout(() => setStatus('', ''), 2000);
  } catch (err) {
    setStatus(`Error deleting note: ${err.message}`, 'error');
  } finally {
    setButtonsDisabled(false);
  }
}
