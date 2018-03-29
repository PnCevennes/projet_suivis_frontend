/*
 * Edition d'une observation associée à un site
 */
angular.module('baseObservations').controller('observationEditController', function($scope, $rootScope, $routeParams, $location, configServ, dataServ, userMessages){
    $scope._appName = $routeParams.appName;
    $scope.configUrl = $scope._appName + '/config/observation/form';
    if($routeParams.id){
        $scope.saveUrl = $scope._appName + '/observation/' + $routeParams.id;
        $scope.dataUrl = $scope._appName + '/observation/' + $routeParams.id;
        $scope.data = {};
    }
    else{
        $scope.saveUrl = $scope._appName + '/observation';
        $scope.data = {fkBsId: $routeParams.site_id};
    }

    var frDate = function(dte){
        try{
            return dte.getDate() + '/' + dte.getMonth() + '/' + dte.getFullYear();
        }
        catch(e){
            return dte.replace(/^(\w+)-(\w+)-(\w+).*/, '$3/$2/$1');
        }
    }

    $scope.$on('form:init', function(ev, data){
        if(data.bvDate){
            $scope.title = "Modification de la visite du " + frDate(data.bvDate);
            // breadcrumbs
        }
        else{
            $scope.title = 'Nouvelle visite';
        }
    });

    $scope.$on('form:cancel', function(ev, data){
        if(data.id){
            $location.url($scope._appName + '/observation/' + data.id);
        }
        else{
            $location.url($scope._appName + '/site/' + data.fkBsId);
        }
    });

    $scope.$on('form:create', function(ev, data){
        userMessages.infoMessage = "La visite n° " + data.id + " du " + frDate(data.bvDate) + ' a été créée avec succès.';
        $location.url($scope._appName + '/observation/' + data.id);
    });

    $scope.$on('form:update', function(ev, data){
        userMessages.infoMessage = "La visite n° " + data.id + " du " + frDate(data.bvDate) + ' a été mise à jour avec succès.';
        $location.url($scope._appName + '/observation/' + data.id);
    });

    $scope.$on('form:delete', function(ev, data){
        userMessages.infoMessage = "La viste n° " + data.id + " du " + frDate(data.bvDate) + " a été supprimée.";
        dataServ.forceReload = true;
        $location.url($scope._appName + '/site/' + data.fkBsId);
    });
});

