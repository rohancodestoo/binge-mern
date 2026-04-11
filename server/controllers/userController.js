const User = require('../models/User');
const Review = require('../models/Review');

// @desc   Get user profile
// @route  GET /api/users/:username
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username })
      .select('-password')
      .populate('followers', 'username avatar')
      .populate('following', 'username avatar');
    if (!user) return res.status(404).json({ message: 'User not found' });
    const reviewCount = await Review.countDocuments({ user: user._id });
    res.json({ ...user.toObject(), reviewCount });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc   Follow a user
// @route  POST /api/users/:username/follow
const followUser = async (req, res) => {
  try {
    const target = await User.findOne({ username: req.params.username });
    if (!target) return res.status(404).json({ message: 'User not found' });
    if (target._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot follow yourself' });
    }
    if (target.followers.includes(req.user._id)) {
      return res.status(400).json({ message: 'Already following' });
    }
    target.followers.push(req.user._id);
    await target.save();
    await User.findByIdAndUpdate(req.user._id, {
      $addToSet: { following: target._id },
    });
    res.json({ message: `Now following ${target.username}` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc   Unfollow a user
// @route  DELETE /api/users/:username/follow
const unfollowUser = async (req, res) => {
  try {
    const target = await User.findOne({ username: req.params.username });
    if (!target) return res.status(404).json({ message: 'User not found' });
    target.followers = target.followers.filter(
      (id) => id.toString() !== req.user._id.toString()
    );
    await target.save();
    await User.findByIdAndUpdate(req.user._id, {
      $pull: { following: target._id },
    });
    res.json({ message: `Unfollowed ${target.username}` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc   Get user's reviews
// @route  GET /api/users/:username/reviews
const getUserReviews = async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username });
    if (!user) return res.status(404).json({ message: 'User not found' });
    const reviews = await Review.find({ user: user._id }).sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getUserProfile, followUser, unfollowUser, getUserReviews };
