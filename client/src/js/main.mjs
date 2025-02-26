import './map.mjs';
import { fetchPlaces, renderPlaces } from './places.mjs'; // This initializes map event listeners and loads places
import { displayMatchHistory } from './games.mjs';

// loads the website
async function loadData () {
  try {
    const places = await fetchPlaces();
    renderPlaces(places);

    await displayMatchHistory();
  } catch (error) {
    console.error('Fehler beim Laden der Daten: ', error);
  }
}
document.addEventListener('DOMContentLoaded', () => {
  loadData();
});
