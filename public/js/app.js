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
  Router
  ])

  function Router($stateProvider, $locationProvider){
    // enable html5Mode for '#'-less URLs
    $locationProvider.html5Mode(true);
    $locationProvider.hashPrefix('!');
    $stateProvider
    .state("welcome", {
      url: "/",
      templateUrl: "/assets/html/welcome-page.html"
    })
    .state("index", {
      url: "/senators",
      templateUrl: "/assets/html/senators-index.html"
    })
  }
})();


console.log("JavaScript's working!");
