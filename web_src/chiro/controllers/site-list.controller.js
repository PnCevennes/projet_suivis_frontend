/*
 * controleur pour la carte et la liste des sites
 */
angular.module('baseSites').controller('siteListController',
function($scope, $routeParams, dataServ, mapService, configServ, $loading, userServ, $q, $timeout){

    var data = [];
    $scope._appName = $routeParams.appName;
    $scope._currentApp = userServ.getCurrentApp();
    $scope._currentMenu =($scope._currentApp.menu.filter(
        function(e){ return e.__active__ == true}
    ))[0]
    $scope.editAccess = userServ.checkLevel(3);
    $scope.data_url = $scope._currentMenu.data_url;
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
        $scope.items = resp.features;
        mapService.initialize($scope.schema.mapConfig).then(function(){
            $scope.data = resp.features.map(function(item){
                mapService.addGeom(item);
                return item.properties;
            });
        });
        $scope.geoms = resp.features;
        dfd.resolve('loading data');
        if(deferred){
            deferred.resolve('loading data');
        }
    };

    $scope.setSchema = function(schema){
        $scope.schema = schema;

    };

    $timeout(function(){
        configServ.getUrl($scope._currentMenu.config_url, $scope.setSchema);
    }, 0);


});
