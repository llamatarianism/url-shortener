'use strict';

const express = require('express');
const validator = require('url-valid');
const mongo = require('mongodb');
const rs = require('random-strings');
const mongoClient = mongo.MongoClient;
const app = express();
const url = 'mongodb://localhost:27017/db';

app.get('/:query', (req, res) => {
  mongoClient.connect(url, (err, db) => {
    if (err) {
      console.log(err);
      res.writeHead(500);
      res.end();
      return;
    }
    const collection = db.collection('pages')
    collection.find({ "short": `${process.env.APP_URL}/${req.params.query}` })
    .toArray((err, data) => {
      if (err) {
        console.log(err);
        res.writeHead(500);
        res.end();
        return;
      }
      if (data[0].hasOwnProperty('long')) {
        res.redirect(data[0].long);
      } else {
        res.json({ "error": "page not found" });
      }
    });
  });
});

app.get(/\/new\/(http(s)?:\/\/){1}(www\.)?(.+)(\.com)+/i, (req, res) => {
  if (req.params[1] === 's') req.params.splice(1, 1);
  const requestUrl = req.params.join('');
  
  mongoClient.connect(url, (err, db) => {
    if (err) {
      console.log(err);
      res.writeHead(500);
      res.end();
      return;
    }
    const collection = db.collection('pages');
    const randString = rs.alphaNumMixed(16);
    
    const jsonResponse = {
      "long": requestUrl,
      "short": `${process.env.APP_URL}/${randString}`
    };
    res.json(jsonResponse);
    collection.insert(jsonResponse);
    return;
  });
});

app.listen(process.env.PORT);