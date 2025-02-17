/* global prompt, alert, confirm */
import { map, isGermany, addMarker } from './map.mjs';
// Store markers by place ID
const markers = new Map();
// Function to update the UI with places
export function renderPlaces (places) {
  const placesList = document.getElementById('locationList');
  if (!placesList) return;

  placesList.innerHTML = ''; // Clear existing list

  places.forEach(platz => {
    const item = document.createElement('li');
    item.textContent = `${platz.platzName} (${platz.publicAccess}, ${platz.zugang}) - ${platz.anzahlFelder} Felder`;
    item.addEventListener('click', () => handleEditPlace(platz));
    placesList.appendChild(item);
  });
}
// function to fetch places from the backend
export async function fetchPlaces () {
  try {
    const response = await fetch('/api/places');
    if (!response.ok) throw new Error('Plaetze konnten nicht geladen werden');
    return await response.json();
  } catch (error) {
    console.error('Fehler beim Aufruf des Ortes', error.message);
    return [];
  }
}
// Function to load places from backend and update the map
export async function ladePlatz () {
  try {
    document.getElementById('loadingIndicator')?.classList.remove('hidden'); // Show loading

    const places = await fetchPlaces();

    // Remove old markers only if fetching was successful
    markers.forEach(marker => map.removeLayer(marker));
    markers.clear();

    places.forEach(place => {
      const marker = addMarker(place);
      if (marker) {
        markers.set(place._id, marker);
        marker.on('click', () => handleEditPlace(place));
      }
    });

    renderPlaces(places);
  } catch (error) {
    console.error('Fehler beim Laden der Orte:', error.message);
  }
}
// Function to handle adding a new place
async function handleMapClick (e) {
  const { lat, lng } = e.latlng;
  // check if the place already exists to avoid any duplications
  const existingPlaces = await fetchPlaces();
  const alreadyExists = existingPlaces.some(p =>
    Math.abs(p.coords[0] - lat) < 0.0001 && Math.abs(p.coords[1] - lng) < 0.0001);
  if (alreadyExists) {
    alert('Ein Platz existiert bereits an dieser Position! bitte neue Position auswaehlen');
    return;
  }
  if (!await isGermany(lat, lng)) {
    alert('Dieser Ort liegt außerhalb Deutschlands. Bitte eine deutsche Position auswählen!');
    return;
  }

  const platzName = prompt('Den Namen eintragen:')?.trim();
  if (!platzName) return alert('Der Name darf nicht leer sein!');

  let zugang;
  do {
    zugang = prompt('Zugang eingeben (öffentlich oder privat):')?.trim().toLowerCase();
  } while (!['öffentlich', 'privat'].includes(zugang));

  let publicAccess;
  do {
    publicAccess = prompt('Outdoor oder Indoor?:')?.trim().toLowerCase();
  } while (!['outdoor', 'indoor'].includes(publicAccess));

  const anzahlFelder = parseInt(prompt('Die Anzahl der Spielfelder eintragen:'), 10);
  if (!Number.isInteger(anzahlFelder) || anzahlFelder <= 0) {
    return alert('Bitte eine gültige Anzahl eingeben!');
  }

  const neuerPlatz = { platzName, zugang, publicAccess, anzahlFelder, coords: [lat, lng], notizen: '' };
  addMarker(neuerPlatz);

  try {
    const response = await fetch('/api/places', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(neuerPlatz)
    });

    if (!response.ok) throw new Error('Plätze konnten nicht gespeichert werden');

    console.log('Platz erfolgreich gespeichert');
    ladePlatz(); // Refresh the list
  } catch (error) {
    console.log('Fehler beim Speichern des Platzes:', error.message);
  }
}

// Function to handle editing places
export async function handleEditPlace (platz) {
  const updatedName = prompt('Neuer Name:', platz.platzName)?.trim() || platz.platzName;

  let updatedZugang;
  do {
    updatedZugang = prompt('Zugang (öffentlich oder privat):', platz.zugang)?.trim().toLowerCase();
  } while (!['öffentlich', 'privat'].includes(updatedZugang));

  let updatedPublicAccess;
  do {
    updatedPublicAccess = prompt('Outdoor oder Indoor?:', platz.publicAccess)?.trim().toLowerCase();
  } while (!['outdoor', 'indoor'].includes(updatedPublicAccess));

  const updatedAnzahlFelder = parseInt(prompt('Anzahl der Spielfelder:', platz.anzahlFelder), 10);
  if (!Number.isInteger(updatedAnzahlFelder) || updatedAnzahlFelder <= 0) {
    return alert('Bitte eine gültige Anzahl eingeben!');
  }

  const updatedNotizen = prompt('Notizen (optional):', platz.notizen) || '';

  const updateConfirmed = confirm('Möchten Sie auch den Standort ändern?');
  const newCoords = updateConfirmed
    ? await new Promise(resolve => {
      alert('Klicken Sie auf die Karte, um einen neuen Standort auszuwählen.');
      map.once('click', e => resolve([e.latlng.lat, e.latlng.lng]));
    })
    : platz.coords;

  const updatedPlace = { platzName: updatedName, zugang: updatedZugang, publicAccess: updatedPublicAccess, anzahlFelder: updatedAnzahlFelder, coords: newCoords, notizen: updatedNotizen };

  try {
    const response = await fetch(`/api/places/${platz._id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedPlace)
    });

    if (!response.ok) throw new Error('Platz konnte nicht aktualisiert werden');
    alert('Platz erfolgreich aktualisiert!');
    ladePlatz();
  } catch (error) {
    console.error('Fehler beim Aktualisieren des Platzes:', error.message);
  }
}

// Function to delete a place
export async function handleDeletePlace (placeId) {
  if (!confirm('Sind Sie sicher, dass Sie diesen Platz löschen möchten?')) return;

  try {
    const response = await fetch(`/api/places/${placeId}`, { method: 'DELETE' });

    if (!response.ok) throw new Error('Fehler beim Löschen des Platzes');

    if (markers.has(placeId)) {
      map.removeLayer(markers.get(placeId));
      markers.delete(placeId);
    }

    document.querySelector(`#locationList li[data-id="${placeId}"]`)?.remove();
    alert('Platz erfolgreich gelöscht!');
  } catch (error) {
    console.error('Fehler beim Löschen des Platzes:', error.message);
  }
}

// Attach event listener for map clicks
map.on('click', handleMapClick);

// Load places on map
ladePlatz();
