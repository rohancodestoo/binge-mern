const Review = require('../models/Review');

// @desc   Create a review
// @route  POST /api/reviews
const createReview = async (req, res) => {
  const { tmdbId, movieTitle, posterPath, rating, content, containsSpoilers } = req.body;
  try {
    const existing = await Review.findOne({ user: req.user._id, tmdbId });
    if (existing) {
      return res.status(400).json({ message: 'You already reviewed this movie' });
    }
    const review = await Review.create({
      user: req.user._id,
      tmdbId,
      movieTitle,
      posterPath,
      rating,
      content,
      containsSpoilers,
    });
    await review.populate('user', 'username avatar');
    res.status(201).json(review);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc   Get all reviews for a movie
// @route  GET /api/reviews/movie/:tmdbId
const getReviewsByMovie = async (req, res) => {
  try {
    const reviews = await Review.find({ tmdbId: req.params.tmdbId })
      .populate('user', 'username avatar')
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc   Update a review
// @route  PUT /api/reviews/:id
const updateReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: 'Review not found' });
    if (review.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    if (review.isEdited) {
      return res.status(400).json({ message: 'Review can only be edited once' });
    }
    const { rating, content, containsSpoilers } = req.body;
    review.rating = rating ?? review.rating;
    review.content = content ?? review.content;
    review.containsSpoilers = containsSpoilers ?? review.containsSpoilers;
    review.isEdited = true;
    const updated = await review.save();
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc   Delete a review
// @route  DELETE /api/reviews/:id
const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: 'Review not found' });
    if (review.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    await review.deleteOne();
    res.json({ message: 'Review removed' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { createReview, getReviewsByMovie, updateReview, deleteReview };
