/*
 * Edition d'une observation sans site
 */
angular.module('baseObservations').controller('inventaireEditController', 
    function($scope, $rootScope, $routeParams, $location, dataServ, userMessages, RESOURCES){
    $scope._appName = $routeParams.appName;
    $scope.configUrl = RESOURCES.BASE_CONFIG_URL + '?app='+ $routeParams.appName + '&vue=visite&vue=form_ssite';

    if($routeParams.id){
        $scope.saveUrl = $scope._appName + '/visite/' + $routeParams.id;
        $scope.dataUrl = $scope._appName + '/visite/' + $routeParams.id;
        $scope.data = {__origin__: {geom: $routeParams.id}};
    }
    else{
        $scope.saveUrl = $scope._appName + '/visite';
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
        if(data.visit_date_min){
            $scope.title = "Modification de l'inventaire du " + frDate(data.visit_date_min)
            // breadcrumbs
        }
        else{
            $scope.title = 'Nouvel inventaire';
        }
    });

    $scope.$on('form:cancel', function(ev, data){
        if(data.id_base_visit){
            $location.url($scope._appName + '/inventaire/' + data.id);
        }
        else{
            $location.url($scope._appName + '/inventaire');
        }
    });

    $scope.$on('form:create', function(ev, data){
        userMessages.infoMessage = "l'inventaire n° " + data.id + " du " + frDate(data.visit_date_min) + ' a été créée avec succès.';
        $location.url($scope._appName + '/inventaire/' + data.id);
    });

    $scope.$on('form:update', function(ev, data){
        userMessages.infoMessage = "l'inventaire n° " + data.id + " du " + frDate(data.visit_date_min) + ' a été mise à jour avec succès.';
        $location.url($scope._appName + '/inventaire/' + data.id);
    });

    $scope.$on('form:delete', function(ev, data){
        userMessages.infoMessage = "l'inventaire n° " + data.id + " du " + frDate(data.visit_date_min) + " a été supprimé.";
        dataServ.forceReload = true;
        $location.url($scope._appName + '/inventaire');
    });
});


