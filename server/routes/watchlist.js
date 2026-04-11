const express = require('express');
const router = express.Router();
const {
  addToWatchlist,
  getWatchlist,
  removeFromWatchlist,
} = require('../controllers/watchlistController');
const { protect } = require('../middleware/auth');

router.use(protect); // All watchlist routes require auth

router.post('/', addToWatchlist);
router.get('/', getWatchlist);
router.delete('/:tmdbId', removeFromWatchlist);

module.exports = router;
