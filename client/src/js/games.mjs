/* global alert, confirm */
let currentPage = 1;
const gamesPerPage = 5;

// Function to display errors
function showError (message) {
  alert(message); // Replace with a toast notification for better UX
  console.error(message);
}

// Variable to track which game is being edited
let editingGameId = null;

// Function to format date properly
function formatDate (dateString) {
  try {
    const dateObj = new Date(dateString);
    return dateObj.toLocaleDateString('de-DE'); // Use German locale
  } catch (e) {
    return dateString || 'Kein Datum';
  }
}

// Function to fetch games from the backend
export async function fetchGames (page = 1, limit = gamesPerPage) {
  try {
    const response = await fetch(`/api/games?page=${page}&limit=${limit}`);
    if (!response.ok) throw new Error('Fehler beim Laden der Partien');

    const games = await response.json();
    console.log('🎯 FetchGames - Geladene Daten:', games);

    return games.map(game => ({
      ...game,
      matchDate: game.matchDate || 'Kein Datum',
      matchTime: game.matchTime || 'Keine Zeit',
      players: game.players || [],
      score: game.score || [0, 0],
      completed: game.score.some(score => score === 13) // Mark completed games
    }));
  } catch (error) {
    showError('Die Partien konnten nicht geladen werden: ' + error.message);
    return [];
  }
}

// Function to handle adding a game (send to the backend)
export async function addGame (game) {
  // Check if game is completed
  game.completed = game.score.some(score => score === 13);

  try {
    const response = await fetch('/api/games/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(game)
    });

    if (!response.ok) throw new Error('Fehler beim Speichern der Partie');

    const newGame = await response.json();

    // Display the game in the appropriate section
    checkAndMoveCompletedGame(newGame);

    showError('✅ Spiel erfolgreich hinzugefügt!');
    return newGame;
  } catch (error) {
    showError('❌ Fehler beim Hinzufügen des Spiels: ' + error.message);
  }
}

// Function to create a game row for the match table
function gameRow (game) {
  const row = document.createElement('tr');
  row.setAttribute('data-id', game._id);

  const formattedDate = formatDate(game.matchDate);
  const formattedTime = game.matchTime || 'Keine Zeit';

  row.innerHTML = `
    <td>${formattedDate}</td>
    <td>${formattedTime}</td>
    <td>${game.players.join(', ')}</td>
    <td>${game.score.join(':')}</td>
    <td>
      <button class="edit-btn" data-id="${game._id}">Bearbeiten</button>
      <button class="delete-btn" data-id="${game._id}">Löschen</button>
    </td>
  `;
  return row;
}

// Function to check if a game is completed and move it to the completed-games section
function checkAndMoveCompletedGame (game) {
  const completedGamesList = document.getElementById('completed-games').querySelector('ul');
  const matchTableBody = document.getElementById('matchTableBody');

  if (!completedGamesList || !matchTableBody) return;

  // Check if the game is completed (one player has 13 points)
  if (game.completed || game.score.some(score => score === 13)) {
    // Add to completed games list
    const completedGameItem = document.createElement('li');
    completedGameItem.dataset.id = game._id;

    // Format the date and time
    const formattedDate = formatDate(game.matchDate);
    const formattedTime = game.matchTime || 'Keine Zeit';

    completedGameItem.textContent = `${formattedDate} ${formattedTime} ${game.players.join(', ')} ${game.score.join(':')}`;
    completedGamesList.appendChild(completedGameItem);

    // Remove from ongoing games table
    const ongoingGameRow = document.querySelector(`tr[data-id="${game._id}"]`);
    if (ongoingGameRow) ongoingGameRow.remove();
  }
}

// Event listener for the match table
document.getElementById('matchTableBody')?.addEventListener('click', async (event) => {
  const target = event.target;
  if (!target.classList.contains('edit-btn') && !target.classList.contains('delete-btn')) return;

  const gameId = target.dataset.id;
  if (!gameId) return;

  if (target.classList.contains('edit-btn')) {
    await handleEditGame(gameId);
  } else if (target.classList.contains('delete-btn')) {
    await deleteGame(gameId);
  }
});

// Form submission handler
document.getElementById('matchForm')?.addEventListener('submit', async (event) => {
  event.preventDefault();

  const matchDate = document.getElementById('matchDate').value;
  const matchTime = document.getElementById('matchTime').value;
  const players = document.getElementById('players').value;
  const score = document.getElementById('score').value;

  // Validate players
  const playerArray = players.split(',').map(name => name.trim()).filter(name => name);
  if (playerArray.length !== 2) {
    return showError('❌ Bitte geben Sie genau zwei Spielernamen ein, getrennt durch ein Komma.');
  }

  // Validate score
  const scoreArray = score.split(':').map(num => Number(num.trim()));
  if (scoreArray.length !== 2 || scoreArray.some(num => Number.isNaN(num) || num < 0 || num > 13)) {
    return showError('❌ Das Score-Feld muss im Format "Zahl:Zahl" sein (zwischen 0 und 13).');
  }

  // Build game object
  const game = {
    matchDate,
    matchTime,
    players: playerArray,
    score: scoreArray,
    completed: scoreArray.some(score => score === 13)
  };

  // If editing, update the game
  if (editingGameId) {
    await updateGame(editingGameId, game);

    // Reset editing mode
    editingGameId = null;
    document.querySelector('#matchForm button[type="submit"]').textContent = 'Spiel hinzufugen';
  } else {
    // Otherwise add a new game
    await addGame(game);
  }

  // Clear form
  document.getElementById('matchForm').reset();
});

// Function to update an existing game
async function updateGame (gameId, game) {
  try {
    const response = await fetch(`/api/games/${gameId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(game)
    });

    if (!response.ok) throw new Error('Fehler beim Aktualisieren der Partie');

    const updatedGame = await response.json();

    // Display the updated game in the correct section
    checkAndMoveCompletedGame(updatedGame);

    showError('✅ Spiel erfolgreich aktualisiert!');
    return updatedGame;
  } catch (error) {
    showError('❌ Fehler beim Aktualisieren des Spiels: ' + error.message);
  }
}

// Function to handle editing a game
export async function handleEditGame(gameId) {
  console.log('🔍 Bearbeiten gestartet für Spiel-ID:', gameId);
  try {
    const response = await fetch(`/api/games/${gameId}`);
    if (!response.ok) throw new Error('Spiel nicht gefunden');
    const game = await response.json();

    console.log('📥 Geladene Spieldaten:', game);

    // Format date for input field (YYYY-MM-DD)
    let formattedDate;
    try {
      const dateObj = new Date(game.matchDate);
      formattedDate = dateObj.toISOString().split('T')[0];
    } catch (e) {
      formattedDate = game.matchDate;
    }

    // Populate the form fields
    document.getElementById('matchDate').value = formattedDate;
    document.getElementById('matchTime').value = game.matchTime || '';
    document.getElementById('players').value = game.players.join(', ');
    document.getElementById('score').value = game.score.join(':');

    // Set editing ID
    editingGameId = gameId;
    console.log(`✏️ Jetzt wird Spiel ${editingGameId} bearbeitet`);

    // Change button text
    document.querySelector('#matchForm button[type="submit"]').textContent = 'Änderungen speichern';

    // Scroll to the form
    const matchForm = document.getElementById('matchForm');
    if (matchForm) {
      matchForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  } catch (error) {
    showError('❌ Fehler beim Bearbeiten des Spiels: ' + error.message);
  }
}

// Function to delete a game
export async function deleteGame (gameId) {
  if (!confirm('Sind Sie sicher, dass Sie dieses Spiel löschen möchten?')) return;

  try {
    const response = await fetch(`/api/games/${gameId}`, { method: 'DELETE' });
    if (!response.ok) throw new Error('Fehler beim Löschen der Partie');

    // Remove from all sections
    document.querySelector(`tr[data-id="${gameId}"]`)?.remove();
    document.querySelector(`li[data-id="${gameId}"]`)?.remove();

    showError('✅ Spiel erfolgreich gelöscht!');
  } catch (error) {
    showError('❌ Fehler beim Löschen des Spiels: ' + error.message);
  }
}

// Function to display match history and populate both sections
export async function displayMatchHistory () {
  const matchTableBody = document.getElementById('matchTableBody');
  const completedGamesList = document.getElementById('completed-games').querySelector('ul');
  const pageInfo = document.getElementById('pageInfo');

  if (!matchTableBody || !completedGamesList || !pageInfo) {
    console.error('matchTableBody, completedGamesList, oder pageInfo nicht gefunden!');
    return;
  }

  console.log('displayMatchHistory() wird aufgerufen!');

  try {
    const games = await fetchGames();
    console.log('Geladene Spiele:', games);

    // Clear existing content
    matchTableBody.innerHTML = '';
    completedGamesList.innerHTML = '';

    if (games.length === 0) {
      matchTableBody.innerHTML = '<tr><td colspan="5">Keine Spiele gefunden.</td></tr>';
      return;
    }

    // Calculate pagination
    const totalPages = Math.ceil(games.length / gamesPerPage);
    const startIndex = (currentPage - 1) * gamesPerPage;
    const endIndex = startIndex + gamesPerPage;
    const paginatedGames = games.slice(startIndex, endIndex);

    // Update page info
    pageInfo.textContent = `Seite ${currentPage} von ${totalPages}`;

    // Display games in appropriate sections
    paginatedGames.forEach(game => {
      if (!game._id) return;

      // Add to match table
      matchTableBody.appendChild(gameRow(game));

      // Check if the game is completed
      if (game.completed || game.score.some(score => score === 13)) {
        // Add to completed games list
        const completedGameItem = document.createElement('li');
        completedGameItem.dataset.id = game._id;

        // Format the date and time
        const formattedDate = formatDate(game.matchDate);
        const formattedTime = game.matchTime || 'Keine Zeit';

        completedGameItem.textContent = `${formattedDate} ${formattedTime} ${game.players.join(', ')} ${game.score.join(':')}`;
        completedGamesList.appendChild(completedGameItem);
      }
    });
  } catch (error) {
    showError('Fehler beim Laden der Match History: ' + error.message);
  }
}

// Event listeners for pagination
document.getElementById('prevPage')?.addEventListener('click', () => {
  if (currentPage > 1) {
    currentPage--;
    displayMatchHistory();
  }
});

document.getElementById('nextPage')?.addEventListener('click', async () => {
  const games = await fetchGames();
  const totalPages = Math.ceil(games.length / gamesPerPage);

  if (currentPage < totalPages) {
    currentPage++;
    displayMatchHistory();
  }
});

// Load match history on page load
document.addEventListener('DOMContentLoaded', () => {
  if (!window.matchHistoryLoaded) {
    window.matchHistoryLoaded = true;
    displayMatchHistory();
  }
});
