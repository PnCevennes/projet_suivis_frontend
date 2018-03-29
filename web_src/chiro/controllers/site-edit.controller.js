/*
 * controleur pour l'édition d'un site
 */
angular.module('baseSites').controller('siteEditController', function($scope, $rootScope, $routeParams, $location,
    $filter, dataServ, mapService, configServ, userMessages, $timeout){

    $scope._appName = $routeParams.appName;
    $scope.configUrl = $scope._appName + '/config/site/form';

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
        if(data.bsNom){
            $scope.title = 'Modification du site ' + data.bsNom;
        }
        else{
            $scope.title = 'Nouveau site';
        }
    });

    $scope.$on('form:cancel', function(ev, data){
        $location.url($scope._appName + '/site/');
    });

    $scope.$on('form:create', function(ev, data){
        userMessages.successMessage = 'le site ' + data.bsNom + ' a été créé avec succès.'
        $location.url($scope._appName + '/site/' + data.id);
    });

    $scope.$on('form:update', function(ev, data){

        userMessages.successMessage = 'le site ' + data.bsNom + ' a été mis à jour avec succès.'
        $location.url($scope._appName + '/site/' + data.id);
    });

    $scope.$on('form:delete', function(ev, data){

        userMessages.successMessage = 'le site ' + data.bsNom + ' a été supprimé.'
        dataServ.forceReload = true;
        $location.url($scope._appName + '/site/');
    });
});
