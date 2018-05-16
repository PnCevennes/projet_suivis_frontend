angular.module('baseTaxons').controller('taxonDetailController', function($scope, $rootScope, $routeParams, configServ, dataServ){

    $scope._appName = $routeParams.appName;
    $scope.schemaUrl = 'config?app='+ $routeParams.appName + '&vue=obs_taxon&vue=detail';
    
    $scope.dataUrl = $scope._appName + '/contact_taxon/' + $routeParams.id;
    $scope.dataId = $routeParams.id;
    $scope.updateUrl = '#/' + $scope._appName + '/edit/taxons/' + $routeParams.id;
    
    $scope.$on('display:init', function(ev, data){
        $scope.title = 'Observation du taxon "' + data.nom_complet + '"';
    });
});

