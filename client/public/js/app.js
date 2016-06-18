'use strict';
var app = angular.module('app', []);
var api = 'http://localhost:3000/';

// Service to request and keep track of story objects.
app.factory('ListService', ['$http', function($http) {
  var myService = {};
  var lists = {};

  // returns list object
  myService.lists = function() {
    return lists;
  };

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

  myService.addList = function(list, cb) {
    list.list_id = lists.length + 1;
    lists.push(list);
    cb();
  }
  return myService;
}]);

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
}]);

app.controller('NewController', ['ListService', function(ListService) {
  var vm = this;
  vm.formActive = false; // whether the add new form is active
  vm.newPost = {};
   
   
  // can be called to reset the form.
  vm.reset = function() {
    vm.newPost = {
      list_name: 'Title',
      list_items: []
    };
  };
  
  // shows or hides the form
  vm.toggleForm = function() {
    vm.formActive = !vm.formActive;
  }

  // adds another list item field
  vm.addItem = function() {
    vm.newPost.list_items.push(
      {
        list_item_rank: vm.newPost.list_items.length,
        list_item_title: 'New Content'
      });
  }

  // removes last list item field
  vm.removeItem = function() {
    vm.newPost.list_items.pop();
  };

  vm.submit = function() {
    ListService.addList(vm.newPost);
    vm.reset();
  };

  vm.reset();
}]);
