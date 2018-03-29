angular.module('biometrie').controller('biometrieDetailController', function($scope, $rootScope, $routeParams, configServ, dataServ){

    $scope._appName = $routeParams.appName;
    $scope.schemaUrl = $scope._appName + '/config/biometrie/detail';
    $scope.dataUrl = $scope._appName + '/biometrie/' + $routeParams.id;
    $scope.updateUrl = '#/' + $scope._appName + '/edit/biometrie/' + $routeParams.id;

    $scope.dataId = $routeParams.id;

    $scope.$on('display:init', function(ev, data){
        $scope.title = "Biométrie n°" + data.id;
    });

});

