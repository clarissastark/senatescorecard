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
  ]);

  function Router($stateProvider, $locationProvider){
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
    });
  }

  function Senator($resource){
    var Senator = $resource("/api/senators/:name", {}, {
      update: {method: "PUT"}
    });
    Senator.all = Senator.query();
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
}());


console.log("JavaScript's working!");
