"use strict";

(function(){
  angular
  .module("senatescore", [
    "ui.router",
    "ngResource"
  ])
  .config([
    "$stateProvider",
    "$locationProvider",
    "$urlRouterProvider",
    "$httpProvider",
    Router
  ])
  .factory("Senator", [
    "$resource",
    Senator
  ])
  .controller("senatIndexCtrl", [
    "Senator",
    senatIndexCtrl
  ])
  .controller("senatShowCtrl", [
    "Senator",
    "$stateParams",
    senatShowCtrl
  ])
  .controller("loginCtrl", [
    "$scope",
    "$rootScope",
    "$http",
    "$location",
    loginCtrl
  ])

  function Router($stateProvider, $locationProvider, $urlRouterProvider, $httpProvider){
    // enable html5Mode for "#"-less URLs
    $locationProvider.html5Mode(true);
    $stateProvider
    .state("welcome", {
      url: "/",
      templateUrl: "/assets/html/welcome-page.html"
    })
    .state("index", {
      url: "/senators",
      templateUrl: "/assets/html/senators-index.html",
      controller: "senatIndexCtrl",
      controllerAs: "indexVM"
    })
    .state("show", {
      url: "/senators/:name",
      templateUrl: "/assets/html/senators-show.html",
      controller: "senatShowCtrl",
      controllerAs: "showVM"
    })
    .state("login", {
      url: "/login",
      templateUrl: "assets/html/login.html",
      controller: "loginCtrl"
    })
    // .state("signup", {
    //   url: "/signup",
    //   templateUrl: "assets/html/signup.html",
    //   controller: "signupCtrl"
    // })
    $urlRouterProvider.otherwise("/");
    var checkLoggedin = function($q, $timeout, $http, $location, $rootScope){
      // Initialize a new promise
      var deferred = $q.defer(); // Make an AJAX call to check if the user is logged in
      $http.get("/loggedin").success(function(user){
        // Authenticated
        if (user !== "0") deferred.resolve();
        // Not Authenticated
        else {
          $rootScope.message = "You need to log in.";
          deferred.reject();
          $location.url("/login");
        }
      });
      return deferred.promise;
    };
    // detects when an AJAX call returns a 401 status and displays the login form
    $httpProvider.interceptors.push(function($q, $location) {
      return {
        response: function(response) { // do something on success
          return response;
        },
        responseError: function(response) {
          if (response.status === 401)
          $location.url("/login");
          return $q.reject(response);
        }
      };
    });
  }

  function Senator($resource){
    var Senator = $resource("/api/senators/:name", {}, {
      update: {method: "PUT"},
      review: {
        method: "POST",
        url: "/api/candidates/:name/reviews"
      }
    });
    Senator.all = Senator.query();
    // loads all Senators when the factory loads and prevents needing to replace a senator in the Senator.all array when making updates
    Senator.find = function(property, value, callback){
      Senator.all.$promise.then(function(){
        Senator.all.forEach(function(senator){
          if(senator[property] == value) callback(senator);
        });
      });
    };
    return Senator;
  }

  function senatIndexCtrl(Senator){
    var vm = this;
    vm.senators = Senator.all;
    vm.sort_data_by = function(name){
      vm.sort_on = name;
      vm.is_descending = !(vm.is_descending);
    };
  }

  function senatShowCtrl(Senator, $stateParams){
    var vm = this;
    Senator.find("lastName", $stateParams.name, function(senator){
      vm.senator = senator;
    });
    vm.update = function(){
      Senator.update({name: vm.senator.name}, {senator: vm.senator}, function(){
        console.log("Done!");
      });
    };
    vm.addReview = function(){
      vm.senator.reviews.push(vm.newReview);
      vm.newPosition = "";
      vm.update();
    };
    vm.removeReview = function($index){
      vm.senator.reviews.splice($index, 1);
      vm.update();
    };
  }

  // middleware function to be used for every secured route
  function auth(req, res, next){
    if (!req.isAuthenticated())
    res.send(401);
    else next();
  };

  function loginCtrl($scope, $rootScope, $http, $location){
    // This object will be filled by the form
    $scope.user = {};
    // Register the login() function
    $scope.login = function(){
      $http.post("/login", {
        username: $scope.user.username,
        password: $scope.user.password,
      })
      .success(function(user){
        // No error: authentication OK
        $rootScope.message = "Authentication successful!";
        $location.url("/admin");
      })
      .error(function(){
        // Error: authentication failed
        $rootScope.message = "Authentication failed.";
        $location.url("/login");
      });
    };
  };

}());

console.log("JavaScript is werking!");
