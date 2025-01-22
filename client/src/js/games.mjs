/* const matchForm = document.getElementById('matchForm');
const matchList = document.getElementById('matchList');
// managing match events
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
}); */
//function for fetching data from backend
export async function fetchGames() {
  try {
    const response = await fetch('/api/partien');
    if (!response.ok) throw new Error('Fehler beim Laden der Partien');
    return await response.json();
  } catch (error) {
    console.error(error);
    return [];
  }
}
//function for adding games
export async function addGame(game) {
  try {
    const response = await fetch('/api/partien', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(game),
    });
    if (!response.ok) throw new Error('Fehler beim Speichern der Partie');
    return await response.json();
  } catch (error) {
    console.error(error);
  }
}
//function for deleting games
export async function deleteGame(gameId) {
  if (!confirm('Möchten Sie diese Partie wirklich löschen?')) return;
  
  try {
    const response = await fetch(`/api/partien/${gameId}`, { method: 'DELETE' });
    if (!response.ok) throw new Error('Fehler beim Löschen der Partie');
    console.log('Partie gelöscht.');
  } catch (error) {
    console.error(error);
  }
}
