/* global L, alert */
// Initialize the map
const map = L.map('map').setView([51.1657, 10.4515], 6); // Germany coordinates
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap contributors'
}).addTo(map);

const markers = new Map();
// function to check if the location is in Germany
async function isGermany (lat, lng) {
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
  const marker = L.marker(platz.coords).addTo(map);

  marker(platz.coords).addTo(map).bindPopup(`
      <b>${platz.platzName}</b><br>
      Zugang: ${platz.zugang}<br>
      Typ: ${platz.publicAccess}<br>
      Feld: ${platz.anzahlFelder}<br>
      Notizen: ${platz.notizen || 'Keine'}
    `).openPopup();

  markers.set(key, marker);// stores the marker
}

// function to remove a marker by coordinates
export function removeMarker (coords) {
  // first check if the coordinates are valid for removal
  if (!coords || coords.length !== 2) {
    console.error('ungueltige Koordinaten: ', coords);
  }
  const key = coords.join(',');

  if (markers.has(key)) {
    map.removeLayer(markers.get(key));
    markers.delete(key);
  }
}
