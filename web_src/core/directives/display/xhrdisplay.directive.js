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
            $scope.setResult = function(resp){
                if ($scope.xhroptions) {
                    $scope.value = $scope.xhroptions.displayField.map(function(a) {return resp[a]}).join(' ')
                }
                else {
                    $scope.value = resp.label;
                }
            };
            $scope.$watch(function(){return $scope.inputid}, function(newval, oldval){
                if(newval){
                    dataServ.get($scope.xhroptions.url + '/' + newval, $scope.setResult);
                }
            });
        }]
    };
});

