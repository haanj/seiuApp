'use strict';
let S_PORT = Number(process.env.S_PORT) || 3000;
let DB = process.env.DB;

let bodyParser = require('body-parser');
let express = require('express');
let app = express();

let Sequelize = require('sequelize');
var sequelize = new Sequelize(DB);

sequelize
  .authenticate()
  .then(function(err) {
    console.log('Connection has been established successfully.');
  })
  .catch(function (err) {
    console.log('Unable to connect to the database:', err);
  });

app.use((req, res, next)=> {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.header('Access-Control-Allow-Methods', 'DELETE, GET, POST, UPDATE');
  next();
});

app.use(bodyParser.json());

// /test routes
app.route('/test')
  .get((req, res) => {
    console.log('GET request received for /test');
    res.json('Hello world')
  })


app.listen(S_PORT, () => {
  console.log('Server started on port', S_PORT);
});
