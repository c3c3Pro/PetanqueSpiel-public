/* global L, prompt, alert, ladePlatz */
// Initialize the map
const map = L.map('map').setView([51.1657, 10.4515], 6); // Germany coordinates
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap contributors'
}).addTo(map);

// function to check if the location is in Germany
async function isGermany (lat, lng) {
  const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    return data.address && data.address.country === 'Germany';
  } catch (error) {
    console.error('Der Bereich ist ausserhalb von Deutschland: ', error);
    return false;
  }
}

// Function to add a place marker on the map
export function addMarker(platz) {
    L.marker(platz.coords).addTo(map).bindPopup(`
      <b>${platz.platzName}</b><br>
      Zugang: ${platz.zugang}<br>
      Typ: ${platz.publicAccess}<br>
      Feld: ${platz.anzahlFelder}<br>
      Notizen: ${platz.notizen || 'Keine'}
    `).openPopup();
  }