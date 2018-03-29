/**
 * génération d'un champ formulaire de type multivalué
 * params:
 *  refer: la valeur source/cible du champ (une liste)
 *  schema: le schema descripteur du champ (cf. doc schemas)
 */
angular.module('FormDirectives').directive('multi', ['userMessages', '$timeout', function(userMessages, $timeout){
    return {
        restrict: 'E',
        scope: {
            refer: '=',
            schema: '=',
        },
        templateUrl: 'js/templates/form/multi.htm',
        link: function($scope, elem){
            $scope.addDisabled = true;
            if(!$scope.refer){
                $scope.refer = [];
            }
            $scope.data = $scope.refer;
            $scope.$watch(function(){return $scope.refer;}, function(newval, oldval){
                if(newval){
                    $scope.data = $scope.refer;
                    if(newval.length == 0){
                        $scope.add(null);
                        $scope.addDisabled = true;
                    }
                    else{
                        $scope.addDisabled = false;
                    }
                }
            });
            $scope.add = function(item){
                $scope.data.push(item || null);
                $scope.$watch(
                    function(){
                        return $scope.data[$scope.data.length-1]
                    },
                    function(newval){
                        if(newval){
                            // protection doublons
                            if($scope.data.indexOf(newval)<$scope.data.length-1){
                                userMessages.errorMessage = "Il y a un doublon dans votre saisie !";
                                $scope.data.pop();
                            }
                            $scope.addDisabled = false;
                        }
                        else{
                            $scope.addDisabled = true;
                        }
                    }
                );
                $timeout(function(){
                    // passage du focus à la ligne créée
                    var name = $scope.schema.name+($scope.data.length-1);
                    try{
                        //cas angucomplete
                        document.getElementById(name).children[0].children[1].focus();
                    }
                    catch(e){
                        document.getElementById(name).focus();
                    }
                }, 0);
            };
            $scope.remove = function(idx){
                $scope.data.splice(idx, 1);
            };
            if($scope.refer && $scope.refer.length==0){
                $scope.add(null);
            }
            else{
            //if($scope.data && $scope.data.length>0){
                $scope.addDisabled = false;
            }
        }
    }
}]);

