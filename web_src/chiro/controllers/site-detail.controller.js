/*
 * controleur pour l'affichage basique des détails d'un site
 */
angular.module('baseSites').controller('siteDetailController', function($scope, $rootScope, $routeParams, configServ, userServ, mapService, $timeout){

    $scope._appName = $routeParams.appName;
    $scope.schemaUrl = 'config?app='+ $routeParams.appName + '&vue=site&vue=detail';
    $scope.dataUrl = $scope._appName + '/site/' + $routeParams.id;
    $scope.dataId = $routeParams.id;
    $scope.updateUrl = '#/' + $scope._appName + '/edit/site/' + $routeParams.id;

    $scope.$on('display:init', function(ev, data){
        if ($scope.schema) $scope.initDisplay(data);
        else {
          configServ.getUrl($scope.schemaUrl, function(schema){
            $scope.setSchema(schema);
            $scope.initDisplay(data);
          });
        }
    });

    $scope.setSchema = function(schema){
        $scope.schema = schema;
    };

    $scope.initDisplay = function(data){
      mapService.initialize($scope.schema.mapConfig).then(function(){
          mapService.loadData($scope.schema.mapData).then(
              function(){
                  mapService.selectItem($routeParams.id);
              }
              );
          $scope.title = data.base_site_name;
      });
    }

});
