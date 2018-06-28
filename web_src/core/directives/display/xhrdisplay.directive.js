/**
 * fonction qui renvoie le label associé à un identifiant
 * paramètres : 
 *  xhroptions -> options du  service web
 *  inputid -> identifiant de l'élément
 */
angular.module('DisplayDirectives').directive('xhrdisplay', function(){
    return {
        restrict: 'A',
        scope: {
            inputid: '=',
            xhroptions: '=',
        },
        template: '{{value}}',
        controller: ['$scope', 'dataServ', function($scope, dataServ){
            $scope.multi = false;

            $scope.setResult = function(resp){
                if ($scope.xhroptions) {
                    value = $scope.xhroptions.displayField.map(function(a) {return resp[a]}).join(' ')
                }
                else {
                    value = resp.label;
                }
                if ($scope.multi) {
                    $scope.value += value + " ";
                }
                else {
                    $scope.value = value;
                }
            };
            $scope.$watch(function(){return $scope.inputid}, function(newval, oldval){
                if(newval){
                    $scope.value = "";
                    if (newval.constructor == Array) {
                        $scope.multi = true;
                        newval.forEach(function(item) {
                            dataServ.get($scope.xhroptions.url + '/' + item, $scope.setResult);
                        });
                    }
                    else {
                        $scope.multi = false;
                        dataServ.get($scope.xhroptions.url + '/' + newval, $scope.setResult);
                    }
                }
            });
        }]
    };
});

