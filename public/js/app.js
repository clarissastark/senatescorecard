"use strict";

(function(){
  angular
  .module("senatescore", [
    "ui.router",
    "ngResource",
    "ngRoute"
  ])
  .config([
    "$stateProvider",
    "$locationProvider",
    "$urlRouterProvider",
    "$httpProvider",
    "$routeProvider",
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
  .controller('loginController',[
    '$scope',
    '$location',
    'AuthService',
    loginCtrlFunction
  ])
  .controller('logoutController', [
    '$scope',
    '$location',
    'AuthService',
    logoutCtrlFunction
  ])
  .factory("AuthService", [
    "$q",
    "$timeout",
    "$http",
  function ($q, $timeout, $http) {
    // create user variable
    var user = null;
    // return available functions for use in the controllers
    return ({
      isLoggedIn: isLoggedIn,
      getUserStatus: getUserStatus,
      login: login,
      logout: logout,
      register: register
    });
  }])
  .run(function ($rootScope, $location, $route, AuthService) {
    $rootScope.$on('$routeChangeStart',
    function (event, next, current) {
      if (AuthService.isLoggedIn() === false) {
        $location.path('/login');
      }
    });
  })
  .controller('registerController', [
    '$scope',
    '$location',
    'AuthService',
    regCtrlFunction
  ])

  function Router($stateProvider, $locationProvider, $urlRouterProvider, $httpProvider, $routeProvider){
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
    });
    // $routeProvider
    // .when('/login', {
    //   templateUrl: '/assets/html/login.html',
    //   controller: 'loginController',
    //   access: {restricted: false}
    // })
    // .when('/logout', {
    //   controller: 'logoutController',
    //   access: {restricted: true}
    // })
    // .when('/register', {
    //   templateUrl: 'register.html',
    //   controller: 'registerController',
    //   access: {restricted: false}
    // })
    // .otherwise({
    //   redirectTo: '/'
    // });
    // .state("login", {
    //   url: "/login",
    //   templateUrl: "assets/html/login.html",
    //   controller: "loginCtrl"
    // })
    // .state("signup", {
    //   url: "/signup",
    //   templateUrl: "assets/html/signup.html",
    //   controller: "signupCtrl"
    // })
    // $urlRouterProvider.otherwise("/");
    // var checkLoggedIn = function($q, $timeout, $http, $location, $rootScope){
    //   // Initialize a new promise
    //   var deferred = $q.defer(); // Make an AJAX call to check if the user is logged in
    //   $http.get("/loggedIn").success(function(user){
    //     // Authenticated
    //     if (user !== "0") deferred.resolve();
    //     // Not Authenticated
    //     else {
    //       $rootScope.message = "You need to log in.";
    //       deferred.reject();
    //       $location.url("/login");
    //     }
    //   });
    //   return deferred.promise;
    // };
    // // detects when an AJAX call returns a 401 status and displays the login form
    // $httpProvider.interceptors.push(function($q, $location) {
    //   return {
    //     response: function(response) { // do something on success
    //       return response;
    //     },
    //     responseError: function(response) {
    //       if (response.status === 401)
    //       $location.url("/login");
    //       return $q.reject(response);
    //     }
    //   };
    // });
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
  }

  function logoutCtrlFunction($scope, $location, AuthService){
    $scope.logout = function () {
      // call logout from service
      AuthService.logout()
      .then(function () {
        $location.path('/login');
      });
    };
  }

  function loginCtrlFunction($scope, $location, AuthService){
    $scope.login = function () {
      // initial values
      $scope.error = false;
      $scope.disabled = true;
      // call login from service
      AuthService.login($scope.loginForm.username, $scope.loginForm.password)
      // handle success
      .then(function () {
        $location.path('/');
        $scope.disabled = false;
        $scope.loginForm = {};
      })
      // handle error
      .catch(function () {
        $scope.error = true;
        $scope.errorMessage = "Invalid username and/or password";
        $scope.disabled = false;
        $scope.loginForm = {};
      });
    };
  }

  function isLoggedIn() {
    if(user) {
      return true;
    } else {
      return false;
    }
  }

  function getUserStatus() {
    return user;
  }

  function login(username, password) {

    // create a new instance of deferred
    var deferred = $q.defer();

    // send a post request to the server
    $http.post('/user/login',
    {username: username, password: password})
    // handle success
    .success(function (data, status) {
      if(status === 200 && data.status){
        user = true;
        deferred.resolve();
      } else {
        user = false;
        deferred.reject();
      }
    })
    // handle error
    .error(function (data) {
      user = false;
      deferred.reject();
    });

    // return promise object
    return deferred.promise;

  }

  function logout() {
    // create a new instance of deferred
    var deferred = $q.defer();
    // send a get request to the server
    $http.get('/user/logout')
    // handle success
    .success(function (data) {
      user = false;
      deferred.resolve();
    })
    // handle error
    .error(function (data) {
      user = false;
      deferred.reject();
    });
    // return promise object
    return deferred.promise;
  }

  function register(username, password) {
    // create a new instance of deferred
    var deferred = $q.defer();
    // send a post request to the server
    $http.post('/user/register',
    {username: username, password: password})
    // handle success
    .success(function (data, status) {
      if(status === 200 && data.status){
        deferred.resolve();
      } else {
        deferred.reject();
      }
    })
    // handle error
    .error(function (data) {
      deferred.reject();
    });
    // return promise object
    return deferred.promise;

  }



  // function loginCtrl($scope, $rootScope, $http, $location){
  //   // This object will be filled by the form
  //   $scope.user = {};
  //   // Register the login() function
  //   $scope.login = function(){
  //     $http.post("/login", {
  //       username: $scope.user.username,
  //       password: $scope.user.password,
  //     })
  //     .success(function(user){
  //       // No error: authentication OK
  //       $rootScope.message = "Authentication successful!";
  //       $location.url("/admin");
  //     })
  //     .error(function(){
  //       // Error: authentication failed
  //       $rootScope.message = "Authentication failed.";
  //       $location.url("/login");
  //     });
  //   };
  // };

}());

console.log("JavaScript is werking!");
