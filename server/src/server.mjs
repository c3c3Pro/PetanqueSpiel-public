// server.js - Hauptserverdatei
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import gameRoutes from './routes/gameRoutes.mjs';
import placeRoutes from './routes/placeRoutes.mjs';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;
const MONGO_URI = 'mongodb://127.0.0.1:27017/petanque';

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Verbindung ohne veraltete Optionen
mongoose.connect(MONGO_URI)
  .then(() => console.log('MongoDB verbunden'))
  .catch(err => console.error('MongoDB Fehler:', err));

// __dirname für ES-Module erhalten
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Statische Dateien bereitstellen
app.use(express.static(path.join(__dirname, '../../dist')));

// Routen
app.use('/api/games', gameRoutes);
app.use('/api/places', placeRoutes);

// Hauptseite anzeigen
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../../dist/index.html'));
});

// Server starten
app.listen(PORT, () => {
  console.log(`Server läuft auf Port ${PORT}`);
});
