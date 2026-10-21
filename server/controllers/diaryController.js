const DiaryEntry = require('../models/DiaryEntry');

// @desc   Log a watch entry
// @route  POST /api/diary
const createEntry = async (req, res) => {
  const { tmdbId, movieTitle, posterPath, watchedOn, rating, review, rewatch, releaseDate } = req.body;
  try {
    if (watchedOn) {
      const watchDate = new Date(watchedOn);
      const today = new Date();
      if (watchDate > today) {
        return res.status(400).json({ message: 'Watch date cannot be in the future' });
      }
      if (releaseDate && watchDate < new Date(releaseDate)) {
        return res.status(400).json({ message: 'Watch date cannot be earlier than release date' });
      }
    }
    const entry = await DiaryEntry.create({
      user: req.user._id,
      tmdbId,
      movieTitle,
      posterPath,
      watchedOn,
      rating,
      review,
      rewatch,
    });
    res.status(201).json(entry);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc   Get diary entries
// @route  GET /api/diary
const getEntries = async (req, res) => {
  try {
    const entries = await DiaryEntry.find({ user: req.user._id }).sort({ watchedOn: -1 });
    res.json(entries);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc   Update diary entry
// @route  PUT /api/diary/:id
const updateEntry = async (req, res) => {
  try {
    const entry = await DiaryEntry.findById(req.params.id);
    if (!entry) return res.status(404).json({ message: 'Entry not found' });
    if (entry.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    const { watchedOn, rating, review, rewatch, releaseDate, posterPath, movieTitle } = req.body;

    if (watchedOn) {
      const watchDate = new Date(watchedOn);
      const today = new Date();
      if (watchDate > today) {
        return res.status(400).json({ message: 'Watch date cannot be in the future' });
      }
      if (releaseDate && watchDate < new Date(releaseDate)) {
        return res.status(400).json({ message: 'Watch date cannot be earlier than release date' });
      }
      entry.watchedOn = watchedOn;
    }

    if (rating !== undefined) entry.rating = rating;
    if (review !== undefined) entry.review = review;
    if (rewatch !== undefined) entry.rewatch = rewatch;
    if (posterPath !== undefined) entry.posterPath = posterPath;
    if (movieTitle !== undefined) entry.movieTitle = movieTitle;

    const updated = await entry.save();
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc   Delete diary entry
// @route  DELETE /api/diary/:id
const deleteEntry = async (req, res) => {
  try {
    const entry = await DiaryEntry.findById(req.params.id);
    if (!entry) return res.status(404).json({ message: 'Entry not found' });
    if (entry.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    await entry.deleteOne();
    res.json({ message: 'Entry deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { createEntry, getEntries, updateEntry, deleteEntry };
