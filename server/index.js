'use strict';
let S_PORT = Number(process.env.S_PORT) || 3000; // port to serve server on
let DB = process.env.DB; // uri to sql database

let bodyParser = require('body-parser'); // parses json requests
let express = require('express'); // <3
let app = express();

let Sequelize = require('sequelize'); // ORM that supports SQL. Don't actually know it too well, as I've mostly used Mongoose/MongoDB with express
let sequelize = new Sequelize(DB); // creates database connection

let db = {}; // object to assign db models as properties

// authenticates connection is valid
sequelize
  .authenticate()
  .then(function(err) {
    console.log('Connection has been established successfully.');
    syncTables(startRouter); // Promise runs syncTables as soon as connection is established.
  })
  .catch(function (err) {
    console.log('Unable to connect to the database:', err);
  });

function syncTables(cb) {
  // Here, I create the models for the SQL tables in sequelize.
  // Normally, I would put the models into a separate directory and 
  // import them for modularity, but with a smaller app with only two resources,
  // I Just put everything in the index.js

  // lists_tbl keeps track of all the lists, with their list_id and list_name
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
    freezeTableName: true, // don't pluralize table name plz -_-
    timestamps: false // don't need these in this demo
  });

  // list_items_tbl keeps track of the list items.
  // Arguably the most important field is list_id, which is functioning as a foreign_key
  // MVP: i just used an INT to hack a foreign key. I had started to experiment with
  // sequelize's handling of foreign keys, but I had more pressing things to learn to finish
  // TODO: Use real foreign_keys with sequelize
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


  db.ListItem.sync({force: false}).then(function() { // if set to true -- server will dump data upon start
    db.List.sync({force: false}).then(function() {
      cb(); // should call startRouter(), which sets up the express routing
    })
  });

}

function nestListItems(rawList) { // nests the sql join results into more efficient objects. Foreign_key refractor should deprecate this function
  /* nested object schema
    nestedList = {
      1: {
        list_id: 1,
        list_name: '5 things'
        list_items: [
          {
            list_item_id: 1,
            list_item_rank: 1,
            list_item_title: 'this is a thing',
          },
          {
            list_item_id: 2,
            list_item_rank: 2,
            list_item_title: 'this is another thing',
          }
        ]
      }
  */

  let nestedList = {};
  rawList.forEach((item) => {
    if (!nestedList[item.list_id]) { // creates entry if list is not in nestedList
      nestedList[item.list_id] = {
        list_id: item.list_id,
        list_name: item.list_name,
        list_items: []
      };
    }
    nestedList[item.list_id].list_items.push({ // pushes list_items to list
      list_item_rank: item.list_item_rank,
      list_item_title: item.list_item_title,
      list_item_id: item.list_item_id
    })
  })
  
  let arrayList = [];
  // Angular filter works better with arrays. This adds some unecessary complexity, but again, the refractor would deprecate this function anyways
  for (var key in nestedList) {
    arrayList.push(nestedList[key]);
  }
  
  return arrayList;
}

// This function will declare the api routes
function startRouter() {

  // Cross origin permissions.
  app.use((req, res, next)=> {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Credentials', 'true'); // Only really need if I add user login routes/permissions
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    res.header('Access-Control-Allow-Methods', 'DELETE, GET, POST, UPDATE');
    next();
  });

  // parses incoming requests into json for me
  app.use(bodyParser.json());

  // lists routes
  app.route('/lists')
    .get((req, res) => {
      console.log('GET request received for /lists');
      sequelize.query('SELECT * FROM lists_tbl INNER JOIN list_items_tbl ON lists_tbl.list_id=list_items_tbl.list_id') // TODO: learn sequelize foreign_key handling
        .spread(function(results, metadata) {
          res.json(nestListItems(results)); // returns array of lists with their nested list_items
        })

    })
    // For demo purposes, my post route doesn't actually add lists to my database.
    // I simply don't want people adding data to my RDS table for a portfolio piece.
    // But here is where I would pass req.body into a function that would add the new list to lists_tbl,
    // then use the resulting primary key for the new list and add the list_items to list_items_tbl.
    .post((req, res) => {
      console.log('POST request received for /lists');
      console.log(req.body);
      res.json('Success')
    });

  app.listen(S_PORT, () => {
    console.log('Server started on port', S_PORT);
  });
}
