import Place from '../models/place.mjs';

export const getPlaces = async (req, res) => {
  try {
    const places = await Place.find();
    res.json(places);
  } catch (error) {
    console.error('Fehler beim Abrufen der Plätze:', error);
    res.status(500).json({ message: 'Fehler beim Abrufen der Plätze' });
  }
};

export const addPlace = async (req, res) => {
  try {
    const newPlace = new Place(req.body);
    await newPlace.save();
    res.status(201).json(newPlace);
  } catch (error) {
    console.error('Fehler beim Speichern des Platzes:', error);
    res.status(400).json({ message: 'Fehler beim Speichern des Platzes' });
  }
};
