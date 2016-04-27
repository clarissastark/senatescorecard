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
  .factory("UserReview", [
    "$resource",
    UserReview
  ])
  .controller("reviewIndexCtrl", [
    "UserReview",
    reviewIndexCtrl
  ])
  .controller("senatShowCtrl", [
    "Senator",
    "$stateParams",
    senatShowCtrl
  ])

  function Router($stateProvider, $locationProvider, $urlRouterProvider){
    // enable html5Mode for '#'-less URLs
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
    $urlRouterProvider.otherwise("/");
  }

  function Senator($resource){
    var Senator = $resource("/api/senators/:name", {}, {
      update: {method: "PUT"}
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
  }

  function UserReview($resource){
    var UserReview = $resource("/api/senators/:name/reviews", {}, {
      update: {method: "PUT"}
    });
    UserReview.all = UserReview.query();
    return UserReview;
  }

  function reviewIndexCtrl(UserReview){
    var vm = this;
    vm.userReviews = UserReview.all;
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
}());

console.log("JavaScript's werking!");
