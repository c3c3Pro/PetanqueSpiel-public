import './map.mjs';
import { fetchPlaces } from './places.mjs'; // This initializes map event listeners and loads places
import { fetchGames } from './games.mjs';
import { updatePlaceList, updateGameList } from './ui.mjs';

// loads the website
async function loadData () {
  try {
    const places = await fetchPlaces();
    updatePlaceList(places);

    const games = await fetchGames();
    updateGameList(games);
  } catch (error) {
    console.error('Fehler beim Laden der Daten: ', error);
  }
}
document.addEventListener('DOMContentLoaded', () => {
  loadData();
});
