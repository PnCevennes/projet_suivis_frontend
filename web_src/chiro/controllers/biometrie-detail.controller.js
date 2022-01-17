angular.module('biometrie').controller('biometrieDetailController', function($scope, $routeParams, RESOURCES){

    $scope._appName = $routeParams.appName;
    $scope.schemaUrl = RESOURCES.BASE_CONFIG_URL + '?app='+ $routeParams.appName + '&vue=biometrie&vue=detail';
    $scope.dataUrl = $scope._appName + '/biometrie/' + $routeParams.id;
    $scope.updateUrl = '#/' + $scope._appName + '/edit/biometrie/' + $routeParams.id;

    $scope.dataId = $routeParams.id;

    $scope.$on('display:init', function(ev, data){
        $scope.title = "Biométrie n°" + data.id;
    });

});

