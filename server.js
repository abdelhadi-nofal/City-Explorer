'use strict';

const express = require('express');
require('dotenv').config();

const server = express();

const PORT = process.env.PORT || 4000;

server.get('/',(req,res) =>{
  res.send('you are live');
});

server.listen(PORT,()=>{
  console.log(`listening to ${PORT}`);
});


server.get('/location'),(req,res) =>{
  let locationData = require('./data/location.json');
  let locationRes = new Location(locationData);
  res.send(locationRes);
  console.log(locationData);
};




function Location(locData){
  this.search_query = locData[0].display_name;
  this.formatted_query = locData[0].display_name;
  this.latitude = locData[0].lat;
  this.longitude = locData[0].lon;
}


server.get('/weather'),(req,res) =>{
  let weatherData = require('./data/weather.json');
  let weathernRes = new Weather(weatherData);
  res.send(weathernRes);
  console.log(weathernRes);
};


function Weather(forecast, time) {
  this.forecast = forecast;
  this.time = time;
}
