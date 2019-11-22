angular.module('FormDirectives').directive('multisel', function(){
    return {
        restrict: 'E',
        templateUrl: 'js/templates/form/multisel.htm',
        scope: {
            schema: '=',
            data: '=',
        },
        controller: ['$scope', function($scope){
            // $scope.$watch('schema', function(nv, ov){
            //     console.log($scope.schema);
            // });
            if(!$scope.data){
                $scope.data = [];
            }
            if(!$scope.data.push){
                //données anciennes
                $scope.data = [$scope.data];
            }
            $scope.tmp_data = {};

            $scope.$watch('data', function(nv, ov){
                if(nv !== undefined){
                    if(nv === null ){
                        $scope.data = [];
                    }
                    if(!nv.push){
                        $scope.data = [nv];
                    }
                    try{
                        $scope.data.forEach(function(value){
                            $scope.tmp_data[value] = true;
                        });
                    }
                    catch(e){

                    }
                }
            });
            $scope.update_values = function(){
                for(key in $scope.tmp_data){
                    key = parseInt(key);
                    if($scope.tmp_data[key]){
                        if($scope.data.indexOf(key) === -1){
                            $scope.data.push(key);
                        }
                    }
                    else{
                        var idx = $scope.data.indexOf(key);
                        if( idx !== -1){
                            $scope.data.splice(idx, 1);
                        }                        
                    }
                }
            }
        }]
    };
});

