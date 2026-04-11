# Binge 🎬

A **Letterboxd-inspired** movie tracking & social platform built with the **MERN stack** + TMDB API.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React (Vite), React Router v7, Axios |
| Backend | Node.js, Express.js |
| Database | MongoDB (local instance) |
| Auth | JWT + bcryptjs |
| Movie Data | TMDB API (proxied via backend) |

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB running locally on `mongodb://localhost:27017`
- A [TMDB API key](https://www.themoviedb.org/settings/api)

### 1. Setup the Backend

```bash
cd server
cp .env.example .env
# Edit .env and fill in your real values
npm install
npm run dev
```

### 2. Setup the Frontend

```bash
cd client
npm install
npm run dev
```

The app will be available at **http://localhost:5173**. The Vite dev server proxies `/api` requests to Express on port 5000.

## Environment Variables

Copy `server/.env.example` → `server/.env` and fill in:

| Variable | Description |
|---|---|
| `PORT` | Express port (default: 5000) |
| `MONGO_URI` | Local MongoDB URI e.g. `mongodb://localhost:27017/binge` |
| `JWT_SECRET` | Strong random string for signing JWTs |
| `TMDB_API_KEY` | Your TMDB v3 API key |
| `TMDB_BASE_URL` | `https://api.themoviedb.org/3` |

> ⚠️ **Never commit `.env`** — it is listed in `.gitignore`.

## API Endpoints

| Method | Route | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | No | Register a new user |
| POST | `/api/auth/login` | No | Login + get JWT |
| GET | `/api/auth/me` | Yes | Current user info |
| GET | `/api/movies/trending` | No | Trending movies |
| GET | `/api/movies/popular` | No | Popular movies |
| GET | `/api/movies/search?q=` | No | Search movies |
| GET | `/api/movies/:tmdbId` | No | Movie details |
| POST | `/api/reviews` | Yes | Create review |
| GET | `/api/reviews/movie/:tmdbId` | No | Reviews for a movie |
| PUT | `/api/reviews/:id` | Yes | Update review |
| DELETE | `/api/reviews/:id` | Yes | Delete review |
| POST | `/api/watchlist` | Yes | Add to watchlist |
| GET | `/api/watchlist` | Yes | User's watchlist |
| DELETE | `/api/watchlist/:tmdbId` | Yes | Remove from watchlist |
| POST | `/api/diary` | Yes | Log a watch |
| GET | `/api/diary` | Yes | Diary entries |
| PUT | `/api/diary/:id` | Yes | Update entry |
| DELETE | `/api/diary/:id` | Yes | Delete entry |
| GET | `/api/users/:username` | No | User profile |
| GET | `/api/users/:username/reviews` | No | User's reviews |
| POST | `/api/users/:username/follow` | Yes | Follow user |
| DELETE | `/api/users/:username/follow` | Yes | Unfollow user |
