const express = require('express');
const router = express.Router();
const {
  getTrending,
  searchMovies,
  getMovieById,
  getPopular,
} = require('../controllers/movieController');

// Order matters: specific paths before dynamic params
router.get('/trending', getTrending);
router.get('/popular', getPopular);
router.get('/search', searchMovies);
router.get('/:tmdbId', getMovieById);

module.exports = router;
