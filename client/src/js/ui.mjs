/* global confirm, alert */
/*
modifikation:
die Struktur von User-Interface sieht jetzt so aus:
1)den Platz und das Spiel holen
2)den Platz aktualisieren (render) und delete funktion
3)das Spiel aktualisieren (auch render) und delete funktion
*/
import { handleEditGame, displayMatchHistory } from './games.mjs';
import { handleEditPlace } from './places.mjs';

let places = [];
let games = [];

document.addEventListener('DOMContentLoaded', async function () {
  places = await fetchPlaces();
  games = await fetchGames();
  if (places.length > 0) renderPlaces();
  if (games.length > 0) renderGames();
  displayMatchHistory();
  const locationList = document.getElementById('locationList');
  // event listener nur einmal fuer den Platz
  if (locationList) {
    locationList.addEventListener('click', function (event) {
      const placeId = event.target.dataset.id;
      if (event.target.classList.contains('edit-btn')) {
        handleEditPlace(placeId);
      }
      if (event.target.classList.contains('delete-btn')) {
        deletePlace(placeId);
      }
    });
  }
  const matchTableBody = document.getElementById('matchTableBody');
  // event listener nur einmal fuer das Spiel
  if (matchTableBody) {
    matchTableBody.addEventListener('click', async (event) => {
      const gameId = event.target.dataset.id; // Id extrahieren
      if (!gameId) return;
      if (event.target.classList.contains('edit-btn')) {
        handleEditGame(gameId);
      } else if (event.target.classList.contains('delete-btn')) {
        await deleteGame(gameId);
      }
    });
  }
});
export async function fetchPlaces () {
  try {
    const response = await fetch('/api/plaetze');
    if (!response.ok) throw new Error('Fehler beim Laden der Orte');
    return await response.json();
  } catch (error) {
    console.error(error);
    alert('Fehler beim Laden des Ortes. Bitte versuchen Sie  es später erneut.');
    return [];
  }
}
export async function fetchGames () {
  try {
    const response = await fetch('/api/games');
    if (!response.ok) throw new Error('Fehler beim Laden der Spiele');
    return await response.json();
  } catch (error) {
    console.error(error);
    alert('Fehler beim Laden des Spiels. Bitte versuchen Sie  es später erneut.');
    return [];
  }
}
export function renderPlaces () {
  const locationList = document.getElementById('locationList');
  locationList.innerHTML = '';

  places.forEach((place) => {
    const li = document.createElement('li');
    li.innerHTML = `
    <span>${place.name} (${Number(place.lat).toFixed(4)}, ${Number(place.lng).toFixed(4)})</span>
    <button class="edit-btn" data-id="${place._id}">Bearbeiten </button>
    <button class="delete-btn" data-id="${place._id}">Löschen</button>`;
    locationList.appendChild(li);
  });
}
// function for deleting places
export async function deletePlace (placeId) {
  if (!confirm('Möchten Sie diesen Ort wirklich löschen?')) return;
  try {
    await fetch(`/api/plaetze/${placeId}`, { method: 'DELETE' });
    places = await fetchPlaces(); // refresh places list
    renderPlaces();
  } catch (error) {
    console.error('Fehler beim Loeschen des Ortes.');
  }
}
export async function renderGames () {
  const ongoingGameList = document.getElementById('onGoingGameList');
  const completedGameList = document.querySelector('#completed-games ul');

  if (!ongoingGameList || !completedGameList) {
    console.error('Fehler: Listenelemente nicht gefunden!');
    return;
  }

  ongoingGameList.innerHTML = '';
  completedGameList.innerHTML = '';

  const games = await fetchGames();
  if (games.length === 0) {
    ongoingGameList.innerHTML = '<li>Keine Spiele gefunden</li>';
    completedGameList.innerHTML = '<li>Keine abgschlossene Spiele</li>';
    return;
  }
  games.forEach((game) => {
    const li = document.createElement('li');
    const formattedDate = new Date(game.matchDate).toLocaleDateString('de-DE');

    li.innerHTML = `
    <span>${formattedDate} - ${game.players} (${game.score})</span>
    <button class="edit-btn" data-id="${game._id}">Bearbeiten </button>
    <button class="delete-btn" data-id="${game._id}">loeschen </button>`;

    if (game.completed) {
      completedGameList.appendChild(li);
    } else {
      ongoingGameList.appendChild(li);
    }
  });
}
// Funktion zum Loeschen des Spiels
export async function deleteGame (gameId) {
  if (!confirm('Möchten Sie dieses Spiel wirklich löschen?')) return;

  try {
    const response = await fetch(`/api/games/${gameId}`, {
      method: 'DELETE'
    });

    if (!response.ok) throw new Error('Fehler beim Löschen des Spiels');

    await renderGames(); // Aktualisiert die UI nach dem Löschen
  } catch (error) {
    console.error('Fehler beim Löschen des Spiels:', error);
    alert('❌ Das Spiel konnte nicht gelöscht werden.');
  }
}
