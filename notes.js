// Wait for the DOM to be ready
document.addEventListener("DOMContentLoaded", () => {
  const notesContainer = document.getElementById("notesContainer");
  const createNoteBtn = document.getElementById("createNoteBtn");
  const noteModal = document.getElementById("noteModal");
  const cancelNoteBtn = document.getElementById("cancelNoteBtn");
  const saveNoteBtn = document.getElementById("saveNoteBtn");
  const noteTitle = document.getElementById("noteTitle");
  const noteContent = document.getElementById("noteContent");
  const modalTitle = document.getElementById("modalTitle");

  let notes = JSON.parse(localStorage.getItem("notes")) || [];
  let editIndex = null;

  const loggedInUser = sessionStorage.getItem("loggedInUser");
  const userRole = sessionStorage.getItem("userRole"); // 'Admin' or 'User'

  function renderNotes() {
    notesContainer.innerHTML = "";

    const filteredNotes = userRole === "Admin"
      ? notes
      : notes.filter(note => note.createdBy === loggedInUser);

    filteredNotes.forEach((note, index) => {
      const realIndex = notes.findIndex(n => n.title === note.title && n.time === note.time);
      const canEditOrDelete = (userRole === "Admin" || note.createdBy === loggedInUser);

      const card = document.createElement("div");
      card.className = "note-card";
      card.innerHTML = `
        <div class="note-actions">
          ${canEditOrDelete ? `<i class="fas fa-edit" onclick="editNote(${realIndex})"></i>` : ""}
          ${canEditOrDelete ? `<i class="fas fa-trash" onclick="deleteNote(${realIndex})"></i>` : ""}
        </div>
        <h3>${note.title}</h3>
        <p>${note.content}</p>
        <p><strong>Created By:</strong> ${note.createdBy}</p>
        <div class="meta">${note.time}</div>
      `;
      notesContainer.appendChild(card);
    });
  }

  window.editNote = function (index) {
    const note = notes[index];
    if (userRole === "Admin" || note.createdBy === loggedInUser) {
      noteTitle.value = note.title;
      noteContent.value = note.content;
      editIndex = index;
      modalTitle.textContent = "Edit Note";
      noteModal.classList.remove("hidden");
    } else {
      alert("You do not have permission to edit this note.");
    }
  };

  window.deleteNote = function (index) {
    const note = notes[index];
    if (userRole === "Admin" || note.createdBy === loggedInUser) {
      if (confirm("Are you sure you want to delete this note?")) {
        notes.splice(index, 1);
        localStorage.setItem("notes", JSON.stringify(notes));
        renderNotes();
      }
    } else {
      alert("You do not have permission to delete this note.");
    }
  };

  createNoteBtn.addEventListener("click", () => {
    noteTitle.value = "";
    noteContent.value = "";
    editIndex = null;
    modalTitle.textContent = "Add Note";
    noteModal.classList.remove("hidden");
  });

  cancelNoteBtn.addEventListener("click", () => {
    noteModal.classList.add("hidden");
  });

  saveNoteBtn.addEventListener("click", () => {
    const title = noteTitle.value.trim();
    const content = noteContent.value.trim();

    if (title && content) {
      const now = new Date().toLocaleString();
      if (editIndex !== null) {
        notes[editIndex] = { title, content, time: now, createdBy: loggedInUser };
      } else {
        notes.push({ title, content, time: now, createdBy: loggedInUser });
      }
      localStorage.setItem("notes", JSON.stringify(notes));
      renderNotes();
      noteModal.classList.add("hidden");
    }
  });

  // Initial render
  renderNotes();
});
