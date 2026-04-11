import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Discover from './pages/Discover';
import MovieDetails from './pages/MovieDetails';
import Profile from './pages/Profile';
import Diary from './pages/Diary';
import Watchlist from './pages/Watchlist';
import Login from './pages/Login';
import Register from './pages/Register';
import PersonDetails from './pages/PersonDetails';

const App = () => (
  <>
    <Navbar />
    <Routes>
      <Route path="/"                  element={<Home />} />
      <Route path="/discover"          element={<Discover />} />
      <Route path="/movies/:tmdbId"    element={<MovieDetails />} />
      <Route path="/users/:username"   element={<Profile />} />
      <Route path="/diary"             element={<Diary />} />
      <Route path="/watchlist"         element={<Watchlist />} />
      <Route path="/login"             element={<Login />} />
      <Route path="/register"          element={<Register />} />
      <Route path="/person/:tmdbId"    element={<PersonDetails />} />
    </Routes>
  </>
);

export default App;
