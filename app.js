const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json());

let db = null;
const dbPath = path.join(__dirname, "moviesData.db");

const initializeDBAndServer = async () => {
  try {
    db = await open({ filename: dbPath, driver: sqlite3.Database });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000");
    });
  } catch (e) {
    console.log(`DB Error:${e.message}`);
    process.exit(1);
  }
};
initializeDBAndServer();

//API 1 list of all movie names in the movie table

const convertMovieAPI1 = (dbObject) => {
  return {
    movieName: dbObject.movie_name,
  };
};

app.get("/movies/", async (request, response) => {
  const getMovieNames = `SELECT movie_name FROM movie;`;
  const movieNameObject = await db.all(getMovieNames);
  response.send(movieNameObject.map((eachName) => convertMovieAPI1(eachName)));
});

//API 2 Creates a new movie in the movie table

app.post("/movies/", async (request, response) => {
  const { directorId, movieName, leadActor } = request.body;
  const addMovie = `INSERT INTO movie(director_id,movie_name,lead_actor)
  VALUES('${directorId}','${movieName}','${leadActor}');`;
  const addMovieResponse = await db.run(addMovie);
  const movieId = addMovieResponse.lastId;
  response.send("Movie Successfully Added");
});

//API 3 Returns a movie based on the movie ID

const ConvertMovieAPI3 = (dbObject) => {
  return {
    movieId: dbObject.movie_id,
    directorId: dbObject.director_id,
    movieName: dbObject.movie_name,
    leadActor: dbObject.lead_actor,
  };
};

app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getMovieDetails = `SELECT * FROM movie WHERE movie_id = ${movieId};`;
  const getMovie = await db.get(getMovieDetails);
  response.send(ConvertMovieAPI3(getMovie));
});

//API 4 Updates the details of a movie in the movie table based on the movie ID

app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;
  const updateMovie = `UPDATE movie SET 
    director_id = '${directorId}',movie_name = '${movieName}',
    lead_actor = '${leadActor}' WHERE movie_id = '${movieId}';`;
  const updateMovieResponse = await db.run(updateMovie);
  response.send("Movie Details Updated");
});

//API 5 Deletes a movie from the movie table based on the movie ID

app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deleteMovieId = `DELETE FROM movie WHERE movie_id = '${movieId}';`;
  await db.run(deleteMovieId);
  response.send("Movie Removed");
});

//API 6 Returns a list of all directors in the director table

const convertDirectorResponseAPI6 = (dbObject) => {
  return {
    directorId: dbObject.director_id,
    directorName: dbObject.director_name,
  };
};

app.get("/directors/", async (request, response) => {
  const getDirectors = `SELECT * FROM director;`;
  const directorObject = await db.all(getDirectors);
  response.send(
    directorObject.map((eachItem) => convertDirectorResponseAPI6(eachItem))
  );
});

//API 7 list of all movie names directed by a specific director

app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const getMovieNames = `SELECT movie_name AS movieName FROM movie 
  WHERE director_id = ${directorId};`;
  const getMoviesByDirector = await db.all(getMovieNames);
  response.send(getMoviesByDirector);
});

module.exports = app;
