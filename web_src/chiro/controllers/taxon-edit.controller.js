angular.module('baseTaxons').controller('taxonEditController', 
    function($scope, $rootScope, $routeParams, $location, configServ, dataServ, userMessages, RESOURCES){
    $scope._appName = $routeParams.appName;
    $rootScope.$broadcast('map:hide');
    
    $scope.configUrl = RESOURCES.BASE_CONFIG_URL + "?app=" + $scope._appName + "&vue=obs_taxon&vue=form";
    if($routeParams.id){
        $scope.saveUrl = $scope._appName + '/contact_taxon/' + $routeParams.id;
        $scope.dataUrl = $scope._appName + '/contact_taxon/' + $routeParams.id;
        $scope.data = {};
    }
    else{
        $scope.saveUrl = $scope._appName + '/contact_taxon';
        $scope.data = {id_base_visit: $routeParams.obs_id};
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
            $location.url($scope._appName + '/observation/' + data.id_base_visit);
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

