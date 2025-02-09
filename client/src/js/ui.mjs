/* global confirm, alert */
import { fetchGames, deleteGame } from './games.mjs';// used to refresh the game list
import { fetchPlaces } from './places.mjs';
// function to handle adding a place (sent to backend)
export async function addPlace (place) {
  try {
    const response = await fetch('api/places', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(place)
    });
    if (!response.ok) throw new Error('Fehler beim Speichern des Ortes');
    console.log('Ort hinzugefuegt');
    updatePlaceList(await fetchPlaces());
  } catch (error) {
    console.error(error);
  }
}
// event listener for the location form submission
document.getElementById('locationForm').addEventListener('submit', async (event) => {
  event.preventDefault();

  const name = document.getElementById('name').value;
  // get the location from the map
  if (!navigator.geolocation) {
    alert('Geolocation wird nicht unterstuetzt');
    return;
  }
  navigator.geolocation.getCurrentPosition(async (position) => {
    const latitude = position.coords.latitude;
    const longitude = position.coords.longitude;

    const place = { name, latitude, longitude };// automatically set coordinates
    await addPlace(place);
  }, (error) => {
    console.error('Fehler beim Aufruf der Position', error);
    alert('Konnte den Standort nicht abrufen');
  });
});
// function that can let the user delete the place
export async function deletePlace (placeId) {
  if (!confirm('Moechten Sie diesen Ort wirklich loeschen?')) return;

  try {
    const response = await fetch(`/api/places/${placeId}`, { method: 'DELETE' });
    if (!response.ok) throw new Error('Fehler beim Loeschen des Ortes');
    console.log(`Ort geloescht: ${placeId}`);
    updatePlaceList(await fetchPlaces());
  } catch (error) {
    console.error(error);
  }
}
// function that updates the game list based on selected place
export function updateGameList (games, selectedPlaceId) {
  const gameContainer = document.getElementById('gameList');
  gameContainer.innerHTML = '';

  if (!games || games.length === 0) {
    gameContainer.innerHTML = '<p>Keine Spiele gefunden.</p>';
    return;
  }
  // filter games to include only matches played at the selected place
  const filteredGames = games.filter(game => game.placeId === selectedPlaceId);

  if (filteredGames.length === 0) {
    gameContainer.innerHTML = '<p>Keine Spiele fuer diesen Ort gefunden.</p>';
    return;
  }
  // create a table
  const table = document.createElement('table');
  table.classList.add('game-table');
  // create table header
  const headerRow = document.createElement('tr');
  headerRow.innerHTML = `
    <th>Datum</th>
    <th>Spieler</th>
    <th>Punkte</th>
    <th>Aktionen</th>
  `;
  table.appendChild(headerRow);

  // create table rows for each game
  games.forEach((game) => {
    const row = document.createElement('tr');

    const formattedDate = game.matchDate ? new Date(game.matchDate).toLocaleDateString() : 'Kein Datum';
    const playersText = game.players ? game.players.join(', ') : 'Unbekannt';
    const scoreText = game.ScoreHistory ? game.ScoreHistory.join(' - ') : 'Keine Punkte';
    row.innerHTML = `
      <td>${formattedDate}</td>
      <td>${playersText}</td>
      <td>${scoreText}</td>
    `;
    // for handling delete button
    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Löschen';
    deleteButton.addEventListener('click', async () => {
      await deleteGame(game.id); // Call the imported delete function
      updateGameList(await fetchGames(), selectedPlaceId); // Refresh the UI after deletion and for the selected place
    });

    // add delete button to a separate table cell
    const actionCell = document.createElement('td');
    actionCell.appendChild(deleteButton);
    row.appendChild(actionCell);

    table.appendChild(row);
  });

  gameContainer.appendChild(table);
}
// function to handle the updating place list
export function updatePlaceList (places) {
  const placeContainer = document.getElementById('locationList');
  placeContainer.innerHTML = '';

  places.forEach(place => {
    const placeItem = document.createElement('div');
    placeItem.classList.add('place-item');

    placeItem.innerHTML = `
    <b>${place.platzName}</b><br>
    Zugang: ${place.zugang}<br>
    Outdoor/Indoor: ${place.publicAccess}<br>
    Spielfelder: ${place.anzahlFelder}<br>
    Koordinaten: ${place.coords.join(', ')}<br>
    Notizen: ${place.notizen || 'Keine Notizen'}
    `;
    // create a delete button for each place
    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Loeschen';
    deleteButton.addEventListener('click', async () => {
      await deletePlace(place.id);// call the delete function for places
      updatePlaceList(await fetchPlaces());
    });

    placeItem.appendChild(deleteButton);
    placeContainer.appendChild(placeItem);
  });
}
// load place list on page load
document.addEventListener('DOMContentLoaded', async () => {
  updateGameList(await fetchGames());
  updatePlaceList(await fetchPlaces());
});
