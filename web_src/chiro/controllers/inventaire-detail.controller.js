/*
 * Détail d'une observation sans site
 */
angular.module('baseObservations').controller('inventaireDetailController', function($scope, $rootScope, $routeParams, dataServ, configServ, mapService){
    $scope._appName = $routeParams.appName;

    $scope.schemaUrl = 'config?app='+ $routeParams.appName + '&vue=visite&vue=detail_ssite';
    $scope.dataUrl = $scope._appName + '/visite/' + $routeParams.id;
    $scope.updateUrl = '#/' + $scope._appName + '/edit/inventaire/' + $routeParams.id;
    $scope.dataId = $routeParams.id;

    $scope.$on('display:init', function(ev, data){
        $scope.title = "Inventaire du " + data.visit_date_min.replace(/(\d+)-(\d+)-(\d+)/, '$3/$2/$1');
        
        mapService.initialize('static/configs/suivi_chiro/resources/chiro_obs.json').then(function(){
            mapService.loadData($scope._appName + '/inventaires').then(function(){
                mapService.selectItem($routeParams.id);
            });
        });

    });
});

