/* global confirm, alert, prompt */

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
  // check if any score is greater than 13
  if (game.score.some(s => s > 13)) {
    alert('Ein Spieler kann nicht mehr als 13 Punkte haben!');
    return;
  }

  try {
    const response = await fetch('/api/games', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(game)
    });
    if (!response.ok) throw new Error('Fehler beim Speichern der Partie');
    console.log('Partie hinzugefuegt');
    updateGameList(await fetchGames(), game.placeId);
  } catch (error) {
    console.error(error);
  }
}
// event listener for the match form submission
document.getElementById('matchForm').addEventListener('submit', async (event) => {
  event.preventDefault();

  const matchDate = new Date(document.getElementById('matchDate').value).toISOString();
  const players = document.getElementById('players').value.split(',').map(p => p.trim());
  const score = document.getElementById('score').value.split(',').map(s => parseInt(s.trim(), 10));

  const game = { matchDate, players, score };// create a game object
  await addGame(game);
});
// editing games
export async function editGame (gameId) {
  const newName = prompt('Neuer Name fuer das Spiel eingeben: ');
  if (!newName) return; // cancel if empty

  try {
    const response = await fetch(`/api/games/${gameId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newName })
    });
    if (!response) throw new Error(`Fehler: ${response.statusText}`);
    alert('Spiel erfolgreich aktualisiert!');
    updateGameList(await fetchGames());
  } catch (error) {
    console.error('Fehler beim Aktualisieren', error);
  }
}
// Funktion zum Löschen eines Spiels
export async function deleteGame (gameId) {
  if (!confirm('Möchten Sie dieses Spiel wirklich löschen?')) return;

  try {
    const response = await fetch(`/api/games/${gameId}`, { method: 'DELETE' });
    if (!response.ok) throw new Error('Fehler beim Löschen der Partie');

    console.log('Spiel gelöscht.');
    updateGameList(await fetchGames()); // refresh list after deleting
  } catch (error) {
    console.error(error);
  }
}
// load match history on page load
document.addEventListener('DOMContentLoaded', async () => {
  updateGameList(await fetchGames());
});
