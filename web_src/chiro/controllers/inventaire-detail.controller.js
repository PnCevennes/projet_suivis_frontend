/*
 * Détail d'une observation sans site
 */
angular.module('baseObservations').controller('inventaireDetailController', function($scope, $rootScope, $routeParams, dataServ, configServ, mapService){
    $scope._appName = $routeParams.appName;


    $scope.schemaUrl = $scope._appName + '/config/observation/sans-site/detail';
    $scope.dataUrl = $scope._appName + '/observation/' + $routeParams.id;
    $scope.updateUrl = '#!/' + $scope._appName + '/edit/inventaire/' + $routeParams.id;
    $scope.dataId = $routeParams.id;

    $scope.$on('display:init', function(ev, data){
        $scope.title = "Inventaire du " + data.bvDate.replace(/(\d+)-(\d+)-(\d+)/, '$3/$2/$1');
        
        mapService.initialize('js/resources/chiro_obs.json').then(function(){
            mapService.loadData($scope._appName + '/observation').then(function(){
                mapService.selectItem($routeParams.id);
            });
        });

    });
});

