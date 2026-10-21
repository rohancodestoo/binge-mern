/**
 * Returns the Express app without calling listen() or connectDB().
 * Test setup.js handles the in-memory MongoDB connection.
 */
const express = require('express');
const cors = require('cors');

const createApp = () => {
  const app = express();

  app.use(cors());
  app.use(express.json());

  // Routes
  app.use('/api/auth', require('../routes/auth'));
  app.use('/api/movies', require('../routes/movies'));
  app.use('/api/reviews', require('../routes/reviews'));
  app.use('/api/watchlist', require('../routes/watchlist'));
  app.use('/api/diary', require('../routes/diary'));
  app.use('/api/users', require('../routes/users'));
  app.use('/api/person', require('../routes/person'));
  app.use('/api/admin', require('../routes/admin'));

  app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

  // 404 fallback
  app.use((req, res) => res.status(404).json({ message: 'Route not found' }));

  // Global error handler
  app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Internal server error' });
  });

  return app;
};

module.exports = createApp;
