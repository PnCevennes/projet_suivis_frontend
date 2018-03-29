angular.module('DisplayDirectives').directive('breadcrumbs', function(){
    return {
        restrict: 'A',
        scope: {},
        templateUrl: 'js/templates/display/breadcrumbs.htm',
        controller: ['$scope', 'configServ', '$location', function($scope, configServ, $location){
            $scope.bc = [];
            $scope._edit = false;
            $scope._create = false;
            var _generic = false;
            var _url = null;
            var params = $location.path().slice(1).split('/');
            if(params.indexOf('edit') >= 0){
                params.splice(params.indexOf('edit'), 1);
                $scope._edit = true;
                if(!parseInt(params[params.length-1])){
                    $scope._create = true;
                }
            }
            // générique
            if(params[0] == 'g'){
                params.splice(0, 1);
                var _functions = ['list', 'detail'];
                params = params.filter(function(itemName){
                    return (_functions.indexOf(itemName) == -1);
                });
                _generic = true;
            }
            if(params.length == 4){
                if(!parseInt(params[3])){
                    url = params[0] + '/config/breadcrumb?generic='+_generic+'&view=' + params[1]
                }
                else{
                    if($scope._edit){
                        url = params[0] + '/config/breadcrumb?generic='+_generic+'&view=' + params[2] + '&id=' + params[3];
                    }
                    else{
                        url = params[0] + '/config/breadcrumb?generic='+_generic+'&view=' + params[1] + '&id=' + params[3];
                    }
                }
            }
            else if(params.length == 3){
                if(!parseInt(params[2])){
                    url = params[0] + '/config/breadcrumb?generic='+_generic+'&view=' + params[1]
                }
                else{
                    url = params[0] + '/config/breadcrumb?generic='+_generic+'&view=' + params[1]+ '&id=' + params[2];           
                }
            }
            else if(params.length == 2){
                url = params[0] + '/config/breadcrumb?generic='+_generic+'&view=' + params[1];
            }
            configServ.getUrl(url, function(resp){
                $scope.bc = resp;
                configServ.put('currentBc', resp);
            });
        }],
    };
});

