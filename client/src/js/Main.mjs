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

// handle map clicks
map.on('click', async (e) => {
  const { lat, lng } = e.latlng;
  // ensures that the clicked map is within Germany
  const inGermany = await isGermany(lat, lng);
  if (!inGermany) {
    alert('Dieser Ort liegt ausserhalb Deutschlands. Bitte waehlen Sie eine deutsche Position aus!');
    return;
  }

  // prompt the user for place details
  const platzName = prompt('den Name eintragen: ');
  if (!platzName) return;

  const zugang = prompt('den Zugang eintragen (oeffentlich oder Privat): ');
  if (!zugang) return;

  const publicAccess = prompt('Outdoor oder Indoor?:');
  if (!publicAccess) return;

  const anzahlFelder = prompt('Die Anzahl der Spielfelder eintragen: ');
  if (!anzahlFelder || isNaN(anzahlFelder)) {
    alert('Bitte eine gueltige Nummer eingeben: ');
    return;
  }

  const notizen = prompt('Notizen(optional): ');

  const neuerPlatz = {
    platzName,
    zugang,
    publicAccess,
    anzahlFelder: parseInt(anzahlFelder, 10),
    coords: [e.latlng.lat, e.latlng.lng],
    notizen: notizen || ''
  };

  L.marker(neuerPlatz.coords).addTo(map).bindPopup(
        `<b>${neuerPlatz.platzName}</b><br>
        Zugang: ${neuerPlatz.zugang}<br>
        Typ: ${neuerPlatz.publicAccess}<br>
        Feld: ${neuerPlatz.anzahlFelder}<br>
        Notizen: ${neuerPlatz.notizen}`
  ).openPopup();
  // save to the backend
  try {
    const response = await fetch('/api/plaetze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(neuerPlatz)
    });
    if (!response.ok) throw new Error('Plaetze konnten nicht gespeichert werden');
    console.log('platz erfolgreich gespeichert');
  } catch (error) {
    console.log('Fehler beim Speichern des Platzes');
  }
});
// fetch and display existing places from the backend
async function ladePlatz () {
  try {
    const response = await fetch('/api/plaetze');
    if (!response.ok) throw new Error('Plaetze konnten nicht gespeichert werden');
    const plaetzen = await response.json();

    plaetzen.forEach((platz) => {
      const marker = L.marker([platz.coords[0], platz.coords[1]]).addTo(map);
      marker.bindPopup(`
                <b>${platz.platzName}</b><br>
                Zugang: ${platz.zugang}<br>
                Typ: ${platz.publicAccess}<br>
                Spielfelder: ${platz.anzahlFelder}<br>
                Notizen: ${platz.notizen || 'Keine'}
            `);
    });
  } catch (error) {
    console.error('Fehler beim Aufruf des Ortes');
  }
}
// load places on map
ladePlatz();
