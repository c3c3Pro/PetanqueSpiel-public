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
      <td>${game.matchDate || 'Kein Datum'}</td>
      <td>${game.matchTime || 'Keine Zeit'}</td>
      <td>${game.players.join(', ')}</td>
      <td>${game.score.join(':')}</td>
    `;
    gamesTable.appendChild(row);
  });
}

// Function to fetch games from the backend
export async function fetchGames() {
  try {
    const response = await fetch('/api/games');
    if (!response.ok) throw new Error('Fehler beim Laden der Partien');

    const games = await response.json();
    console.log("🎯 FetchGames - Geladene Daten:", games);

    return games.map(game => ({
      ...game,
      matchDate: game.matchDate || 'Kein Datum',
      matchTime: game.matchTime || 'Keine Zeit',
      players: game.players || [],
      score: game.score || [0, 0]
    }));
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
// Funktion zur Erstellung einer Tabellenzeile für ein Spiel
function gameRow(game) {
  const row = document.createElement('tr');
  row.setAttribute('data-id', game._id);  // 🔥 WICHTIG! Ohne das geht die Bearbeitung nicht.

  const formattedDate = new Date(game.matchDate).toLocaleDateString('de-DE');
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




// Event-Listener für die Tabelle, um Klicks auf "Bearbeiten" und "Löschen" zu erkennen
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


// Function to check if a game is completed and move it to the completed-games section
function checkAndMoveCompletedGame(game) {
  const completedGamesList = document.getElementById('completed-games').querySelector('ul');
  const matchTableBody = document.getElementById('matchTableBody');
  
  if (!completedGamesList || !matchTableBody) return;

  // Prüfen, ob das Spiel bereits existiert
  const existingGame = document.querySelector(`tr[data-id="${game._id}"]`);
  if (existingGame) existingGame.remove(); // Falls vorhanden, erst löschen

  // Falls das Spiel abgeschlossen ist (13 Punkte erreicht), füge es in die Tabelle ein
  if (game.score.some(score => score === 13)) {
    // Zu den abgeschlossenen Spielen hinzufügen
    const completedGameItem = document.createElement('li');
    completedGameItem.dataset.id = game._id;
    completedGameItem.textContent = `${game.matchDate} ${game.matchTime} ${game.players.join(', ')} ${game.score.join(':')}`;
    completedGamesList.appendChild(completedGameItem);

    // In die Haupttabelle eintragen
    matchTableBody.appendChild(gameRow(game));
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
  console.log("🔍 Bearbeiten gestartet für Spiel-ID:", gameId); // Debugging
  try {
    const response = await fetch(`/api/games/${gameId}`);
    if (!response.ok) throw new Error('Spiel nicht gefunden');
    const game = await response.json();

    console.log("📥 Geladene Spieldaten:", game); // Debugging

    document.getElementById('matchDate').value = new Date(game.matchDate).toISOString().split('T')[0];
    document.getElementById('matchTime').value = game.matchTime || '';
    document.getElementById('players').value = game.players.join(', ');
    document.getElementById('score').value = game.score.join(':');

    // **Bearbeitungs-ID setzen**
    editingGameId = gameId;
    console.log(`✏️ Jetzt wird Spiel ${editingGameId} bearbeitet`); // Debugging

    // **Button-Text ändern**
    document.querySelector('#matchForm button[type="submit"]').textContent = 'Änderungen speichern';
  } catch (error) {
    showError('❌ Fehler beim Bearbeiten des Spiels: ' + error.message);
  }
}



// Anpassung des Event Listeners für das Formular
document.getElementById('matchForm')?.addEventListener('submit', async (event) => {
  event.preventDefault();

  const matchDate = document.getElementById('matchDate').value;
  const matchTime = document.getElementById('matchTime').value;
  const players = document.getElementById('players').value;
  const score = document.getElementById('score').value;

  const playerArray = players.split(',').map(name => name.trim()).filter(name => name);
  if (playerArray.length !== 2) {
    return showError('❌ Bitte geben Sie genau zwei Spielernamen ein.');
  }

  const scoreArray = score.split(':').map(num => Number(num.trim()));
  if (scoreArray.length !== 2 || scoreArray.some(num => Number.isNaN(num) || num < 0 || num > 13)) {
    return showError('❌ Das Score-Feld muss im Format "Zahl:Zahl" sein (zwischen 0 und 13).');
  }

  if (!editingGameId) {
    return showError('❌ Es wurde kein Spiel zum Bearbeiten ausgewählt.');
  }

  const gameData = { matchDate, matchTime, players: playerArray, score: scoreArray };
  const submitButton = document.querySelector('#matchForm button[type="submit"]');

  try {
    // **Spiel aktualisieren (PUT)**
    const response = await fetch(`/api/games/${editingGameId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(gameData)
    });

    if (!response.ok) throw new Error('Fehler beim Aktualisieren des Spiels');
    const updatedGame = await response.json();

    showError('✅ Spiel erfolgreich aktualisiert!');

    // **Altes Spiel aus der Tabelle entfernen**
    document.querySelector(`tr[data-id="${editingGameId}"]`)?.remove();

    // **Neues (aktualisiertes) Spiel in die Tabelle einfügen**
    appendGameToTable(updatedGame);

    // **Bearbeitungs-ID zurücksetzen und Button-Text anpassen**
    editingGameId = null;
    submitButton.textContent = 'Spiel hinzufügen';
  } catch (error) {
    showError('❌ Fehler beim Speichern des Spiels: ' + error.message);
  }

  // **Formular zurücksetzen**
  event.target.reset();
});









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
// Funktion zum Anzeigen des Spielverlaufs
export async function displayMatchHistory() {
  const matchTableBody = document.getElementById('matchTableBody');
  if (!matchTableBody) {
    console.error("⚠️ matchTableBody nicht gefunden!");
    return;
  }

  console.log("📌 displayMatchHistory() wird aufgerufen!");

  try {
    const games = await fetchGames(); // Spiele abrufen
    console.log("🎯 Geladene Spiele:", games);

    matchTableBody.innerHTML = ''; // Vorherige Einträge löschen

    if (games.length === 0) {
      matchTableBody.innerHTML = '<tr><td colspan="5">Keine Spiele gefunden.</td></tr>';
      return;
    }

    games.forEach(game => {
      if (!game._id) return;
      matchTableBody.appendChild(gameRow(game));
    });

  } catch (error) {
    showError('Fehler beim Laden der Match History: ' + error.message);
  }
}


document.addEventListener('DOMContentLoaded', () => {
  if (!window.matchHistoryLoaded) {
    window.matchHistoryLoaded = true;
    displayMatchHistory();
  }
});



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
document.addEventListener(displayMatchHistory);