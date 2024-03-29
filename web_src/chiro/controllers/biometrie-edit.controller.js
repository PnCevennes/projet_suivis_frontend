angular.module('biometrie').controller('biometrieEditController', 
    function($scope, $rootScope, $routeParams, $location, configServ, dataServ, userMessages, RESOURCES){
    $scope._appName = $routeParams.appName;
    $rootScope.$broadcast('map:hide');
    $scope.configUrl =  RESOURCES.BASE_CONFIG_URL + '?app='+ $routeParams.appName + '&vue=biometrie&vue=form'; 
    if($routeParams.id){
        $scope.saveUrl = $scope._appName + '/biometrie/' + $routeParams.id;
        $scope.dataUrl = $scope._appName + '/biometrie/' + $routeParams.id;
        $scope.data = {};
    }
    else{
        $scope.saveUrl = $scope._appName + '/biometrie'
        $scope.data = {id_contact_taxon: parseInt($routeParams.otx_id)};
    }
    $scope.$on('form:init', function(ev, data){
        if($routeParams.id){
            $scope.title = "Modification de la biométrie";
        }
        else{
            $scope.title = 'Nouvelle biométrie';
        }
    });

    $scope.$on('form:cancel', function(ev, data){
        if(data.id){
            $location.url($scope._appName + '/biometrie/' + data.id);
        }
        else{
            $location.url($scope._appName + '/taxons/' + data.id_contact_taxon);
        }
    });

    $scope.$on('form:create', function(ev, data){
        userMessages.infoMessage = "La biométrie n°" + data.id + ' a été créée avec succès.'
        $location.url($scope._appName + '/biometrie/' + data.id);
    });

    $scope.$on('form:update', function(ev, data){
        userMessages.infoMessage = "La biométrie n°" + data.id + ' a été modifiée avec succès.'
        $location.url($scope._appName + '/biometrie/' + data.id);
    });

    $scope.$on('form:delete', function(ev, data){
        userMessages.infoMessage = "La biométrie n°" + data.id + "a été supprimée."; 
        dataServ.forceReload = true;
        $location.url($scope._appName + '/taxons/' + data.id_contact_taxon);
    });
});

