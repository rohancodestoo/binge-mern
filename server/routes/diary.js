const express = require('express');
const router = express.Router();
const {
  createEntry,
  getEntries,
  updateEntry,
  deleteEntry,
} = require('../controllers/diaryController');
const { protect } = require('../middleware/auth');

router.use(protect); // All diary routes require auth

router.post('/', createEntry);
router.get('/', getEntries);
router.put('/:id', updateEntry);
router.delete('/:id', deleteEntry);

module.exports = router;
