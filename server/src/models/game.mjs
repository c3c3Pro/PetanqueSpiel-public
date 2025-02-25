import mongoose from 'mongoose';

const GameSchema = new mongoose.Schema({
  matchDate: { type: Date, required: true },
  matchTime: { type: String, required: false },
  players: {
    type: [String],
    required: true,
    validate: {
      validator: function (players) {
        return Array.isArray(players) && players.length === 2 && players.every(name => typeof name === 'string' && name.trim() !== '');
      },
      message: 'Es müssen genau zwei Spielernamen angegeben werden.'
    }
  },
  score: {
    type: [Number],
    required: true,
    validate: {
      validator: function (score) {
        return (
          Array.isArray(score) &&
          score.length === 2 &&
          score.every(num => Number.isInteger(num) && num >= 0 && num <= 13)
        );
      },
      message: 'Das Score-Feld muss genau zwei Zahlen (0-13) enthalten, getrennt durch ":".'
    }
  }
});

export default mongoose.model('Game', GameSchema);
