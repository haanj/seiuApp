'use strict';
var app = angular.module('app', ['ngRoute']);
var api = 'http://localhost:3000/';

// NOTE: in a larger angular app, I would modularize the design,
// putting each controller/service into their own file. It makes it much easier to
// collaborate with others and keep large amounts of code organized..
//
// But, with a small app like this, I find it
// more efficient to reduce the number of files used. The added complexity ends up
// being counterproductive with so few lines of code.

// Service to request and keep track of story objects.
app.factory('ListService', ['$http', function($http) {
  var myService = {};
  var lists = [];

  // returns list object
  myService.lists = function() {
    return lists;
  };

  // sends GET request to backend to retrieve current list
  myService.getLists = function(cb) {
    $http.get(api + 'lists')
      .then((res) => {
        lists = res.data;
        cb();
      },
      function(err) {
        console.log(err);
      })
  };

  // Sends POST request with new list to backend.
  // The list is first added to the client's list so user
  // will not experience delay.
  //
  // Note that in the current version, my back-end will not actually add
  // user data to the database, as this is just a demonstration 
  // and I'd prefer users don't actually add anything to my RDS tables ;p
  myService.addList = function(list) {
    list.list_id = lists.length + 1;
    lists.push(list);
    $http.post(api + 'lists', list)
      .then((res) => {
        console.log('successfully posted');
      },
      function(err) {
        console.log(err);
      })
  };
  return myService;
}]);

app.controller('ListController', ['ListService', function(ListService) {
  var vm = this; // I'm still learning John Papa, but I do like vm=this. Keeps code looking cleaner.
  var active = null; // Keeps track of which list is active

  vm.lists = ListService.lists();

  vm.getLists = function() {
    ListService.getLists(() => {
      vm.lists = ListService.lists();
    });
  }

  // checks if a list is active, to be used by ng-show
  vm.isActive = function(id) {
    return active == id;
  };

  // makes list active if clicked, inactive if already active
  vm.toggleActive = function(id) {
    if (active == id) {
      return active = null;
    } 
    active = id;
  };

  // Requests lists if they don't exist yet. In the demo, this allows
  // angular to request the list from the server when the page is loaded,
  // but won't reset after the user submits their own list
  if (vm.lists.length == 0) {
    vm.getLists();
  }
}]);

app.controller('NewController', ['ListService', function(ListService) {
  var vm = this;
  vm.newPost = {};
   
   
  // can be called to reset the form. Creates blank post with one blank item
  vm.reset = function() {
    vm.newPost = {
      list_name: '',
      list_items: [{
        list_item_rank: 0,
        list_item_title: ''
      }]
    };
  };
  
  // adds another list item field
  vm.addItem = function() {
    vm.newPost.list_items.push(
      {
        list_item_rank: vm.newPost.list_items.length, // incremental numbering
        list_item_title: ''
      });
  };

  // removes last list item field
  vm.removeItem = function() {
    vm.newPost.list_items.pop();
  };

  // Calls the service method that adds a post to the DOM and sends it to the server
  // Then, the NewController form is reset to the default values for when the user wants
  // to add another post.
  vm.submit = function() {
    ListService.addList(vm.newPost);
    vm.reset();
  };

  // Initializes the newPost object. 'reset' is a bit of a misnomer in this case, 
  // but I decided that 'newctrl.reset()' would look semantic
  // in the templating, and I could just leave this description here
  vm.reset();
}]);

// Normally, I prefer to put the templates into their own HTML files, but for a smaller app like this, I feel a modular design unnecessarily increases the complexity
app.config(['$routeProvider', function($routeProvider) {
  $routeProvider
    .when('/index', {
      controller: 'ListController',
      controllerAs: 'listctrl',
      template: '\
        <div class="panel panel-default" ng-repeat="List in listctrl.lists | filter: searchFilter">\
          <div title="Click to show List" class="panel-heading" ng-click="listctrl.toggleActive(List.list_id)">\
            <h3>{{List.list_name}}</h3>\
          </div>\
          <div class="panel-body" ng-show="listctrl.isActive(List.list_id)">\
            <div ng-repeat="item in List.list_items">\
            {{item.list_item_title}}\
            </div>\
          </div>\
        </div>\
        <a class="btn btn-default" href="#/post">Add New List</a>'
    })
    .when('/post', {
      controller: 'NewController',
      controllerAs: 'newctrl',
      template: '\
        <section class="form-horizontal">\
          <div class="form-group form-group-lg">\
            <label class="col-sm-2 control-label">List Title</label>\
            <div class="col-sm-9">\
              <input class="form-control" type="text" ng-model="newctrl.newPost.list_name" placeholder="title">\
            </div>\
          </div>\
          <div class="form-group form-group-sm">\
            <div ng-repeat="item in newctrl.newPost.list_items">\
              <label class="col-sm-2 control-label">List Item</label>\
              <div class="col-sm-9">\
                <input class="form-control" type="text" ng-model="item.list_item_title" placeholder="item">\
              </div>\
            </div>\
          </div>\
          <div class=col-sm-offset-2>\
            <button class="btn btn-warning btn-sm" ng-click="newctrl.reset()">Reset Form</button>\
            <button class="btn btn-default btn-sm" ng-click="newctrl.addItem()">Add List Item</button>\
            <button class="btn btn-default btn-sm" ng-click="newctrl.removeItem()">Remove List Item</button>\
            <a class="btn btn-danger btn-sm" href="#/">Cancel</a>\
            <a class="btn btn-success btn-sm" href="#/" ng-click="newctrl.submit()">Submit</a>\
            <br>\
          </div>\
        </section>'
    })
    .otherwise({
      redirectTo: '/index'
    });
}]);
