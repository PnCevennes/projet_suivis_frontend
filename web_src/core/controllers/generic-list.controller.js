angular.module('generiques').controller('genericListController', ['$scope', '$routeParams', 'configServ', 'dataServ', 'userServ', '$loading', 'mapService', '$q', '$timeout', function($scope, $routeParams, configServ, dataServ, userServ, $loading, mapService, $q, $timeout){

    $scope._appName = $routeParams.appName;
    $scope.editAccess = false;
    $scope.data_url = '';

    var _configUrl = $routeParams.appName + '/config/' + $routeParams.viewName + '/list';

    // * modifs joel
    _configUrl = 'config?app=' + $routeParams.appName + '&vue=' + $routeParams.viewName + '&vue=list';

    /*
     * Spinner
     * */
    
    $loading.start('spinner-1');
    var dfd = $q.defer();
    var promise = dfd.promise;
    promise.then(function(result) {
        $loading.finish('spinner-1');
    });
    

    $scope.setData = function(resp){
        if($scope.schema.mapConfig){
            $scope.items = resp;
            mapService.initialize($scope.schema.mapConfig).then(function(){
                $scope.data = resp.features.map(function(item){
                    mapService.addGeom(item);
                    return item.properties;
                });
            });
        }
        else{
            $scope.data = resp;
        }
        dfd.resolve('data');
    };


    $timeout(function(){
        configServ.getUrl(_configUrl, function(resp){
            $scope.schema = resp;
            $scope.editAccess = userServ.checkLevel(resp.editAccess);
            $scope.data_url = resp.dataUrl;
        });
    }, 0);
}]);

