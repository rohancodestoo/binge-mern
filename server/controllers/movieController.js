const axios = require('axios');

const TMDB_BASE = process.env.TMDB_BASE_URL;
const TMDB_KEY = process.env.TMDB_API_KEY;

const tmdbGet = (path, params = {}) =>
  axios.get(`${TMDB_BASE}${path}`, {
    params: { api_key: TMDB_KEY, ...params },
    timeout: 10000, // fail fast after 10s
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

// @desc   Get trending movies
// @route  GET /api/movies/trending
const getTrending = async (req, res) => {
  try {
    const { data } = await tmdbGet('/trending/movie/week');
    res.json(data);
  } catch (err) {
    tmdbError(err, res, 'trending movies');
  }
};

// @desc   Search movies
// @route  GET /api/movies/search?q=
const searchMovies = async (req, res) => {
  const { q, page = 1 } = req.query;
  if (!q) return res.status(400).json({ message: 'Query parameter q is required' });
  try {
    const { data } = await tmdbGet('/search/movie', { query: q, page });
    res.json(data);
  } catch (err) {
    tmdbError(err, res, 'search results');
  }
};

// @desc   Get movie details
// @route  GET /api/movies/:tmdbId
const getMovieById = async (req, res) => {
  const { tmdbId } = req.params;
  try {
    const { data } = await tmdbGet(`/movie/${tmdbId}`, {
      append_to_response: 'credits,videos,similar',
    });
    res.json(data);
  } catch (err) {
    tmdbError(err, res, 'movie details');
  }
};

// @desc   Get popular movies
// @route  GET /api/movies/popular
const getPopular = async (req, res) => {
  const { page = 1 } = req.query;
  try {
    const { data } = await tmdbGet('/movie/popular', { page });
    res.json(data);
  } catch (err) {
    tmdbError(err, res, 'popular movies');
  }
};

module.exports = { getTrending, searchMovies, getMovieById, getPopular };
