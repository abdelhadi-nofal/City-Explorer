'use strict';

const express = require('express');
require('dotenv').config();

const server = express();
const cors = require('cors');

server.use(cors());


const PORT = process.env.PORT || 4000;

server.get('/',(req,res) =>{
  res.send('you are live');
});





server.get('/location',(req,res) =>{
  let locationData = require('./data/location.json');
  let locationRes = new Location(locationData);
  res.send(locationRes);

});




function Location(locData){
  this.search_query = locData[0].display_name.split(',')[0];
  this.formatted_query = locData[0].display_name;
  this.latitude = locData[0].lat;
  this.longitude = locData[0].lon;
}

server.listen(PORT,()=>{
  console.log(`listening to ${PORT}`);
});


server.get('/weather',(req, res) =>{
  const weatherData = require('./data/weather.json');
  let weatherArr = [];
  weatherData.data.forEach(item =>{
    const weather = new Weather(item.weather.description, item.valid_date);
    weatherArr.push(weather);
  });
  res.send(weatherArr);
});



function Weather(forecast, time) {
  this.forecast = forecast;
  this.time = time;
}

server.get('*',(req,res) =>{
  res.status(500).send('Sorry, something went wrong');
});



