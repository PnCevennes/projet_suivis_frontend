/**
 * wrapper pour la directive typeahead permettant de l'utiliser en édition
 * requete inverse au serveur pour obtenir un label lié à l'ID fourni et passage
 * label à la directive pour affichage
 * params supplémentaires:
 *  initial -> l'ID fourni
 *  reverseurl -> l'url permettant d'obtenir le label correspondant à l'ID
 */
angular.module('FormDirectives').directive('angucompletewrapper', ['dataServ', '$http', function(dataServ, $http){
    return {
        restrict: 'E',
        scope: {
            inputclass: '@',
            decorated: '@',
            selectedobject: '=',
            ngBlur: '=',
            url: '@',
            initial: '=',
            reverseurl: '@',
            ngrequired: '=',
        },
        transclude: true,
        templateUrl: 'js/templates/form/autoComplete.htm',
        link: function($scope, elem){
            $scope.localselectedobject = '';
            $scope.testIsNull = function(){
                if($('#aw')[0].value == ''){
                    $scope.selectedobject = null;
                }
            };

            $scope.find = function(txt){
                if(txt){
                    return $http.get($scope.url + txt).then(function(resp){
                        return resp.data;
                    });
                }
            };

            $scope.$watch('localselectedobject', function(newval){
                if(newval && newval.id){
                    $scope.selectedobject = newval.id;
                    elem[0].firstChild.children[1].focus();
                }
            });

            $scope.$watch('initial', function(newval){
                if(newval){
                    dataServ.get($scope.reverseurl + '/' + newval, function(resp){
                        $scope.localselectedobject = resp;
                    });
                }
                else{
                    $scope.localselectedobject = null;
                }
            });
        }
    };
}]);
