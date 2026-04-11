const axios = require('axios');

const TMDB_BASE = process.env.TMDB_BASE_URL;
const TMDB_KEY = process.env.TMDB_API_KEY;

const tmdbGet = (path, params = {}) =>
  axios.get(`${TMDB_BASE}${path}`, {
    params: { api_key: TMDB_KEY, ...params },
    timeout: 10000,
  });

const tmdbError = (err, res, label) => {
  if (err.code === 'ECONNABORTED' || err.code === 'ECONNRESET' || err.code === 'ETIMEDOUT') {
    return res.status(503).json({
      message: `Cannot reach TMDB (network timeout). Check your internet connection or firewall.`,
      code: 'TMDB_UNREACHABLE',
    });
  }
  if (err.response?.status === 401) {
    return res.status(401).json({ message: 'Invalid TMDB API key', code: 'TMDB_AUTH' });
  }
  console.error(`[TMDB] ${label}:`, err.message);
  res.status(500).json({ message: `Failed to fetch ${label}` });
};

// @desc   Get person details along with their movies
// @route  GET /api/person/:tmdbId
const getPersonById = async (req, res) => {
  const { tmdbId } = req.params;
  try {
    const { data } = await tmdbGet(`/person/${tmdbId}`, {
      append_to_response: 'movie_credits',
    });
    res.json(data);
  } catch (err) {
    tmdbError(err, res, 'person details');
  }
};

module.exports = { getPersonById };
