'use strict';
const express = require('express');
const myDB = require('./connection');
const fccTesting = require('./freeCodeCamp/fcctesting.js');
const session = require('express-session');
const auth = require('./auth');
const setupRoutes = require('./routes');
require('dotenv').config();
const bcrypt = require("bcrypt");
const LocalStrategy = require('passport-local').Strategy;
const GitHubStrategy = require('passport-github').Strategy;
const passport = require('passport');
const {objectId} = require("mongodb")



const app = express();
const router = express.Router(); 


fccTesting(app); // For FCC testing purposes
app.use('/public', express.static(process.cwd() + '/public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'pug');
app.set('views', './views/pug');

myDB(async client => {
  try {
    const myDataBase = await client.db('database').collection('users');
    
    auth(app,myDataBase,bcrypt,passport,objectId,GitHubStrategy,LocalStrategy);
    setupRoutes(router, myDataBase);
    
    
 
  } catch (e) {
    console.error(e); // Log the error
    app.route('/').get((req, res) => {
      res.render('index', { title: e, message: 'Unable to connect to the database' });
    });
  }
});

app.use('/', router);
app.use((req, res, next) => {
  res.status(404)
    .type('text')
    .send('Not Found');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('Listening on port ' + PORT);
});
