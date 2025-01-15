const matchForm = document.getElementById('matchForm');
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
});
