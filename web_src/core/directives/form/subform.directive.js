angular.module('FormDirectives').directive('subform', function(){
    return {
        restrict: 'E',
        scope: {
            refer: '=',
            schema: '=',
        },
        templateUrl: 'js/templates/form/subform.htm',
        controller: ['$scope', function($scope){

            $scope.create_default_object = function() {
                obj = {};
                // Création d'un objet avec les valeurs par défault spécifié dans la config
                // TODO : Finaliser pour tous les types de champs
                $scope.schema.forEach(function(field) {
                    default_value = field.default != undefined ? field.default : null;
                    try {
                        if (field.options.default && field.type == "select") {
                            default_value = field.options.default[0];
                        }
                    }
                    catch(e) {}

                    obj[field.name] = default_value;
                });
                return obj;
            }

            $scope.add_item = function(){
                $scope.refer.push($scope.create_default_object());
            };

            $scope.remove_item = function(idx){
                $scope.refer.splice(idx, 1);
            };

            $scope.reset_item = function(idx){
                if($scope.items[idx]){
                    $scope.refer[idx] = angular.copy($scope.items[idx]);
                }
                else{
                    $scope.refer[idx] = {};
                }
            }

            if($scope.refer == undefined){
                $scope.refer = [$scope.create_default_object()];
            }

            $scope.items = angular.copy($scope.refer);

            $scope.$watch(function(){return $scope.refer}, function(nv, ov){
                if(nv !== ov){
                    $scope.refer = nv || [{}];
                    $scope.items = angular.copy($scope.refer);
                }
            });

        }]
    };
});

