/* global confirm */
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
  const latitude = parseFloat(document.getElementById('latitude').value);
  const longitude = parseFloat(document.getElementById('longitude').value);

  const place = { name, latitude, longitude };// create a place object
  await addPlace(place); // call this function to send data to the backend
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
// function that allows the user to edit the game
export function updateGameList (games) {
  const gameContainer = document.getElementById('gameList');
  gameContainer.innerHTML = '';

  games.forEach((game) => {
    // iterates over the game array
    // and creates a new div element for each game and assigns it in the class game-item
    const gameItem = document.createElement('div');
    gameItem.classList.add('game-item');

    gameItem.innerHTML = `
    <b>${game.date}</b><br>
    Spieler: ${game.players}<br>
    Punkte: ${game.ScoreHistory.join(' - ')}
    `;
    // for handling delete button
    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Löschen';
    deleteButton.addEventListener('click', async () => {
      await deleteGame(game.id); // Call the imported delete function
      updateGameList(await fetchGames()); // Refresh the UI after deletion
    });

    gameItem.appendChild(deleteButton);
    // adds newly created div class with game details and the delete button to the #gamelist container
    gameContainer.appendChild(gameItem);
  });
}
// function to handle the updating place list
export function updatePlaceList (places) {
  const placeContainer = document.getElementById('locationList');
  placeContainer.innerHTML = '';

  places.forEach((place) => {
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
