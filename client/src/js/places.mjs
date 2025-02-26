/* global prompt, alert, confirm */
import { map, isGermany, markers, addMarker, removeMarker, updateMarker } from './map.mjs';

// Function to update the UI with places
export function renderPlaces (places) {
  const placesList = document.getElementById('locationList');
  if (!placesList) return;

  placesList.innerHTML = ''; // Clear existing list

  places.forEach(platz => {
    const item = document.createElement('li');
    item.setAttribute('data-id', platz._id); // Add data-id attribute for easier deletion
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
  if (!map) {
    console.error('Map object is not initialized');
    return;
  }

  map.off('click', handleMapClick); // Ensure handleMapClick is defined
  try {
    document.getElementById('loadingIndicator')?.classList.remove('hidden'); // Show loading

    const places = await fetchPlaces();
    markers.forEach((marker, key) => {
      map.removeLayer(marker);
    });
    markers.clear();

    // Use for...of for async operations instead of forEach
    for (const place of places) {
      try {
        const marker = await addMarker(place); // Ensure addMarker is valid

        if (marker) {
          console.log('✅ Marker added successfully for:', place.platzName);
        } else {
          console.error('❌ Failed to add marker for:', place.platzName);
        }
      } catch (err) {
        console.error('Error adding marker for place:', place, err);
      }
    }

    renderPlaces(places);
  } catch (error) {
    console.error('Fehler beim Laden der Orte:', error.message);
  } finally {
    map.on('click', handleMapClick); // Ensure this works
    document.getElementById('loadingIndicator')?.classList.add('hidden'); // Hide loading
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

  try {
    const response = await fetch('/api/places', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(neuerPlatz)
    });

    if (!response.ok) throw new Error('Plätze konnten nicht gespeichert werden');

    const savedPlace = await response.json();
    await addMarker(savedPlace);

    console.log('Platz erfolgreich gespeichert');
    // Refresh the place list instead of reloading all markers
    const places = await fetchPlaces();
    renderPlaces(places);
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

  const updatedPlace = {
    ...platz, // Keep the original _id and other properties
    platzName: updatedName,
    zugang: updatedZugang,
    publicAccess: updatedPublicAccess,
    anzahlFelder: updatedAnzahlFelder,
    notizen: updatedNotizen
  };

  try {
    const response = await fetch(`/api/places/${platz._id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedPlace)
    });

    if (!response.ok) throw new Error('Platz konnte nicht aktualisiert werden');

    // Update marker in place instead of removing and re-adding
    updateMarker(updatedPlace);

    alert('Platz erfolgreich aktualisiert!');

    // Only update the places list without reloading all markers
    const places = await fetchPlaces();
    renderPlaces(places);
  } catch (error) {
    console.error('Fehler beim Aktualisieren des Platzes:', error.message);
  }
}

// Function to delete a place
export async function handleDeletePlace (placeId) {
  if (!confirm('Sind Sie sicher, dass Sie diesen Platz löschen möchten?')) return;

  try {
    const response = await fetch(`/api/places/${placeId}`, {
      method: 'DELETE',
      // Add headers to ensure the request is properly processed
      headers: { 'Content-Type': 'application/json' }
    });

    if (!response.ok) {
      console.error('Server response:', response.status, response.statusText);
      throw new Error('Fehler beim Löschen des Platzes');
    }

    // Remove the marker from the map
    removeMarker(placeId);

    // Remove the item from the list
    document.querySelector(`#locationList li[data-id="${placeId}"]`)?.remove();

    alert('Platz erfolgreich gelöscht!');
  } catch (error) {
    console.error('Fehler beim Löschen des Platzes:', error.message);
    alert('Fehler beim Löschen: ' + error.message);
  }
}

// Listen for custom events from map.mjs
document.addEventListener('editPlace', (event) => {
  handleEditPlace(event.detail);
});

document.addEventListener('deletePlace', (event) => {
  handleDeletePlace(event.detail);
});

// Attach event listener for map clicks
map.on('click', handleMapClick);

// Load places on map
ladePlatz();
