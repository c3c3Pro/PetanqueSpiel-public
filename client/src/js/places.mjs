/* global prompt, alert */
import { map, isGermany, addMarker } from './map.mjs';

// Function to load places from backend and add them to the map
export async function ladePlatz () {
  try {
    const response = await fetch('/api/plaetze');
    if (!response.ok) throw new Error('Plaetze konnten nicht geladen werden');
    const plaetzen = await response.json();

    plaetzen.forEach((platz) => addMarker(platz));
  } catch (error) {
    console.error('Fehler beim Aufruf des Ortes');
  }
}

// Function to handle adding a new place
async function handleMapClick (e) {
  const { lat, lng } = e.latlng;
  const inGermany = await isGermany(lat, lng);
  if (!inGermany) {
    alert('Dieser Ort liegt ausserhalb Deutschlands. Bitte waehlen Sie eine deutsche Position aus!');
    return;
  }

  const platzName = prompt('den Name eintragen: ');
  if (!platzName) return;

  const zugang = prompt('den Zugang eintragen (oeffentlich oder privat): ');
  if (!zugang) return;

  const publicAccess = prompt('Outdoor oder Indoor?:');
  if (!publicAccess) return;

  const anzahlFelder = prompt('Die Anzahl der Spielfelder eintragen: ');
  if (!anzahlFelder || isNaN(anzahlFelder)) {
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
  } catch (error) {
    console.log('Fehler beim Speichern des Platzes');
  }
}

// Attach event listener for map clicks
map.on('click', handleMapClick);

// Load places on map
ladePlatz();
