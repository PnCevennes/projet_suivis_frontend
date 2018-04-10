/*
 *  Liste des observations sans site
 */
angular.module('baseObservations').controller('observationListController', function($scope, $routeParams, dataServ, mapService, configServ, $loading, userServ, $q, $timeout){
    $scope._appName = $routeParams.appName;


    var data = [];
    $scope._appName = $routeParams.appName;
    $scope.editAccess = userServ.checkLevel(2);
    $scope.data_url = $routeParams.appName + '/visites';
    $scope.data = [];

    
    /*
     * Spinner
     * */
    
    $loading.start('spinner-1');
    var dfd = $q.defer();
    var promise = dfd.promise;
    promise.then(function(result) {
        $loading.finish('spinner-1');
    });
    
    $scope.setData = function(resp, deferred){
        $scope.items = resp;
        mapService.initialize('static/configs/suivi_chiro/resources/chiro_obs.json').then(function(){
            $scope.data = resp.map(function(item){
                mapService.addGeom(item);
                return item.properties;
            });
        });
        $scope.geoms = resp;
        dfd.resolve('loading data');

        //reception données filterform
        if(deferred){
            deferred.resolve('loading data');
        }
    };

    $scope.setSchema = function(schema){
        $scope.schema = schema;
    };

    $timeout(function(){
        configServ.getUrl($scope._appName + '/config/observation/sans-site/list', $scope.setSchema);
    }, 0);
});

