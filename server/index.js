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

function nestListItems(rawList) { // nests the sql join results into prettier objects. sequelize nesting refractor will make this unnecessary
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
  // janky code to transform object into array. Angular filter works better with arrays
  for (var key in nestedList) {
    arrayList.push(nestedList[key]);
  }
  
  return arrayList;


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
  app.route('/lists')
    .get((req, res) => {
      console.log('GET request received for /lists');
      sequelize.query('SELECT * FROM lists_tbl INNER JOIN list_items_tbl ON lists_tbl.list_id=list_items_tbl.list_id') // TODO: learn sequelize nesting
        .spread(function(results, metadata) {
          res.json(nestListItems(results));
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
