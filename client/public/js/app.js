'use strict';
var app = angular.module('app', []);
var api = 'http://localhost:3000/'

// Service to request and keep track of story objects.
app.factory('ListService', ['$http', function($http) {
  var myService = {};
  var lists = {};

  // returns list object
  myService.lists = function() {
    return lists;
  }

  // sends GET request to backend to retrieve current list
  myService.getLists = function(cb) {
    $http.get(api + 'lists')
      .then((res) => {
        console.log(res.data);
        lists = res.data;
        cb();
      },
      function(err) {
        console.log(err);
      })
  }
  return myService;
}])

app.controller('ListController', ['ListService', function(ListService) {
  var vm = this;
  var active = null; 

  vm.lists = ListService.lists();

  vm.test = "blahblah";
  
  vm.getLists = function() {
    ListService.getLists(() => {
      vm.lists = ListService.lists();
    });
  }

  // checks if a list is active, to be used by ng-show
  vm.isActive = function(id) {
    return active == id;
  }

  // makes list active if clicked, inactive if already active
  vm.toggleActive = function(id) {
    if (active == id) {
      return active = null;
    } 
    active = id;
  }

  vm.getLists();
}])
