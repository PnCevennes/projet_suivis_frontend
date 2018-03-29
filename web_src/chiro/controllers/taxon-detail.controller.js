angular.module('baseTaxons').controller('taxonDetailController', function($scope, $rootScope, $routeParams, configServ, dataServ){

    $scope._appName = $routeParams.appName;
    $scope.schemaUrl = $scope._appName + '/config/obstaxon/detail';
    $scope.dataUrl = $scope._appName + '/obs_taxon/' + $routeParams.id;
    $scope.dataId = $routeParams.id;
    $scope.updateUrl = '#/' + $scope._appName + '/edit/taxons/' + $routeParams.id;
    
    $scope.$on('display:init', function(ev, data){
        $scope.title = 'Observation du taxon "' + data.cotxNomComplet + '"';
    });
});

