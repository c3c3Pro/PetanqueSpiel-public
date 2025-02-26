/* global L, alert */
// Initialize the map
export const map = L.map('map').setView([51.1657, 10.4515], 6); // Germany coordinates
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap contributors'
}).addTo(map);

export const markers = new Map();

// Function to check if the location is in Germany
export async function isGermany (lat, lng) {
  const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Server status ${response.status}`);
    }
    const data = await response.json();

    return data.address && data.address.country === 'Germany';
  } catch (error) {
    console.warn('Der Bereich ist ausserhalb von Deutschland: ', error);
    return false;
  }
}

// Function to add a place marker on the map
export async function addMarker (platz) {
  if (!platz || !platz.coords || platz.coords.length !== 2) {
    console.error('Ungueltige Platzdaten: ', platz);
    alert('Fehler: ungueltige Platzdaten.');
    return;
  }

  const key = platz._id; // Use the place's unique ID as the key

  if (markers.has(key)) {
    console.log(`Marker with ID ${key} already exists. Skipping.`);
    return;
  }

  const inGermany = await isGermany(platz.coords[0], platz.coords[1]);
  if (!inGermany) {
    alert('Dieser Ort liegt ausserhalb von Deutschland');
    return;
  }

  const popupContent = document.createElement('div');
  popupContent.innerHTML = `
    <b>${platz.platzName}</b><br>
    Zugang: ${platz.zugang}<br>
    Typ: ${platz.publicAccess}<br>
    Feld: ${platz.anzahlFelder}<br>
    Notizen: ${platz.notizen || 'Keine'}
  `;

  // Add the three-dot menu
  const menuButton = document.createElement('span');
  menuButton.className = 'menu-button';
  menuButton.style.float = 'right';
  menuButton.style.cursor = 'pointer';
  menuButton.innerHTML = '&#x22EE;';

  menuButton.addEventListener('click', (event) => {
    event.stopPropagation(); // Prevent the event from reaching the marker
    showMenu(platz, key, event);
  });

  popupContent.appendChild(menuButton);

  try {
    const marker = L.marker(platz.coords).addTo(map).bindPopup(popupContent);
    markers.set(key, marker);

    // Ensure the popup opens on marker click
    marker.on('click', () => {
      marker.openPopup();
    });

    console.log('Popup content:', popupContent.innerHTML);
    console.log('Marker created at:', platz.coords);
    return marker;
  } catch (err) {
    console.error('Error creating marker:', err);
    return null;
  }
}

// Function to remove a marker
export function removeMarker (key) {
  if (markers.has(key)) {
    const marker = markers.get(key);
    if (marker) {
      map.removeLayer(marker);
    }
    markers.delete(key);
  } else {
    console.warn('Kein Marker gefunden für diesen Key:', key);
  }
}

// Function to show the edit/delete menu
function showMenu (platz, key, event) {
  event.stopPropagation();

  const menu = document.createElement('div');
  menu.style.position = 'absolute';
  menu.style.background = 'white';
  menu.style.border = '1px solid #ccc';
  menu.style.padding = '10px';
  menu.style.borderRadius = '6px';
  menu.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
  menu.style.zIndex = '1000';
  menu.style.left = `${event.pageX}px`;
  menu.style.top = `${event.pageY}px`;

  // Create the edit button
  const editButton = document.createElement('button');
  editButton.id = `edit-${key}`;
  editButton.textContent = 'Bearbeiten';
  editButton.className = 'btn edit-btn'; // Apply the edit button class
  editButton.style.marginRight = '10px'; // Add spacing between buttons

  // Create the delete button
  const deleteButton = document.createElement('button');
  deleteButton.id = `delete-${key}`;
  deleteButton.textContent = 'Löschen';
  deleteButton.className = 'btn delete-btn'; // Apply the delete button class

  // Append buttons to the menu
  menu.appendChild(editButton);
  menu.appendChild(deleteButton);

  document.body.appendChild(menu);

  document.getElementById(`edit-${key}`).addEventListener('click', () => {
    // Dispatch event for editing - only places.mjs will handle this
    const event = new CustomEvent('editPlace', { detail: platz });
    document.dispatchEvent(event);
    document.body.removeChild(menu);
  });

  document.getElementById(`delete-${key}`).addEventListener('click', () => {
    // Dispatch event for deletion - only places.mjs will handle this
    const event = new CustomEvent('deletePlace', { detail: key });
    document.dispatchEvent(event);
    document.body.removeChild(menu);
  });

  document.addEventListener('click', (e) => {
    if (!menu.contains(e.target)) {
      document.body.removeChild(menu);
    }
  }, { once: true });
}

// Function to update marker content
export function updateMarker (platz) {
  const key = platz._id;
  const marker = markers.get(key);

  if (marker) {
    const popupContent = document.createElement('div');
    popupContent.innerHTML = `
      <b>${platz.platzName}</b><br>
      Zugang: ${platz.zugang}<br>
      Typ: ${platz.publicAccess}<br>
      Feld: ${platz.anzahlFelder}<br>
      Notizen: ${platz.notizen || 'Keine'}
    `;

    // Add the three-dot menu again
    const menuButton = document.createElement('span');
    menuButton.className = 'menu-button';
    menuButton.style.float = 'right';
    menuButton.style.cursor = 'pointer';
    menuButton.innerHTML = '&#x22EE;';

    menuButton.addEventListener('click', (event) => {
      event.stopPropagation();
      showMenu(platz, key, event);
    });

    popupContent.appendChild(menuButton);
    marker.setPopupContent(popupContent);
  } else {
    console.warn('Marker not found for key:', key);
  }
}
