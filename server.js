import axios from "axios";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import lodash from "lodash";

// Load environment variables
dotenv.config();
const { TMDB_KEY } = process.env;

const app = express();

// CORS configuration middleware
const corsOptions = {
  origin: process.env.CORS_ORIGIN || "*",
  // Add other configuration options as needed
};
app.use(cors(corsOptions));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

const movie_db = axios.create({
  baseURL: "https://api.themoviedb.org/3",
  timeout: 2000,
  params: {
    api_key: TMDB_KEY,
  },
});

// Router for movie-related routes
const movieRouter = express.Router();

// Route to get the most popular movies
movieRouter.get("/most_popular", async (req, res, next) => {
  try {
    const api_response = await movie_db.get("/movie/popular");
    res.send(api_response.data.results);
  } catch (error) {
    next(error);
  }
});

// Search route for movies
movieRouter.get("/search", async (req, res, next) => {
  try {
    const api_response = await movie_db.get("/search/movie", {
      params: {
        query: req.query.title,
        include_adult: false,
      },
    });

    const filteredResults = lodash.filter(
      api_response.data.results,
      result => result.poster_path != null
    );

    res.send(filteredResults);
  } catch (error) {
    next(error);
  }
});

// Route to get details of a specific movie
movieRouter.get("/movies/:movieId", async (req, res, next) => {
  try {
    const api_response = await movie_db.get(`/movie/${req.params.movieId}`);
    res.send(api_response.data);
  } catch (error) {
    next(error);
  }
});

// Mount the movie router in the main application
app.use("/movies", movieRouter);

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`Backend service listening on port ${PORT}`);
});
