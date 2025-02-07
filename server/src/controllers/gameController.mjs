import Game from '../models/game.mjs';

export const getGames = async (req, res) => {
  try {
    const games = await Game.find();
    res.json(games);
  } catch (error) {
    res.status(500).json({ message: 'Fehler beim Abrufen der Spiele' });
  }
};

export const addGame = async (req, res) => {
  try {
    const newGame = new Game(req.body);
    await newGame.save();
    res.status(201).json(newGame);
  } catch (error) {
    res.status(400).json({ message: 'Fehler beim Speichern des Spiels' });
  }
};

export const deleteGame = async (req, res) => {
    try {
      await Game.findByIdAndDelete(req.params.id);
      res.json({ message: 'Spiel gelöscht' });
    } catch (error) {
      res.status(500).json({ message: 'Fehler beim Löschen des Spiels' });
    }
  };
  
