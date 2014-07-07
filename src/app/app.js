angular.module( 'abhimata', [
  'ngRoute',
  'templates-app',
  'templates-common'
])

.run( function run () {
})

.controller( 'AppCtrl', function AppCtrl ( $scope, $location, $http ) {
  $scope.message = "hullo";
  $scope.getMessage = function() {
    $http({method: 'GET', url: 'http://localhost:3000/'})
      .success(function(data, status) {
        $scope.message = '' + status + ': ' + data;
      })
      .error(function() { console.log('error :(');});
  };
  
  $scope.login = function() {
    $http.post('/login', {'username': 'admin', 'password': 'clojure'})
    .success(function(data) {
      console.log(data);
    });
  };
});

