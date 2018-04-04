angular.module('generiques').controller('genericDetailController', [ '$scope', '$routeParams', 'configServ', 'dataServ', 'userServ', '$loading', 'mapService', '$q', '$timeout', function($scope, $routeParams, configServ, dataServ, userServ, $loading, mapService, $q, $timeout){

    $scope._appName = $routeParams.appName;
    $scope.configUrl = '/config?app='+ $routeParams.appName + '&vue=' + $routeParams.viewName + '&vue=detail';
    $scope.dataUrl = null;

    $scope.$on('schema:init', function(ev, schema){
        if(schema){
            $scope.schema = schema;
            $scope.dataUrl = schema.dataUrl + $routeParams.id;
            $scope.dataId = $routeParams.id;
        }
    });

    $scope.$on('display:init', function(ev, data){
        if($scope.schema.mapConfig){
            mapService.initialize($scope.schema.mapConfig).then(function(){
                mapService.loadData($scope.schema.mapData).then(
                    function(){
                        mapService.selectItem($routeParams.id);
                    }
                    );
                $scope.title = data.bsNom;
            });
        }
    });
}]);

