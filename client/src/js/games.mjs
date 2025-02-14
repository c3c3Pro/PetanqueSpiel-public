/* global alert , prompt */

import { deleteGame } from './ui.mjs';

// function for fetching data from backend
export async function fetchGames () {
  try {
    const response = await fetch('/api/games');
    if (!response.ok) throw new Error('Fehler beim Laden der Partien');
    return await response.json();
  } catch (error) {
    console.error(error);
    alert('❌ Die Partien konnten nicht geladen werden.');
    return [];
  }
}
// function to handle adding a game (send to the backend)
export async function addGame (game) {
  try {
    const response = await fetch('/api/games/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(game)
    });
    if (!response.ok) throw new Error('Fehler beim Speichern der Partie');
   
    await displayMatchHistory();
    alert('✅ Spiel erfolgreich hinzugefuegt!');
  } catch (error) {
    console.error(error);
  }
}
// addiert dynamisch die neue Spiele
function appendGameToTable (game) {
  const matchTableBody = document.getElementById('matchTableBody');
  matchTableBody.appendChild(gameRow(game));
}
// Funktion zur Erstellung der Spiele
function gameRow (game) {
  const row = document.createElement('tr');
  row.setAttribute('data-id', game._id);
  row.innerHTML = `
  <td>${new Date(game.matchDate).toLocaleDateString('de-DE')}</td>
  <td>${game.matchTime || 'No time'}</td>
  <td>${game.players.join(', ')}</td>
  <td>${game.score.join(':')}</td>
  <td>
    <button class="edit-btn" data-id="${game._id}">Edit</button>
    <button class="btn delete-btn" data-id="${game._id}">Delete</button>
  </td>
`;
  return row;
}
document.getElementById('matchForm').addEventListener('submit', async (event) => {
  event.preventDefault();

  const matchDate = document.getElementById('matchDate').value;
  const matchTime = document.getElementById('matchTime').value;
  const players = document.getElementById('players').value;
  const score = document.getElementById('score').value;

  // 🟢 Validierung: Sicherstellen, dass genau zwei Spielernamen eingegeben wurden
  const playerArray = players.split(',').map(name => name.trim()).filter(name => name);
  if (playerArray.length !== 2 || playerArray.some(name => name === '')) {
    alert('❌ Bitte geben Sie genau zwei Spielernamen ein, getrennt durch ein Komma.');
    return;
  }

  // 🟢 Validierung: Score muss im Format "Zahl:Zahl" sein und zwischen 0-13 liegen
  const scoreArray = score.split(':').map(num => Number(num.trim()));
  if (scoreArray.some(num => Number.isNaN(num) || num < 0 || num > 13)) {
    alert('❌ Das Score-Feld muss im Format "Zahl:Zahl" sein (zwischen 0 und 13).');
    return;
  }

  // 🟢 Wenn alles in Ordnung ist, das Spiel hinzufügen
  const game = { matchDate, matchTime, players: playerArray, score: scoreArray };
  await addGame(game);
});
// Funktion zur Bearbeitung des Spiels
export async function handleEditGame (gameId) {
  try {
    const response = await fetch(`/api/games/${gameId}`);
    if (!response.ok) throw new Error('Spiel nicht gefunden');
    const game = await response.json();
    // Format date for prompt (YYYY-MM-DD)
    const currentDate = new Date(game.matchDate).toISOString().split('T')[0];
    // validierung: bearbeiteten Eingaben
    const newMatchDate = prompt('Neues Spieldatum:', currentDate);
    if (newMatchDate === null) return;
    // ISO format
    const newMatchDateISO = new Date(newMatchDate).toISOString();

    const newMatchTime = prompt('Neue Spielzeit:', game.matchTime || '');
    if (newMatchTime === null) return;

    const newPlayers = prompt('Neue Spieler:', game.players.join(', '));
    if (newPlayers === null) return;
    const playerArray = newPlayers.split(',').map(p => p.trim());
    if (playerArray.length !== 2 || playerArray.some(name => name === '')) {
      alert('❌ Bitte geben Sie genau zwei Spielernamen ein, getrennt durch ein Komma.');
      return;
    }

    const newScore = prompt('Neues Ergebnis:', game.score.join(':'));
    if (newScore === null || !/^\d{1,2}:\d{1,2}$/.test(newScore)) {
      alert('❌ Das Score-Feld muss im Format "Zahl:Zahl" sein.');
      return;
    }

    const scoreParts = newScore.split(':').map(s => parseInt(s.trim(), 10));
    if (scoreParts.some(num => Number.isNaN(num) || num < 0 || num > 13)) {
      alert('❌ Ungültiges Score-Format');
      return;
    }
    // unnoetige updates vermeiden
    if (
      newMatchDateISO === game.matchDate &&
      newMatchTime === game.matchTime &&
      newPlayers === game.players.join(',') &&
      newScore === game.score.join(':')
    ) {
      console.log('Keine Änderungen vorgenommen.');
      return;
    }
    // Aktualisierte request senden
    const updatedResponse = await fetch(`/api/games/${gameId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        matchDate: newMatchDateISO,
        matchTime: newMatchTime,
        players: playerArray,
        score: newScore.split(':').map(s => parseInt(s.trim(), 10))
      })
    });
    if (updatedResponse.ok) {
      const updatedGame = await updatedResponse.json();
      const existingRow = document.querySelector(`tr[data-id="${gameId}"]`);
      if (existingRow) {
        existingRow.replaceWith(gameRow(updatedGame));
      }
    } else {
      console.error('Aktualisierung fehlgeschlagen');
    }
  } catch (error) {
    console.error('Fehler beim Bearbeiten des Spiels:', error);
  }
}
// Funktion zum Abrufen und Anzeigen der Match History
export async function displayMatchHistory () {
  const matchTableBody = document.getElementById('matchTableBody');

  try {
    const games = await fetchGames(); // Holt alle gespeicherten Spiele
    matchTableBody.innerHTML = ''; // Vorherige Einträge leeren

    if (games.length === 0) {
      matchTableBody.innerHTML = '<tr><td colspan="4">Keine Spiele gefunden.</td></tr>';
      return;
    }

    games.forEach(game => {
      if (!game._id) return;
      matchTableBody.appendChild(gameRow(game));
    });
  } catch (error) {
    console.error('Fehler beim Laden der Match History:', error);
  }
}
// event delegation fuer edit und delete
document.getElementById('matchTableBody').addEventListener('click', async (event) => {
  const target = event.target;
  const gameId = target.dataset.id;
  if (!gameId) return;

  if (target.classList.contains('edit-btn')) {
    await handleEditGame(gameId);
  } else if (target.classList.contains('delete-btn')) {
    await deleteGame(gameId);
  }
});
// Match History beim Laden der Seite abrufen
document.addEventListener('DOMContentLoaded', displayMatchHistory);
