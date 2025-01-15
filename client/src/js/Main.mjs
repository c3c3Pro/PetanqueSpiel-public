// Initialize the map
const map = L.map('map').setView([51.1657, 10.4515], 6); // Germany coordinates
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

// Add Pétanque locations
const petanqueLocations = [
    { name: 'Berlin', coords: [52.5200, 13.4050] },
    { name: 'Munich', coords: [48.1351, 11.5820] },
    { name: 'Hamburg', coords: [53.5511, 9.9937] }
];

petanqueLocations.forEach(location => {
    L.marker(location.coords)
        .addTo(map)
        .bindPopup(`<b>${location.name}</b><br>Pétanque Platz`)
        .openPopup();
});

const matchForm = document.getElementById('matchForm');
const matchList = document.getElementById('matchList');
//managing match events
matchForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const matchDate = document.getElementById('matchDate').value;
    const players = document.getElementById('players').value;
    const score = document.getElementById('score').value;

    const newMatch = document.createElement('div');
    newMatch.textContent = `${matchDate} - ${players} - ${score}`;
    matchList.appendChild(newMatch);

    // Reset the form
    matchForm.reset();
});