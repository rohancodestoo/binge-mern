const express = require('express');
const router = express.Router();
const { getPersonById } = require('../controllers/personController');

router.get('/:tmdbId', getPersonById);

module.exports = router;
