# Project Summary: Binge (MERN Stack)

## Overview
**Binge** is a Letterboxd-inspired movie tracking and social networking platform. Built using the MERN stack (MongoDB, Express.js, React, Node.js), it provides a robust, interactive way for movie enthusiasts to discover films, log their watching history, review titles, and connect with other users.

## Key Features
* **Movie Discovery & Information:** Fetches reliable movie data (trending, popular, searchable, and full details) using the TMDB API, functioning as a proxy through the backend server.
* **User Authentication:** Secure registration and login using JWT (JSON Web Tokens) and bcryptjs for password hashing.
* **Movie Diary & Logging:** Users can log movies they have watched, keeping a historical diary of their viewing activity, with full CRUD functionality for their diary entries.
* **Reviews & Ratings:** Authenticated users can write, edit, and delete reviews for movies. Visitors can view all reviews on a movie's detail page.
* **Watchlist Management:** Users can manage a personalized watchlist by adding or removing movies they intend to watch.
* **Social Connections:** A robust social system where users can view others' profiles and reviews, and follow/unfollow other members.

## Tech Stack
* **Frontend:** React (powered by Vite) offering a smooth SPA experience, utilizing `react-router-dom` v7 for navigation and `axios` for fast API communication.
* **Backend:** Node.js runtime coupled with Express.js to host RESTful API endpoints.
* **Database:** MongoDB (local instance mapped over Mongoose) serving robust document-based storage.
* **External APIs:** The Movie Database (TMDB) API for high-quality, up-to-date cinematic data.

## Goal
To deliver a responsive, dark-themed (characteristic of cinema apps), highly engaging single-page application suitable for movie lovers who wish to track their films and opinions socially.
