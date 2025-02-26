import Place from '../models/place.mjs';

export const getPlaces = async (req, res) => {
  try {
    const places = await Place.find();
    console.log('📌 Retrieved places:', places);  // Debugging
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
//function to support handleEditPlace from frontend
export const updatePlace = async (req, res) => {
  try {
    console.log('Request Body:', req.body);
    const { id } = req.params;
    const updatedPlace = await Place.findByIdAndUpdate(id, req.body, { new: true });

    if (!updatedPlace) {
      return res.status(404).json({ message: 'Platz nicht gefunden' });
    }

    res.json(updatedPlace);
  } catch (error) {
    console.error('Fehler beim Aktualisieren des Platzes:', error);
    res.status(500).json({ message: 'Fehler beim Aktualisieren des Platzes' });
  }
};
//added delete place function
export const deletePlace = async (req, res) => {
  try{
    const { id } = req.params;
    await Place.findByIdAndDelete(id);
    res.json({ message: 'Platz geloescht'}); 
  } catch (error){
    console.error('Fehler beim Loeschen des Platzes', error);
    res.status(500).json({message: 'Fehler beim Loeschen des Platzes'});
  }
};