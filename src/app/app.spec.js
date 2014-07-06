describe( 'AppCtrl', function() {
    var AppCtrl, $location, $scope;

    beforeEach( module( 'abhimata' ) );

    beforeEach( inject( function( $controller, _$location_, $rootScope ) {
      $location = _$location_;
      $scope = $rootScope.$new();
      AppCtrl = $controller( 'AppCtrl', { $location: $location, $scope: $scope });
    })); 

    it( 'message should be hullo', inject( function() {
      expect( $scope.message ).toEqual('hullo');
    }));
    
});
