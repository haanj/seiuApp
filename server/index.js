'use strict';
let S_PORT = Number(process.env.S_PORT) || 3000;
let DB = process.env.DB;

let bodyParser = require('body-parser');
let express = require('express');
let app = express();

let Sequelize = require('sequelize');
let sequelize = new Sequelize(DB); // creates database connection

let db = {}; // object to assign models, as they're created

// authenticates connection is valid
sequelize
  .authenticate()
  .then(function(err) {
    console.log('Connection has been established successfully.');
    syncTables(startRouter);
  })
  .catch(function (err) {
    console.log('Unable to connect to the database:', err);
  });

function syncTables(cb) {
  db.List = sequelize.define('lists_tbl', {
    list_id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    list_name: {
      type: Sequelize.STRING
    }
  }, {
    freezeTableName: true, // doesn't pluralize table name -_-
    timestamps: false // don't need these...
  });

  db.ListItem = sequelize.define('list_items_tbl', {
    list_item_id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    list_item_rank: {
      type: Sequelize.INTEGER
    },
    list_item_title: {
      type: Sequelize.STRING
    },
    list_id: {
      type: Sequelize.INTEGER
    }
  }, {
    freezeTableName: true,
    timestamps: false
  });


  db.ListItem.sync({force: false}).then(function() { // force: true -- for demo purposes, server will dump data upon start
    db.List.sync({force: false}).then(function() {
      cb(); // should call startRouter(), which sets up the express routing
    })
  });
}

function startRouter() {
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
      sequelize.query('SELECT * FROM lists_tbl INNER JOIN list_items_tbl ON lists_tbl.list_id=list_items_tbl.list_id') // TODO: learn sequelize nesting
        .spread(function(results, metadata) {
          console.log(results);
          res.json(results);
        })

      //db.ListItem.findAll({
        //include: [{
          //model: db.List,
          //where: {}
        //}]
      //})
        //.then((data) => {
          //res.json(data);
        //});

    });

  app.listen(S_PORT, () => {
    console.log('Server started on port', S_PORT);
  });
}
