const User = require('../models/User');
const Review = require('../models/Review');
const DiaryEntry = require('../models/DiaryEntry');
const Watchlist = require('../models/Watchlist');

// @desc   Get all users
// @route  GET /api/admin/users
const getUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc   Delete a user
// @route  DELETE /api/admin/users/:id
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    // Prevent an admin from deleting themselves (optional but good practice)
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot delete yourself' });
    }
    
    // Clean up all related data
    await Promise.all([
      Review.deleteMany({ user: user._id }),
      DiaryEntry.deleteMany({ user: user._id }),
      Watchlist.deleteMany({ user: user._id }),
      User.updateMany(
        { followers: user._id },
        { $pull: { followers: user._id } }
      ),
      User.updateMany(
        { following: user._id },
        { $pull: { following: user._id } }
      ),
    ]);

    await user.deleteOne();
    res.json({ message: 'User removed' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getUsers, deleteUser };
