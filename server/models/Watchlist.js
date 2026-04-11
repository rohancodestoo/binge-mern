const mongoose = require('mongoose');

const watchlistSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    tmdbId: { type: Number, required: true },
    movieTitle: { type: String, required: true },
    posterPath: { type: String, default: '' },
    releaseDate: { type: String, default: '' },
  },
  { timestamps: true }
);

// Each movie can only appear once per user's watchlist
watchlistSchema.index({ user: 1, tmdbId: 1 }, { unique: true });

module.exports = mongoose.model('Watchlist', watchlistSchema);
