/*
 * controleur pour l'édition d'un site
 */
angular.module('baseSites').controller('siteEditController', function($scope, $rootScope, $routeParams, $location,
    $filter, dataServ, mapService, configServ, userMessages, $timeout){

    $scope._appName = $routeParams.appName;
    $scope.configUrl = 'config?app=' + $scope._appName + '&vue=site&vue=form';

    if($routeParams.id){
        $scope.saveUrl = $scope._appName + '/site/' + $routeParams.id;
        $scope.dataUrl = $scope._appName + '/site/' + $routeParams.id;
        $scope.data = {__origin__: {geom: $routeParams.id}};
    }
    else{
        $scope.saveUrl = $scope._appName + '/site';
        $scope.data = {}
    }

    $scope.$on('form:init', function(ev, data){
        if(data.base_site_name){
            $scope.title = 'Modification du site ' + data.base_site_name;
        }
        else{
            $scope.title = 'Nouveau site';
        }
    });

    $scope.$on('form:cancel', function(ev, data){
        $location.url($scope._appName + '/site/');
    });

    $scope.$on('form:create', function(ev, data){
        userMessages.successMessage = 'le site ' + data.base_site_name + ' a été créé avec succès.';
        $location.url($scope._appName + '/site/' + data.id);
    });

    $scope.$on('form:update', function(ev, data){
        userMessages.successMessage = 'le site ' + data.base_site_name + ' a été mis à jour avec succès.';
        $location.url('/' + $scope._appName + '/site/' + data.id);
    });

    $scope.$on('form:delete', function(ev, data){
        userMessages.successMessage = 'le site ' + data.base_site_name + ' a été supprimé.';
        dataServ.forceReload = true;
        $location.url($scope._appName + '/site/');
    });
});
