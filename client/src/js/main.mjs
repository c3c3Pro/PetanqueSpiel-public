import './map.mjs';
import { fetchPlaces, renderPlaces } from './places.mjs'; // This initializes map event listeners and loads places
import { fetchGames, renderGames } from './games.mjs';

// loads the website
async function loadData () {
  try {
    const places = await fetchPlaces();
    renderPlaces(places);

    const games = await fetchGames();
    renderGames(games);
  } catch (error) {
    console.error('Fehler beim Laden der Daten: ', error);
  }
}
document.addEventListener('DOMContentLoaded', () => {
  loadData();
});
