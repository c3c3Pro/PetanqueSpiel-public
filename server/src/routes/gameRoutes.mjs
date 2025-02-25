import express from 'express';
import Game from '../models/game.mjs'; // ✅ Korrekte Importierung
import { getGames, addGame, deleteGame } from '../controllers/gameController.mjs';

const router = express.Router();

router.get('/', getGames);
router.get('/:id', async (req, res) => {
    console.log("🔍 Abruf von Spiel-ID:", req.params.id); // Debugging
    try {
      const game = await Game.findById(req.params.id);
      if (!game) {
        console.log("❌ Spiel nicht gefunden:", req.params.id);
        return res.status(404).json({ message: 'Spiel nicht gefunden' });
      }
      res.json(game);
    } catch (error) {
      console.error("⚠️ Fehler beim Abrufen des Spiels:", error);
      res.status(500).json({ message: 'Fehler beim Abrufen des Spiels' });
    }
  });
  
  router.put('/:id', async (req, res) => {
    try {
      console.log("🛠️ Update-Anfrage für Spiel-ID:", req.params.id); // Debugging
      console.log("📥 Erhaltene Daten:", req.body); // Debugging
  
      const updatedGame = await Game.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
      );
  
      if (!updatedGame) {
        console.log("❌ Spiel nicht gefunden:", req.params.id);
        return res.status(404).json({ message: 'Spiel nicht gefunden' });
      }
  
      console.log("✅ Spiel erfolgreich aktualisiert:", updatedGame);
      res.json(updatedGame);
    } catch (error) {
      console.error("⚠️ Fehler beim Aktualisieren des Spiels:", error);
      res.status(500).json({ message: 'Fehler beim Aktualisieren des Spiels' });
    }
  });
  
router.post('/', addGame);
router.delete('/:id', deleteGame);

export default router;
