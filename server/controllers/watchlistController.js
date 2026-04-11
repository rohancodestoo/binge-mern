const Watchlist = require('../models/Watchlist');

// @desc   Add movie to watchlist
// @route  POST /api/watchlist
const addToWatchlist = async (req, res) => {
  const { tmdbId, movieTitle, posterPath, releaseDate } = req.body;
  try {
    const existing = await Watchlist.findOne({ user: req.user._id, tmdbId });
    if (existing) {
      return res.status(400).json({ message: 'Movie already in watchlist' });
    }
    const item = await Watchlist.create({
      user: req.user._id,
      tmdbId,
      movieTitle,
      posterPath,
      releaseDate,
    });
    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc   Get user's watchlist
// @route  GET /api/watchlist
const getWatchlist = async (req, res) => {
  try {
    const items = await Watchlist.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc   Remove movie from watchlist
// @route  DELETE /api/watchlist/:tmdbId
const removeFromWatchlist = async (req, res) => {
  try {
    const item = await Watchlist.findOneAndDelete({
      user: req.user._id,
      tmdbId: req.params.tmdbId,
    });
    if (!item) return res.status(404).json({ message: 'Item not found in watchlist' });
    res.json({ message: 'Removed from watchlist' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { addToWatchlist, getWatchlist, removeFromWatchlist };
