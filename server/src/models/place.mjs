import mongoose from 'mongoose';

const PlaceSchema = new mongoose.Schema({
  platzName: { type: String, required: true },
  zugang: { type: String, required: true },
  publicAccess: { type: String, required: true },
  anzahlFelder: { type: Number, required: true },
  coords: { type: [Number], required: true },
  notizen: { type: String },
});

export default mongoose.model('Place', PlaceSchema);