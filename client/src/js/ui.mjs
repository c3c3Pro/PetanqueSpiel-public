import { fetchGames, deleteGame } from './games.mjs';

export function updateGameList(games) {
  const gameContainer = document.getElementById('gameList');
  gameContainer.innerHTML = '';

  games.forEach((game) => {
    const gameItem = document.createElement('div');
    gameItem.classList.add('game-item');
    gameItem.innerHTML = `
      <b>${game.date}</b><br>
      Spieler: ${game.players}<br>
      Punkte: ${game.scoreHistory.join(' - ')}<br>
      <button onclick="deleteGame(${game.id})">Löschen</button>
    `;
    gameContainer.appendChild(gameItem);
  });
}