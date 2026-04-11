const express = require('express');
const router = express.Router();
const {
  createReview,
  getReviewsByMovie,
  updateReview,
  deleteReview,
} = require('../controllers/reviewController');
const { protect } = require('../middleware/auth');

router.post('/', protect, createReview);
router.get('/movie/:tmdbId', getReviewsByMovie);
router.put('/:id', protect, updateReview);
router.delete('/:id', protect, deleteReview);

module.exports = router;
