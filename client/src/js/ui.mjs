import { fetchGames, deleteGame } from './games.mjs';// used to refresh the game list

export function updateGameList (games) {
  const gameContainer = document.getElementById('gameList');
  gameContainer.innerHTML = '';

  games.forEach((game) => {
    // iterates over the game array
    // and creates a new div element for each game and assigns it in the class game-item
    const gameItem = document.createElement('div');
    gameItem.classList.add('game-item');

    gameItem.innerHTML = `
    <b>${game.date}</b><br>
    Spieler: ${game.players}<br>
    Punkte: ${game.ScoreHistory.join(' - ')}
    `;
    // for handling delete button
    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Löschen';
    deleteButton.addEventListener('click', async () => {
      await deleteGame(game.id); // Call the imported delete function
      updateGameList(await fetchGames()); // Refresh the UI after deletion
    });

    gameItem.appendChild(deleteButton);
    // adds newly created div class with game details and the delete button to the #gamelist container
    gameContainer.appendChild(gameItem);
  });
}
