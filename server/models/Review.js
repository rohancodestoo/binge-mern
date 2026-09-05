const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    tmdbId: { type: Number, required: true },
    movieTitle: { type: String, required: true },
    posterPath: { type: String, default: '' },
    rating: { type: Number, min: 0.5, max: 5, required: true },
    content: { type: String, default: '', maxlength: 5000 },
    containsSpoilers: { type: Boolean, default: false },
    isEdited: { type: Boolean, default: false },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true }
);

// A user can only have one review per movie
reviewSchema.index({ user: 1, tmdbId: 1 }, { unique: true });

module.exports = mongoose.model('Review', reviewSchema);
