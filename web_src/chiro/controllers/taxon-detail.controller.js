angular.module('baseTaxons').controller('taxonDetailController', function($scope, $rootScope, $routeParams, RESOURCES){

    $scope._appName = $routeParams.appName;
    $scope.schemaUrl = RESOURCES.BASE_CONFIG_URL + '?app='+ $routeParams.appName + '&vue=obs_taxon&vue=detail';
    
    $scope.dataUrl = $scope._appName + '/contact_taxon/' + $routeParams.id;
    $scope.dataId = $routeParams.id;
    $scope.updateUrl = '#/' + $scope._appName + '/edit/taxons/' + $routeParams.id;
    
    $scope.$on('display:init', function(ev, data){
        $scope.title = 'Observation du taxon "' + data.nom_complet + '"';
    });
});

