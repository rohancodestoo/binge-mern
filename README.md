<div align="center">
  <h1>🎬 Binge</h1>
  <p><em>A Letterboxd-inspired movie tracking & social platform</em></p>
  
  <p>
    <img src="https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB" />
    <img src="https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express.js" />
    <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
    <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js" />
  </p>

  <h3>
    <a href="https://binge-mern.onrender.com/">🚀 View Live Demo</a>
  </h3>
</div>

---

## 📖 Overview

**Binge** is a full-stack web application tailored for movie enthusiasts. Built with the MERN stack, it provides a robust and interactive way to discover films, log your watch history, write reviews, and connect with other users. It leverages the **TMDB API** to provide rich, up-to-date cinematic data.

## ✨ Features

- **🔍 Movie Discovery:** Browse trending and popular movies, or search for specific titles using real-time TMDB data.
- **🔐 Secure Authentication:** User registration and login utilizing JWT and bcryptjs for password hashing.
- **📔 Diary & Logging:** Keep a chronological diary of the movies you've watched with full CRUD capabilities.
- **⭐ Reviews & Ratings:** Write, edit, and share your thoughts on films. Read reviews from the community.
- **📌 Watchlist Management:** Easily add or remove movies you plan to watch in the future.
- **🤝 Social Networking:** View other users' profiles, read their reviews, and follow/unfollow members to curate your social feed.

## 🛠️ Tech Stack

### Frontend
- **Framework:** React (Vite)
- **Routing:** React Router v7
- **HTTP Client:** Axios

### Backend
- **Environment:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB (Mongoose)
- **Authentication:** JSON Web Tokens (JWT) & bcryptjs
- **External Data:** [TMDB API v3](https://developer.themoviedb.org/docs) (proxied via backend)

---

## 🚀 Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing.

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+)
- [MongoDB](https://www.mongodb.com/try/download/community) running locally (default: `mongodb://localhost:27017`)
- A [TMDB API Key](https://www.themoviedb.org/settings/api)

### 1. Clone the repository
```bash
git clone https://github.com/rohancodestoo/binge-mern.git
cd binge-mern
```

### 2. Setup the Backend

```bash
cd server
npm install

# Create environment variables file
cp .env.example .env
```

Open `server/.env` and configure your variables:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/binge
JWT_SECRET=your_super_secret_jwt_string
TMDB_API_KEY=your_tmdb_v3_api_key
TMDB_BASE_URL=https://api.themoviedb.org/3
```

Start the backend server:
```bash
npm run dev
```

### 3. Setup the Frontend

Open a new terminal window/tab:
```bash
cd client
npm install
```

Start the frontend development server:
```bash
npm run dev
```

> **Note:** The Vite dev server will be running at `http://localhost:5173` and automatically proxies `/api` requests to the backend server on port `5000`.

---

## 📡 API Endpoints

<details>
<summary><b>Click to expand the API Reference</b></summary>

### Authentication
| Method | Endpoint | Auth Required | Description |
|---|---|---|---|
| POST | `/api/auth/register` | No | Register a new user |
| POST | `/api/auth/login` | No | Login + get JWT |
| GET | `/api/auth/me` | Yes | Get current user info |

### Movies
| Method | Endpoint | Auth Required | Description |
|---|---|---|---|
| GET | `/api/movies/trending` | No | Get trending movies |
| GET | `/api/movies/popular` | No | Get popular movies |
| GET | `/api/movies/search?q=` | No | Search for movies |
| GET | `/api/movies/:tmdbId` | No | Get specific movie details |

### Reviews
| Method | Endpoint | Auth Required | Description |
|---|---|---|---|
| POST | `/api/reviews` | Yes | Create a new review |
| GET | `/api/reviews/movie/:tmdbId` | No | Get all reviews for a movie |
| PUT | `/api/reviews/:id` | Yes | Update an existing review |
| DELETE | `/api/reviews/:id` | Yes | Delete a review |

### Watchlist
| Method | Endpoint | Auth Required | Description |
|---|---|---|---|
| POST | `/api/watchlist` | Yes | Add movie to watchlist |
| GET | `/api/watchlist` | Yes | Get current user's watchlist |
| DELETE | `/api/watchlist/:tmdbId` | Yes | Remove movie from watchlist |

### Diary
| Method | Endpoint | Auth Required | Description |
|---|---|---|---|
| POST | `/api/diary` | Yes | Log a watched movie |
| GET | `/api/diary` | Yes | Get current user's diary |
| PUT | `/api/diary/:id` | Yes | Update a diary entry |
| DELETE | `/api/diary/:id` | Yes | Delete a diary entry |

### Users
| Method | Endpoint | Auth Required | Description |
|---|---|---|---|
| GET | `/api/users/:username` | No | Get user profile |
| GET | `/api/users/:username/reviews`| No | Get a user's reviews |
| POST | `/api/users/:username/follow` | Yes | Follow a user |
| DELETE| `/api/users/:username/follow` | Yes | Unfollow a user |

</details>

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/rohancodestoo/binge-mern/issues) if you want to contribute.

<div align="center">
  Made with ❤️ by <a href="https://github.com/rohancodestoo">rohancodestoo</a>
</div>
