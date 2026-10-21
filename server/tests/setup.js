require('dotenv').config();
const mongoose = require('mongoose');

const getTestUri = () => {
  if (process.env.TEST_MONGO_URI) {
    return process.env.TEST_MONGO_URI;
  }
  const baseUri = process.env.MONGO_URI || 'mongodb://localhost:27017/binge';
  // Replace the database name with 'binge_test' to ensure complete test isolation
  return baseUri.replace(/\/([a-zA-Z0-9_-]+)(\?|$)/, '/binge_test$2');
};

beforeAll(async () => {
  const uri = getTestUri();
  process.env.JWT_SECRET = process.env.JWT_SECRET || 'test_jwt_secret';
  process.env.TMDB_API_KEY = process.env.TMDB_API_KEY || 'test_key';
  process.env.TMDB_BASE_URL = process.env.TMDB_BASE_URL || 'https://api.themoviedb.org/3';

  await mongoose.connect(uri);
});

afterAll(async () => {
  if (mongoose.connection.readyState !== 0) {
    // Drop the test database to leave no residue
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  }
});

afterEach(async () => {
  if (mongoose.connection.readyState !== 0) {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      await collections[key].deleteMany({});
    }
  }
});

