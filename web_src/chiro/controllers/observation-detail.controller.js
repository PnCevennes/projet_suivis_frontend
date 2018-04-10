/*
 * Detail d'une observation associée à un site
*/
angular.module('baseObservations').controller('observationDetailController', function($scope, $rootScope, $routeParams, dataServ, configServ, mapService){
    $scope._appName = $routeParams.appName;

    $scope.schemaUrl = 'config?app='+ $routeParams.appName + '&vue=visite&vue=detail';
    $scope.dataUrl = $scope._appName + '/observation/' + $routeParams.id;
    $scope.updateUrl = '#!/' + $scope._appName + '/edit/observation/' + $routeParams.id;
    $scope.dataId = $routeParams.id;

    $scope.$on('display:init', function(ev, data){
        $scope.title = "Visite du " + data.bvDate.replace(/(\d+)-(\d+)-(\d+)/, '$3/$2/$1');

        mapService.initialize('js/resources/chiro_obs.json').then(function(){
            mapService.loadData($scope._appName + '/site').then(function(){
                mapService.selectItem(data.fkBsId);
            });
        });

    });
});

