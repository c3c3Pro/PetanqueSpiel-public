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
    const { matchDate, matchTime, players, score } = req.body;
    // Validierung: Prüfen, ob genau zwei Spieler vorhanden sind
    if (!Array.isArray(players) || players.length !== 2 || players.some(name => typeof name !== 'string' || name.trim() === '')) {
      return res.status(400).json({ message: '❌ Bitte geben Sie genau zwei Spielernamen ein, getrennt durch ein Komma.' });
    }
    // Validierung: matchTime (positive Zahl)
    if (typeof matchTime !== 'number' || matchTime < 0) {
      return res.status(400).json({ message: '❌ Die Spielzeit muss eine positive Zahl sein.' });
    }
    // Validierung: Prüfen, ob genau ein Score vorhanden sind
    if (!Array.isArray(score) || score.length !== 2 || score.some(num => typeof num !== 'number' || num < 0 || num>13)) {
      return res.status(400).json({ message: '❌ Das Score-Feld muss ein Array mit zwei Zahlen sein.' });
    }
     //matchDate zu Date Objekt konvertieren
     const formattedDate = new Date(matchDate);
     if (isNaN(formattedDate.getTime())) {
       return res.status(400).json({ message: '❌ Ungültiges Datum' });
     }
    //ueberprufe ob das Spiel schon verlaufen ist
    const completed = Math.max(...score) >= 13;

    const newGame = new Game({ matchDate: formattedDate, players, score, completed });
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
  
