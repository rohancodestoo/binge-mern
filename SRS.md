# Software Requirements Specification (SRS) for Binge

## 1. Introduction
### 1.1 Purpose
The purpose of this SRS is to outline the functional and non-functional requirements for **Binge**, a MERN-based web application tailored for movie tracking and social networking among film enthusiasts.

### 1.2 Scope
Binge allows users to discover movies, construct a personal diary, write and read reviews, maintain watchlists, and follow other users. Movie data and artwork are sourced dynamically from the TMDB API. 

## 2. Overall Description
### 2.1 Product Perspective
Binge operates on a client-server architecture. The frontend application is built in React via Vite and connects to a Node/Express RESTful API server. The server proxies external TMDB API requests and interfaces with a MongoDB database for robust internal data persistence (users, reviews, watchlists, etc.).

### 2.2 User Classes
* **Guest Users (Unauthenticated):** Can browse trending/popular movies, search for movies, view movie details, read public reviews, and look at user profiles.
* **Authenticated Users:** Possess all guest privileges, plus the ability to maintain a diary, review movies, manage a watchlist, and follow other users.

### 2.3 Operating Environment
* **Platform:** Web application accessible on modern internet browsers.
* **Backend Server:** Node.js (v18+) with Express.js.
* **Database:** MongoDB.
* **External Data:** Access to `https://api.themoviedb.org/3`.

## 3. System Features & Functional Requirements

### 3.1 Authentication System
* **REQ-3.1.1:** The system shall allow users to register with a username, email, and password.
* **REQ-3.1.2:** The system shall securely hash user passwords using `bcryptjs`.
* **REQ-3.1.3:** The system shall authorize users using JSON Web Tokens (JWT).
* **REQ-3.1.4:** The system shall provide an endpoint to fetch the current authenticated user's metadata.

### 3.2 Movie Discovery
* **REQ-3.2.1:** The system shall display trending and popular movies by pinging the TMDB API.
* **REQ-3.2.2:** The system shall allow searching for movies by title query (`/api/movies/search?q=`).
* **REQ-3.2.3:** The system shall present full movie details, including cast, crew, synopsis, and posters for a given TMDB movie ID.

### 3.3 Reviews System
* **REQ-3.3.1:** Authenticated users shall be able to post reviews for specific movies.
* **REQ-3.3.2:** The system shall allow users to read all reviews linked to a specific movie.
* **REQ-3.3.3:** Authors of reviews shall have the ability to explicitly edit (PUT) or delete (DELETE) their own reviews.

### 3.4 Watchlist System
* **REQ-3.4.1:** Authenticated users shall be capable of adding a movie to their personal watchlist.
* **REQ-3.4.2:** Users shall be able to fetch their entire watchlist.
* **REQ-3.4.3:** Users shall be able to remove movies from their watchlist using the TMDB ID.

### 3.5 Diary Tracking
* **REQ-3.5.1:** Users shall be able to log a newly watched movie as a diary entry.
* **REQ-3.5.2:** The system shall store and display a chronological diary of a user's logged films.
* **REQ-3.5.3:** Users shall be able to update or delete any entries from their own diary.

### 3.6 Social Networking
* **REQ-3.6.1:** Any user can view the profile data of another user via their username.
* **REQ-3.6.2:** Any user can fetch a list of reviews written by a specific user.
* **REQ-3.6.3:** Authenticated users shall be able to "Follow" other users.
* **REQ-3.6.4:** Authenticated users shall be able to "Unfollow" users they previously followed.

## 4. Non-Functional Requirements

### 4.1 Security
* Endpoints modifying user data (`/api/reviews`, `/api/watchlist`, `/api/diary`, `/api/users/:username/follow`) shall strictly enforce JWT authentication.
* Sensitive environment keys (TMDB API Key, JWT Secret, DB URI) must not be exposed to the client or version control.

### 4.2 Performance
* The frontend heavily utilizes React Router v7 for client-side routing to behave as a Single Page Application (SPA), preventing full page reloads and providing smooth navigation.
* The backend shall efficiently handle and cache (where applicable) proxied TMDB requests.

### 4.3 Maintainability
* Projects shall adhere to modular layout definitions segregating components seamlessly inside the `client` folder and routing/controllers in the `server` structure.

## 5. Interface Requirements

### 5.1 External Interfaces
* **TMDB API v3:** Required for querying movies. Configured via the `TMDB_API_KEY` and proxied securely over the backend to prevent leaking client keys.

### 5.2 Internal Interfaces
* The client communicates with the backend exclusively over internal HTTP JSON APIs (routed primarily through `/api/...`).
