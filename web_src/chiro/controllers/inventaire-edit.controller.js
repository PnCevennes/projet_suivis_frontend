/*
 * Edition d'une observation sans site
 */
angular.module('baseObservations').controller('inventaireEditController', function($scope, $rootScope, $routeParams, $location, configServ, dataServ, userMessages){
    $scope._appName = $routeParams.appName;
    $scope.configUrl = $scope._appName + '/config/observation/sans-site/form';
    if($routeParams.id){
        $scope.saveUrl = $scope._appName + '/observation/' + $routeParams.id;
        $scope.dataUrl = $scope._appName + '/observation/' + $routeParams.id;
        $scope.data = {__origin__: {geom: $routeParams.id}};
    }
    else{
        $scope.saveUrl = $scope._appName + '/observation';
        $scope.data = {};
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
            $scope.title = "Modification de l'inventaire du " + frDate(data.bvDate)
            // breadcrumbs
        }
        else{
            $scope.title = 'Nouvel inventaire';
        }
    });

    $scope.$on('form:cancel', function(ev, data){
        if(data.id){
            $location.url($scope._appName + '/inventaire/' + data.id);
        }
        else{
            $location.url($scope._appName + '/inventaire');
        }
    });

    $scope.$on('form:create', function(ev, data){
        userMessages.infoMessage = "l'inventaire n° " + data.id + " du " + frDate(data.bvDate) + ' a été créée avec succès.';
        $location.url($scope._appName + '/inventaire/' + data.id);
    });

    $scope.$on('form:update', function(ev, data){
        userMessages.infoMessage = "l'inventaire n° " + data.id + " du " + frDate(data.bvDate) + ' a été mise à jour avec succès.';
        $location.url($scope._appName + '/inventaire/' + data.id);
    });

    $scope.$on('form:delete', function(ev, data){
        userMessages.infoMessage = "l'inventaire n° " + data.id + " du " + frDate(data.bvDate) + " a été supprimé.";
        dataServ.forceReload = true;
        $location.url($scope._appName + '/inventaire');
    });
});


