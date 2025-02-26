import mongoose from 'mongoose';

const PlaceSchema = new mongoose.Schema({
  platzName: { type: String, required: true },
  zugang: { type: String, required: true },
  publicAccess: { type: String, required: true },
  anzahlFelder: { type: Number, required: true },
  coords: { type: [Number], required: true,
    validate: {
      validator: function(v) {
        return v.length === 2 && !isNaN(v[0]) && !isNaN(v[1]); // Ensure it's an array of two numbers (lat, lng)
      },
      message: 'Coords must contain exactly two numbers (latitude and longitude).'
    }
   },
  notizen: { type: String },
});

export default mongoose.model('Place', PlaceSchema);