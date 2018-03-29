angular.module('FormDirectives').directive('fileinput', function(){
    return {
        restrict: 'E',
        scope: {
            refer: '=',
            options: '='
        },
        templateUrl: 'js/templates/form/fileinput.htm',
        controller: ['$scope', function($scope){

            $scope.current_upload = null;

            var default_object = {ftype: $scope.options.target};


            if($scope.refer == undefined || $scope.refer == null){
                $scope.refer = [angular.copy(default_object)];
            }
            if(!$scope.refer.length){
                $scope.refer.push(angular.copy(default_object));
            }

            $scope.refer.map(function(item){
                item.ftype = $scope.options.target;
            });

            $scope.items = angular.copy($scope.refer);
            
            $scope.$watch(function(){return $scope.refer}, function(nv, ov){
                if(nv !== ov){
                    $scope.refer = nv || [angular.copy(default_object)]; 
                    if(!$scope.refer.length){
                        $scope.refer.push(angular.copy(default_object));
                    }
                    $scope.items = angular.copy($scope.refer);
                    $scope.refer.map(function(item){
                        item.ftype = $scope.options.target;
                    });
                }
            });

            
            $scope.add_item = function(){
                $scope.refer.push(angular.copy(default_object));
            };

            $scope.remove_item = function(idx){
                $scope.refer.splice(idx, 1);
                if(!$scope.refer.length){
                    $scope.refer.push(angular.copy(default_object));
                }
            };

            $scope.reset_item = function(idx){
                if($scope.items[idx]){
                    $scope.refer[idx] = angular.copy($scope.items[idx]);
                }
                else{
                    $scope.refer[idx] = angular.copy(default_object);
                }
            }

            $scope.is_valid = function(form, idx){
                if(!($scope.refer[idx].titre && $scope.refer[idx].titre.length)){
                    if($scope.refer[idx].path && $scope.refer[idx].path.length){
                        $scope.refer[idx].titre = $scope.refer[idx].path;
                    }
                    else if($scope.refer[idx].url && $scope.refer[idx].url.length){
                        $scope.refer[idx].titre = $scope.refer[idx].url;
                    }
                }
                if(form.$valid){
                    if(($scope.refer[idx].path && $scope.refer[idx].path.length) ^ ($scope.refer[idx].url && $scope.refer[idx].url.length>0)){
                        var valid = !!($scope.refer[idx].titre && $scope.refer[idx].titre.length >= 5);
                        return valid;
                    }
                }
                return false;
            }

            $scope.is_invalid = function(form, idx){
                return !$scope.is_valid(form, idx);
            }
        }]
    };
});

