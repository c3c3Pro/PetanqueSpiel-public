import mongoose from 'mongoose';

const GameSchema = new mongoose.Schema({
  matchDate: { type: Date, required: true },
  players: { type: [String], required: true },
  score: { type: [Number], required: true },
});

export default mongoose.model('Game', GameSchema);