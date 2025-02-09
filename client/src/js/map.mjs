/* global L, alert */
import { fetchGames } from './games.mjs';
import { updateGameList } from './ui.mjs';
export let map;
document.addEventListener('DOMContentLoaded', () => {
  const mapContainer = document.getElementById('map-container');
  if (!mapContainer) {
    console.error('Map container element is missing');
    return;
  }
  // Initialize the map
  map = L.map('map-container').setView([51.1657, 10.4515], 6); // Germany coordinates
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
  }).addTo(map);
});

const markers = new Map();
// function to check if the location is in Germany
export async function isGermany (lat, lng) {
  const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`;
  try {
    const response = await fetch(url);
    // if the server is unable to respond
    if (!response.ok) {
      throw new Error(`Server status ${response.status}`);
    }
    const data = await response.json();
    // if the API is unable to respond
    if (!data.address || !data.address.country) {
      throw new Error('ungueltige Antwort von API');
    }

    return data.address && data.address.country === 'Germany';
  } catch (error) {
    console.warn('Der Bereich ist ausserhalb von Deutschland: ', error);
    return null;
  }
}

// Function to add a place marker on the map
export async function addMarker (platz) {
  // check if the coordinates are valid first
  if (!platz || !platz.coords || platz.coords.length !== 2) {
    console.error('Ungueltige Platzdaten: ', platz);
    alert('Fehler: ungueltige Platzdaten.');
    return;
  }

  const key = platz.coords.join(',');

  if (markers.has(key)) return;

  const inGermany = await isGermany(platz.coords[0], platz.coords[1]);
  if (!inGermany) {
    alert('Dieser Ort liegt ausserhalb von Deutschland');
    return;
  }
  const marker = L.marker(platz.coords).addTo(map).bindPopup(`
      <b>${platz.platzName}</b><br>
      Zugang: ${platz.zugang}<br>
      Typ: ${platz.publicAccess}<br>
      Feld: ${platz.anzahlFelder}<br>
      Notizen: ${platz.notizen || 'Keine'}<br>
      <button class="edit-btn" data-id="${platz.id}">Bearbeiten</button>   
      <button class="delete-btn" data-id="${platz.id}" data-key="${key}">Loeschen</button>
    `).on('click', async function () {
    try {
      const allGames = await fetchGames();
      const filteredGames = allGames.filter(game => game.platz === platz.id);
      updateGameList(filteredGames);
    } catch (error) {
      console.error('Fehler beim Aufruf der Spiele', error);
    }
  });

  markers.set(key, marker);// stores the marker
}

// function to remove a marker by coordinates
export function removeMarker (coords) {
  // first check if the coordinates are valid for removal
  if (!coords || coords.length !== 2) {
    console.error('ungueltige Koordinaten: ', coords);
    return;
  }
  const key = coords.join(',');

  if (markers.has(key)) {
    map.removeLayer(markers.get(key));
    markers.delete(key);
  }
}
