/**
 * fonction qui renvoie le label associé à un identifiant
 * paramètres : 
 *  xhrurl ->url du  service web
 *  inputid -> identifiant de l'élément
 */
angular.module('DisplayDirectives').directive('xhrdisplay', function(){
    return {
        restrict: 'A',
        scope: {
            inputid: '=',
            xhrurl: '=',
        },
        template: '{{value}}',
        controller: ['$scope', 'dataServ', function($scope, dataServ){
            $scope.setResult = function(resp){
                $scope.value = resp.label;
            };
            $scope.$watch(function(){return $scope.inputid}, function(newval, oldval){
                if(newval){
                    dataServ.get($scope.xhrurl + '/' + newval, $scope.setResult);
                }
            });
        }]
    };
});

