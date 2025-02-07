/* global confirm */

import { updateGameList } from './ui.mjs';

// function for fetching data from backend
export async function fetchGames () {
  try {
    const response = await fetch('/api/games');
    if (!response.ok) throw new Error('Fehler beim Laden der Partien');
    return await response.json();
  } catch (error) {
    console.error(error);
    return [];
  }
}
// function to handle adding a game (send to the backend)
export async function addGame (game) {
  try {
    const response = await fetch('/api/games', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(game)
    });
    if (!response.ok) throw new Error('Fehler beim Speichern der Partie');
    console.log('Partie hinzugefuegt');
    updateGameList(await fetchGames());
  } catch (error) {
    console.error(error);
  }
}
// event listener for the match form submission
document.getElementById('matchForm').addEventListener('submit', async (event) => {
  event.preventDefault();

  const matchDate = document.getElementById('matchDate').value;
  const players = document.getElementById('players').value;
  const score = document.getElementById('score').value;

  const game = { matchDate, players, score };// create a game object
  await addGame(game);
});
// Funktion zum Abrufen und Anzeigen der Match History
export async function displayMatchHistory() {
  const matchTableBody = document.getElementById('matchTableBody');

  try {
    const games = await fetchGames(); // Holt alle gespeicherten Spiele
    matchTableBody.innerHTML = ''; // Vorherige Einträge leeren

    if (games.length === 0) {
      matchTableBody.innerHTML = '<tr><td colspan="4">Keine Spiele gefunden.</td></tr>';
      return;
    }

    games.forEach(game => {
      const row = document.createElement('tr');

      // Spieldatum formatieren
      const formattedDate = new Date(game.matchDate).toLocaleDateString('de-DE');

      row.innerHTML = `
        <td>${formattedDate}</td>
        <td>${game.players.join(', ')}</td>
        <td>${game.score.join(':')}</td>
        <td>
          <button class="delete-btn" data-id="${game._id}">Löschen</button>
        </td>
      `;

      matchTableBody.appendChild(row);
    });

    // Event Listener für die Löschen-Buttons hinzufügen
    document.querySelectorAll('.delete-btn').forEach(button => {
      button.addEventListener('click', async (event) => {
        const gameId = event.target.getAttribute('data-id');
        await deleteGame(gameId);
      });
    });

  } catch (error) {
    console.error('Fehler beim Laden der Match History:', error);
  }
}

// Funktion zum Löschen eines Spiels
export async function deleteGame(gameId) {
  if (!confirm('Möchten Sie dieses Spiel wirklich löschen?')) return;

  try {
    const response = await fetch(`/api/games/${gameId}`, { method: 'DELETE' });
    if (!response.ok) throw new Error('Fehler beim Löschen der Partie');
    
    console.log('Spiel gelöscht.');
    displayMatchHistory(); // Tabelle nach dem Löschen aktualisieren
  } catch (error) {
    console.error(error);
  }
}

// Match History beim Laden der Seite abrufen
document.addEventListener('DOMContentLoaded', displayMatchHistory);


// Lade die Match History beim Start
document.addEventListener('DOMContentLoaded', displayMatchHistory);


