import express from 'express';
import { getPlaces, addPlace, updatePlace ,deletePlace } from '../controllers/placeController.mjs';

const router = express.Router();

router.get('/', getPlaces); // Orte abrufen
router.post('/', addPlace); // Orte speichern
router.put('/:id', updatePlace); //Orte aktualisieren
router.delete('/:id', deletePlace);  //Orte loeschen 

export default router;
