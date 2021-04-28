'use strict';

// Aplication Setup

const express = require('express');
require('dotenv').config();

const server = express();
const cors = require('cors');

server.use(cors());

const superagent = require('superagent');

const pg = require('pg');
const client= new pg.Client(process.env.DATABASE_URL)|| new pg.Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
//
const PORT = process.env.PORT || 3000;

// Routes Definition

server.get('/',homeHandler);
server.get('/location',locationHandler);
server.get('/weather',weatherHandler);
server.get('/parks',parksHandler);
server.get('/movies',moviesHandler);
server.use(erorrHandler);

// Functions

function homeHandler(req,res){
  res.send('you are live');
}

// function locationHandler(req,res){
//   const cityName = req.query.city;
//   let key = process.env.GEOCODE_API_KEY ;
//   let URL = `https://us1.locationiq.com/v1/search.php?key=${key}&q=${cityName}&format=json`;

//   superagent.get(URL)
//     .then(apiData =>{
//       const locationData  = new Location (cityName ,apiData.body);
//       res.send(locationData );

//     })
//     .catch((err) =>{
//       res.send(err);
//     });
// }

function locationHandler(req,res){
  const cityName = req.query.city;
  let key = process.env.GEOCODE_API_KEY ;
  let URL = `https://us1.locationiq.com/v1/search.php?key=${key}&q=${cityName}&format=json`;
  // let SQL = `SELECT * FROM locations`;

  superagent.get(URL)
    .then(apiData =>{
      // console.log(apiData);
      const locationData  = new Location (cityName ,apiData.body);
      let SQLINSERT = `INSERT INTO locations (search_query,formatted_query,latitude,longitude)
       VALUES ($1,$2,$3,$4) RETURNING *;`;
      let safeValues = [locationData.search_query, locationData.formatted_query, locationData.latitude, locationData.longitude];
      client.query(SQLINSERT,safeValues)
        .then(data =>{
          res.send(data.rows[0]);
        });


    })
    .catch((err) =>{
      res.send(err);
    });



}

function weatherHandler(req,res){
  let city = req.query.search_query;
  let key = process.env.WEATHER_API_KEY;
  let URL = `https://api.weatherbit.io/v2.0/forecast/daily?city=${city}&key=${key}&days=8`;


  superagent.get(URL)
    .then(weatherData => {
      let weatherArr = weatherData.body.data.map(val => new Weather(val));
      res.send(weatherArr);

    })

    .catch((err) =>{
      res.send(err);
    });


}

function parksHandler(req,res){
  let city = req.query.search_query;
  let key = process.env.PARKS_API_KEY;

  let URL = `https://developer.nps.gov/api/v1/parks?q=${city}&api_key=${key}&limit=10`;

  superagent.get(URL)
    .then(parksData => {
      console.log(parksData);
      let parksArr = parksData.body.data.map(val => new Parks(val));
      res.send(parksArr);
    })

    .catch((err) =>{
      res.send(err);
    });
}

//http://localhost:4000/movies?api_key=4d1d4aa4d4b6a6c928e854be86e02ba9&query=seattle&language=de-DE&region=DE
function moviesHandler(req,res){
  let city = req.query.query;
  let key = process.env.MOVIE_API_KEY;
  let URL = `https://api.themoviedb.org/3/search/movie?api_key=${key}&query=${city}&language=de-DE&region=DE`;


  superagent.get(URL)
    .then(moviesData => {
      let moviesArr = moviesData.body.results.map(val => new Movies(val));
      res.send(moviesArr);

    })

    .catch((err) =>{
      res.send(err);
    });


}

function erorrHandler(req,res){
  res.status(500).send('Sorry, something went wrong');
}

// Constructor Functions for the data

function Location(cityName,apiData){
  this.search_query = cityName;
  this.formatted_query = apiData[0].display_name;
  this.latitude = apiData[0].lat;
  this.longitude = apiData[0].lon;
}

function Weather(weatherData) {
  this.forecast = weatherData.weather.description;
  this.time = new Date(weatherData.valid_date).toString().slice(0, 15);

}

function Parks(parksData) {
  this.name = parksData.name;
  this.address = `"${parksData.addresses[0].line1}" "${parksData.addresses[0].city}" "${parksData.addresses[0].stateCode}" "${parksData.addresses[0].postalCode}"`;
  this.fee = '0.00';
  this.description = parksData.description;
  this.url = parksData.url;
}

function Movies(moviesData) {
  this.title = moviesData.title;
  this.overview = moviesData.overview ;
  this.vote_average = moviesData.vote_average;
  this.vote_count = moviesData.vote_count;
  this.poster_path = moviesData.poster_path;
  this.popularity = moviesData.popularity;
  this.release_date = moviesData.release_date;
}

//////////////////////////////////////////////////////



client.connect()
  .then(() => {
    server.listen(PORT, () =>{
      console.log(`listening on ${PORT}`);
    });

  });

// server.listen(PORT,()=>{
//   console.log(`listening to ${PORT}`);
// });

