angular.module('baseTaxons').controller('taxonEditController', function($scope, $rootScope, $routeParams, $location, configServ, dataServ, userMessages){
    $scope._appName = $routeParams.appName;
    $rootScope.$broadcast('map:hide');
    
    $scope.configUrl = $scope._appName + '/config/obstaxon/form';
    if($routeParams.id){
        $scope.saveUrl = $scope._appName + '/obs_taxon/' + $routeParams.id;
        $scope.dataUrl = $scope._appName + '/obs_taxon/' + $routeParams.id;
        $scope.data = {};
    }
    else{
        $scope.saveUrl = $scope._appName + '/obs_taxon';
        $scope.data = {fkBvId: $routeParams.obs_id};
    }


    $scope.$on('form:init', function(ev, data){
        if(data.cotxCdNom){
            $scope.title = "Modification de l'observation du taxon";
        }
        else{
            $scope.title = 'Nouveau taxon';
        }
    });

    $scope.$on('form:cancel', function(ev, data){
        if(data.id){
            $location.url($scope._appName + '/taxons/' + data.id);
        }
        else{
            $location.url($scope._appName + '/observation/' + data.fkBvId);
        }
    });

    $scope.$on('form:create', function(ev, data){
        userMessages.infoMessage = "l'observation a été créée avec succès.";
        $location.url($scope._appName + '/taxons/' + data.id);
    });

    $scope.$on('form:update', function(ev, data){
        userMessages.infoMessage = "l'observation a été modifiée avec succès.";
        $location.url($scope._appName + '/taxons/' + data.id);
    });

    $scope.$on('form:delete', function(ev, data){
        userMessages.infoMessage = "le taxon a été retiré avec succès";
        dataServ.forceReload = true;
        var link = null;
        configServ.get('currentBc', function(resp){
            link = resp[resp.length-2].link;
            $location.url(link.slice(2));
        });
    });
});

