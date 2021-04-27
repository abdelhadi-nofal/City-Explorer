'use strict';

// Aplication Setup

const express = require('express');
require('dotenv').config();

const server = express();
const cors = require('cors');

server.use(cors());

const superagent = require('superagent');

const PORT = process.env.PORT || 3000;

// Routes Definition

server.get('/',homeHandler);
server.get('/location',locationHandler);
server.get('/weather',weatherHandler);
server.get('/parks',parksHandler);
server.use(erorrHandler);

// Functions

function homeHandler(req,res){
  res.send('you are live');
}

function locationHandler(req,res){
  const cityName = req.query.city;
  let key = process.env.GEOCODE_API_KEY ;
  let URL = `https://us1.locationiq.com/v1/search.php?key=${key}&q=${cityName}&format=json`;

  superagent.get(URL)
    .then(apiData =>{
      const locationData  = new Location (cityName ,apiData.body);
      res.send(locationData );

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

  let URL = `https://developer.nps.gov/api/v1/parks?q=${city}&api_key=${key}`;

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

//////////////////////////////////////////////////////


server.listen(PORT,()=>{
  console.log(`listening to ${PORT}`);
});






