angular
.module('senatescore')
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
.controller('registerController', [
  '$scope',
  '$location',
  'AuthService',
  regCtrlFunction
)]

  function regCtrlFunction($scope, $location, AuthService) {

    $scope.register = function () {

      // initial values
      $scope.error = false;
      $scope.disabled = true;

      // call register from service
      AuthService.register($scope.registerForm.username, $scope.registerForm.password)
        // handle success
        .then(function () {
          $location.path('/login');
          $scope.disabled = false;
          $scope.registerForm = {};
        })
        // handle error
        .catch(function () {
          $scope.error = true;
          $scope.errorMessage = "Something went wrong!";
          $scope.disabled = false;
          $scope.registerForm = {};
        });

    };

}]);

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
