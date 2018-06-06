/*
 * Detail d'une observation associée à un site
*/
angular.module('baseObservations').controller('observationDetailController', function($scope, $rootScope, $routeParams, dataServ, configServ, mapService){
    $scope._appName = $routeParams.appName;

    $scope.schemaUrl = 'config?app='+ $routeParams.appName + '&vue=visite&vue=detail';
    $scope.dataUrl = $scope._appName + '/visite/' + $routeParams.id;
    $scope.updateUrl = '#/' + $scope._appName + '/edit/observation/' + $routeParams.id;
    $scope.dataId = $routeParams.id;

    $scope.$on('display:init', function(ev, data){
        $scope.title = "Visite du " + data.visit_date.replace(/(\d+)-(\d+)-(\d+)/, '$3/$2/$1');

        mapService.initialize('static/configs/suivi_chiro/resources/chiro_obs.json').then(function(){
            mapService.loadData('suivi_chiro/sites').then(function(){
                mapService.selectItem(data.id_base_site);
            });
        });

    });
});

