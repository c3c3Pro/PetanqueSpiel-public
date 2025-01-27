/* global prompt, alert */
import { map, isGermany, addMarker } from './map.mjs';
import { updatePlaceList } from './ui.mjs';
// Function to load places from backend and add them to the map
export async function ladePlatz () {
  try {
    const response = await fetch('/api/plaetze');
    if (!response.ok) throw new Error('Plaetze konnten nicht geladen werden');
    const plaetzen = await response.json(); // Correctly define plaetzen

    plaetzen.forEach((platz) => addMarker(platz));
  } catch (error) {
    console.error('Fehler beim Aufruf des Ortes', error.message);
  }
}
// function to fetch places from the backend
export async function fetchPlaces () {
  try {
    const response = await fetch('/api/plaetze');
    if (!response.ok) throw new Error('Plaetze konnten nicht geladen werden');
    const plaetzen = await response.json();
    return plaetzen;
  } catch (error) {
    console.error('Fehler beim Aufruf des Ortes', error.message);
    return [];
  }
}
// Function to handle adding a new place
async function handleMapClick (e) {
  const { lat, lng } = e.latlng;
  // check if the place already exists to avoid any duplications
  const existingPlaces = await fetchPlaces();
  const alreadyExists = existingPlaces.some(p => p.coords[0] === lat && p.coords[1] === lng);
  if (alreadyExists) {
    alert('Ein Platz existiert bereits an dieser Position! bitte neue Position auswaehlen');
    return;
  }
  // if the user clicked on a place outside Germany
  const inGermany = await isGermany(lat, lng);
  if (!inGermany) {
    alert('Dieser Ort liegt ausserhalb Deutschlands. Bitte waehlen Sie eine deutsche Position aus!');
    return;
  }
  // ask the user to fill out the form
  // platzname, zugang, access, anzahl der Felder, notizen(optional)
  const platzName = prompt('den Name eintragen: ');
  if (!platzName.trim()) {
    alert('Der Name darf nicht leer sein!');
    return;
  }

  let zugang;
  do {
    zugang = prompt('Zugang eingeben(oeffentlich oder Privat): ')?.trim().toLowerCase();
    if (zugang === null) return;
  } while (!['oeffentlich', 'privat'].includes(zugang));

  let publicAccess;
  do {
    publicAccess = prompt('Outdoor oder Indoor?: ')?.trim().toLowerCase();
    if (publicAccess === null) return;
  } while (!['outdoor', 'indoor'].includes(publicAccess));

  const anzahlFelder = prompt('Die Anzahl der Spielfelder eintragen: ');
  if (!anzahlFelder || isNaN(anzahlFelder) || anzahlFelder <= 0) {
    alert('Bitte eine gültige Nummer eingeben: ');
    return;
  }

  const notizen = prompt('Notizen (optional): ');

  const neuerPlatz = {
    platzName,
    zugang,
    publicAccess,
    anzahlFelder: parseInt(anzahlFelder, 10),
    coords: [lat, lng],
    notizen: notizen || ''
  };

  addMarker(neuerPlatz);

  try {
    const response = await fetch('/api/plaetze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(neuerPlatz)
    });
    if (!response.ok) throw new Error('Plaetze konnten nicht gespeichert werden');
    console.log('Platz erfolgreich gespeichert');
    // update UI list
    updatePlaceList(await fetchPlaces());
  } catch (error) {
    console.log('Fehler beim Speichern des Platzes', error.message);
  }
}

// Attach event listener for map clicks
map.on('click', handleMapClick);

// Load places on map
ladePlatz();
