const express = require('express');
const router = express.Router();
const {
  getUserProfile,
  followUser,
  unfollowUser,
  getUserReviews,
  updateProfile,
} = require('../controllers/userController');
const { protect } = require('../middleware/auth');

router.put('/profile', protect, updateProfile);
router.get('/:username', getUserProfile);
router.get('/:username/reviews', getUserReviews);
router.post('/:username/follow', protect, followUser);
router.delete('/:username/follow', protect, unfollowUser);

module.exports = router;
