const mongoose = require('mongoose');

// Lightweight local cache of TMDB movie data
const movieSchema = new mongoose.Schema(
  {
    tmdbId: {
      type: Number,
      required: true,
      unique: true,
    },
    title: { type: String, required: true },
    overview: { type: String, default: '' },
    posterPath: { type: String, default: '' },
    backdropPath: { type: String, default: '' },
    releaseDate: { type: String, default: '' },
    genres: [{ id: Number, name: String }],
    voteAverage: { type: Number, default: 0 },
    runtime: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Movie', movieSchema);
