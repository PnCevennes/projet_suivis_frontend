angular.module('generiques').controller('genericEditController', ['$scope', '$routeParams', 'configServ', 'dataServ', 'userServ', '$loading', 'mapService', '$q', '$timeout', 'userMessages', '$location', function($scope, $routeParams, configServ, dataServ, userServ, $loading, mapService, $q, $timeout, userMessages, $location){

    $scope._appName = $routeParams.appName;
    $scope.configUrl = $routeParams.appName + '/config/' + $routeParams.viewName + '/form';

    var _redirectUrl = $routeParams.appName + '/' + $routeParams.viewName + '/';

    if($routeParams.id){
        $scope.saveUrl = $scope._appName + '/' + $routeParams.viewName + '/' + $routeParams.id;
        $scope.dataUrl = null;
        $scope.data = {__origin__: {geom: $routeParams.id}};
    }
    else{
        $scope.saveUrl = $scope._appName + '/' + $routeParams.viewName; 
        $scope.data = {}
    }
    
    $scope.$on('schema:init', function(ev, schema){
        $scope.schema = schema;
        if($routeParams.id){
            $scope.dataUrl = schema.dataUrl + $routeParams.id;
        }

        if($routeParams.protocoleReference){
            schema.groups.forEach(function(_group){
                _group.fields.forEach(function(_field){
                    if(_field.options && (_field.options.referParent || _field.options.ref == 'parent')){
                        $scope.data[_field.name] = $routeParams.idReference;
                    }
                });
            });
        }
    });

    $scope.$on('form:init', function(ev, data){
        if(data[$scope.schema.formTitleRef]){
            $scope.title = $scope.schema.formTitleUpdate + data[$scope.schema.formTitleRef];
        }
        else{
            $scope.title = $scope.schema.formTitleCreate;
        }
    });

    $scope.$on('form:cancel', function(ev, data){
        if($routeParams.id){
            $location.url($scope.schema.formCreateCancelUrl);
        }
        else{
            $location.url(_redirectUrl + data.id);
        }
    });

    $scope.$on('form:create', function(ev, data){
        userMessages.successMessage = $scope.schema.createSuccessMessage;
        $location.url(_redirectUrl + data.id);
    });

    $scope.$on('form:update', function(ev, data){
        userMessages.successMessage = $scope.schema.updateSuccessMessage;
        $location.url(_redirectUrl + data.id);
    });

    $scope.$on('form:delete', function(ev, data){
        userMessages.successMessage = $scope.schema.deleteSuccessMessage;
        dataServ.forceReload = true;
        $location.url($scope.schema.formDeleteRedirectUrl);
    });
}]);

