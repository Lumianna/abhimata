angular.module( 'abhimata', [
  'ngRoute',
  'ngCookies',
  'templates-app',
  'templates-common'
])

.run( function run () {
})

.controller( 'AppCtrl', function AppCtrl ( $scope, $location, $http, $cookies ) {
  $scope.message = "hullo";
  $scope.getMessage = function() {
    $http({method: 'GET', url: 'http://localhost:3000/'})
      .success(function(data, status) {
        $scope.message = '' + status + ': ' + data;
      })
      .error(function() { console.log('error :(');});
  };

  $scope.getSecretMessage = function() {
    $http({method: 'GET', url: '/secret'})
      .success(function(data, status) {
        $scope.message = '' + status + ': ' + data;
      })
      .error(function() { console.log('error :(');});
  };

  $scope.logout = function() {
    $http({method: 'GET', url: '/logout'})
      .success(function(data, status) {
        $scope.message = '' + status + ': ' + data;
      })
      .error(function() { console.log('error :(');});
  };

  $scope.login = function() {
    $http.post('/login', {'username': 'admin', 'password': 'clojure'})
    .success(function(data) {
      console.log(data);
      console.log($cookies);
    });
  };

  $scope.falseLogin = function() {
    $http.post('/login', {'username': 'admin', 'password': 'java'})
    .success(function(data) {
      console.log(data);
    });
  };
});

