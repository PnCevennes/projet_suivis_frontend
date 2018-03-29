/*
 * controleur pour la carte et la liste des sites
 */
angular.module('baseSites').controller('siteListController', function($scope, $routeParams, dataServ, mapService, configServ,
    $loading, userServ, $q, $timeout){

    var data = [];
    $scope._appName = $routeParams.appName;
    $scope.editAccess = userServ.checkLevel(3);
    $scope.data_url = $routeParams.appName + '/site';
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
        mapService.initialize($scope.schema.mapConfig).then(function(){
            $scope.data = resp.map(function(item){
                mapService.addGeom(item);
                return item.properties;
            });
        });
        $scope.geoms = resp;
        dfd.resolve('loading data');
        if(deferred){
            deferred.resolve('loading data');
        }
    };

    $scope.setSchema = function(schema){
        $scope.schema = schema;

    };

    $timeout(function(){
        configServ.getUrl($scope._appName + '/config/site/list', $scope.setSchema);
    }, 0);

});
