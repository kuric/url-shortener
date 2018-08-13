'use strict';

const express = require('express');
const mongo = require('mongodb');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

const urlShort = require('./bin/validate');
const app = express();

const { URL } = require('url');

const urlDB = process.env.MONGO_URI;

const urlSave = require('./model/db');



 
mongoose.connect(urlDB,{ useNewUrlParser: true });


// Basic Configuration 
var port = process.env.PORT || 3000;

app.use(cors());


//logger
app.use('/', (req, res, next) => {
  console.log(`${req.method}, ${req.path} - ${req.ip}`);
  next();
});
app.use(bodyParser.urlencoded({extended: false}));
app.use('/public', express.static(process.cwd() + '/public'));


app.get('/api/shorturl/all', (req,res) => {
  urlSave.findAll(req, res);
});
app.get('/api/shorturl/:url', (req, res) => {
  urlSave.getLongUrl(req.params.url, function(err, data) {
    if (err) {
      res.send('ERROR');
    } else {
      res.redirect(data);
    }
  });
});


app.post('/api/shorturl/new', function (req, res) {
  const newLongUrl = req.body.url;
  urlShort.validateUrl(newLongUrl, function (err, url) {
    if (err) {
      console.error("Error: Url didn't validate:");
      console.error(err);      
      res.json({error: 'invalid url'});      
    } else {      
      urlSave.createNew(url, function(err, shortUrl) {
        if (err) {
          console.error('Error: fail with database');
          console.error(err);
          res.send('Error with database.');
        } else {
          res.json({original_url: url, short_url: shortUrl});
        }
      });
    }
  });
});
app.get('/', function(req, res){
  res.sendFile(process.cwd() + '/views/index.html');
});




app.listen(port, function () {
  console.log('Node.js listening ...');
});