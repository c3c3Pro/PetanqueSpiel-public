import Game from '../models/game.mjs';

export const getGames = async (req, res) => {
  try {
    const games = await Game.find();

    // Formatierung von matchDate für das Frontend mit +1 Tag Korrektur
    const formattedGames = games.map(game => {
      const correctDate = new Date(game.matchDate);
      correctDate.setDate(correctDate.getDate() + 1); // 🔥 +1 Tag hinzufügen

      return {
        ...game._doc, // Alle anderen Felder übernehmen
        matchDate: correctDate.toISOString().split('T')[0] // "YYYY-MM-DD"
      };
    });

    res.json(formattedGames);
  } catch (error) {
    res.status(500).json({ message: 'Fehler beim Abrufen der Spiele' });
  }
};


export const addGame = async (req, res) => {
  try {
    console.log("Anfrage erhalten:", req.body); // Debugging-Ausgabe
    const { matchDate, matchTime, players, score } = req.body;

    // Validierung: Spieler überprüfen
    if (!Array.isArray(players) || players.length !== 2 || players.some(name => typeof name !== 'string' || name.trim() === '')) {
      console.log("Spieler-Fehler:", players);
      return res.status(400).json({ message: '❌ Bitte geben Sie genau zwei Spielernamen ein, getrennt durch ein Komma.' });
    }

    // Validierung: Datum überprüfen
    const formattedDate = new Date(matchDate);
    formattedDate.setUTCHours(0, 0, 0, 0); // Stellt sicher, dass das Datum nicht durch die Zeitzone verschoben wird
        if (isNaN(formattedDate.getTime())) {
      console.log("Ungültiges Datum:", matchDate);
      return res.status(400).json({ message: '❌ Ungültiges Datum' });
    }

    // Validierung: Punktestand prüfen
    if (!Array.isArray(score) || score.length !== 2 || score.some(num => typeof num !== 'number' || num < 0 || num > 13)) {
      console.log("Score-Fehler:", score);
      return res.status(400).json({ message: '❌ Das Score-Feld muss genau zwei Zahlen (0-13) enthalten.' });
    }

    const newGame = new Game({ matchDate: formattedDate, matchTime, players, score });
    await newGame.save();
    res.status(201).json(newGame);
  } catch (error) {
    console.error("Fehler beim Speichern des Spiels:", error);
    res.status(500).json({ message: '❌ Fehler beim Speichern des Spiels' });
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
  
