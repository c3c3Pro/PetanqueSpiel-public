import express from 'express';
import { getPlaces, addPlace } from '../controllers/placeController.mjs';

const router = express.Router();

router.get('/', getPlaces); // Orte abrufen
router.post('/', addPlace); // Orte speichern

export default router;
