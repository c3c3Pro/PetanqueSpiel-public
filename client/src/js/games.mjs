/* global alert, prompt, confirm */
// Function to display errors
function showError(message) {
  alert(message); // Replace with a toast notification for better UX
  console.error(message);
}
// Function to render games in a table
export function renderGames(games) {
  const gamesTable = document.getElementById('matchList'); // Ensure this exists in your HTML
  if (!gamesTable) {
    console.error('Tabelle für Spiele nicht gefunden!');
    return;
  }

  gamesTable.innerHTML = ''; // Clear existing content

  games.forEach(game => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${game.date}</td>
      <td>${game.time}</td>
      <td>${game.players.join(', ')}</td>
      <td>${game.score}</td>
    `;
    gamesTable.appendChild(row);
  });
}
// Function to fetch games from the backend
export async function fetchGames() {
  try {
    const response = await fetch('/api/games');
    if (!response.ok) throw new Error('Fehler beim Laden der Partien');
    return await response.json();
  } catch (error) {
    showError('Die Partien konnten nicht geladen werden: ' + error.message);
    return [];
  }
}
// Function to handle adding a game (send to the backend)
export async function addGame(game) {
  try {
    const response = await fetch('/api/games/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(game)
    });

    if (!response.ok) throw new Error('Fehler beim Speichern der Partie');

    const newGame = await response.json();
    appendGameToTable(newGame);
    checkAndMoveCompletedGame(newGame); // Check if the game is completed
    showError('✅ Spiel erfolgreich hinzugefügt!');
    return newGame;
  } catch (error) {
    showError('❌ Fehler beim Hinzufügen des Spiels: ' + error.message);
  }
}
// Function to dynamically append a new game to the table
function appendGameToTable(game) {
  const matchTableBody = document.getElementById('matchTableBody');
  if (!matchTableBody) return;

  matchTableBody.appendChild(gameRow(game));
}
// Function to create a game row
function gameRow(game) {
  const row = document.createElement('tr');
  row.setAttribute('data-id', game._id);
  row.innerHTML = `
    <td>${new Date(game.matchDate).toLocaleDateString('de-DE')}</td>
    <td>${game.matchTime || 'Keine Zeit'}</td>
    <td>${game.players.join(', ')}</td>
    <td>${game.score.join(':')}</td>
    <td>
      <button class="edit-btn" data-id="${game._id}">Bearbeiten</button>
      <button class="btn delete-btn" data-id="${game._id}">Löschen</button>
    </td>
  `;
  return row;
}
// Function to check if a game is completed and move it to the completed-games section
function checkAndMoveCompletedGame(game) {
  const completedGamesList = document.getElementById('completed-games').querySelector('ul');
  if (!completedGamesList) return;
  // Check if the score reaches 13
  if (game.score.some(score => score === 13)) {
    const completedGameItem = document.createElement('li');
    completedGameItem.textContent = `${game.players.join(' vs ')} - ${game.score.join(':')} (${new Date(game.matchDate).toLocaleDateString('de-DE')})`;
    completedGamesList.appendChild(completedGameItem);

    // Remove the game from the ongoing list
    const ongoingGameRow = document.querySelector(`tr[data-id="${game._id}"]`);
    if (ongoingGameRow) ongoingGameRow.remove();
  }
}
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
  // Add game
  const game = { matchDate, matchTime, players: playerArray, score: scoreArray };
  await addGame(game);
});
// Function to handle editing a game
export async function handleEditGame(gameId) {
  try {
    const response = await fetch(`/api/games/${gameId}`);
    if (!response.ok) throw new Error('Spiel nicht gefunden');
    const game = await response.json();

    const newMatchDate = prompt('Neues Spieldatum (YYYY-MM-DD):', new Date(game.matchDate).toISOString().split('T')[0]);
    if (newMatchDate === null) return;

    const newMatchTime = prompt('Neue Spielzeit:', game.matchTime || '');
    if (newMatchTime === null) return;

    const newPlayers = prompt('Neue Spieler:', game.players.join(', '));
    if (newPlayers === null) return;
    const playerArray = newPlayers.split(',').map(p => p.trim());
    if (playerArray.length !== 2) {
      return showError('❌ Bitte genau zwei Spielernamen eingeben.');
    }

    const newScore = prompt('Neues Ergebnis (Zahl:Zahl):', game.score.join(':'));
    if (!/^\d{1,2}:\d{1,2}$/.test(newScore)) {
      return showError('❌ Das Score-Feld muss im Format "Zahl:Zahl" sein.');
    }

    const scoreParts = newScore.split(':').map(s => parseInt(s.trim(), 10));
    if (scoreParts.some(num => isNaN(num) || num < 0 || num > 13)) {
      return showError('❌ Ungültiges Score-Format');
    }

    const updatedResponse = await fetch(`/api/games/${gameId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        matchDate: newMatchDate,
        matchTime: newMatchTime,
        players: playerArray,
        score: scoreParts
      })
    });

    if (updatedResponse.ok) {
      const updatedGame = await updatedResponse.json();
      document.querySelector(`tr[data-id="${gameId}"]`).replaceWith(gameRow(updatedGame));
      checkAndMoveCompletedGame(updatedGame); // Check if the updated game is completed
    } else {
      throw new Error('Aktualisierung fehlgeschlagen');
    }
  } catch (error) {
    showError('❌ Fehler beim Bearbeiten des Spiels: ' + error.message);
  }
}
// Function to delete a game
export async function deleteGame(gameId) {
  if (!confirm('Sind Sie sicher, dass Sie dieses Spiel löschen möchten?')) return;

  try {
    const response = await fetch(`/api/games/${gameId}`, { method: 'DELETE' });
    if (!response.ok) throw new Error('Fehler beim Löschen der Partie');

    document.querySelector(`tr[data-id="${gameId}"]`)?.remove();
    showError('✅ Spiel erfolgreich gelöscht!');
  } catch (error) {
    showError('❌ Fehler beim Löschen des Spiels: ' + error.message);
  }
}
// Function to display match history
export async function displayMatchHistory() {
  const matchTableBody = document.getElementById('matchTableBody');
  if (!matchTableBody) return;

  try {
    const games = await fetchGames(); // Fetch all games
    matchTableBody.innerHTML = ''; // Clear previous entries

    if (games.length === 0) {
      matchTableBody.innerHTML = '<tr><td colspan="4">Keine Spiele gefunden.</td></tr>';
      return;
    }

    games.forEach(game => {
      if (!game._id) return;
      matchTableBody.appendChild(gameRow(game));
      checkAndMoveCompletedGame(game); // Check if the game is completed
    });
  } catch (error) {
    showError('Fehler beim Laden der Match History: ' + error.message);
  }
}
// Event delegation for edit and delete buttons
document.getElementById('matchTableBody')?.addEventListener('click', async (event) => {
  const target = event.target;
  const gameId = target.dataset.id;
  if (!gameId) return;

  if (target.classList.contains('edit-btn')) {
    await handleEditGame(gameId);
  } else if (target.classList.contains('delete-btn')) {
    await deleteGame(gameId);
  }
});
// Load match history on page load
document.addEventListener('DOMContentLoaded', displayMatchHistory);