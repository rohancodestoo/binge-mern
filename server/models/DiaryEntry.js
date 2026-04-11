const mongoose = require('mongoose');

const diaryEntrySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    tmdbId: { type: Number, required: true },
    movieTitle: { type: String, required: true },
    posterPath: { type: String, default: '' },
    watchedOn: { type: Date, default: Date.now },
    rating: { type: Number, min: 0, max: 5, default: null },
    review: { type: String, default: '', maxlength: 2000 },
    rewatch: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('DiaryEntry', diaryEntrySchema);
