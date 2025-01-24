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

// function for deleting games
export async function deleteGame (gameId) {
  if (!confirm('Möchten Sie diese Partie wirklich löschen?')) return;

  try {
    const response = await fetch(`/api/games/${gameId}`, { method: 'DELETE' });
    if (!response.ok) throw new Error('Fehler beim Löschen der Partie');
    console.log('Partie gelöscht.');
  } catch (error) {
    console.error(error);
  }
}
