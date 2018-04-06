/**
 * wrapper pour la directive typeahead permettant de l'utiliser en édition
 * requete inverse au serveur pour obtenir un label lié à l'ID fourni et passage
 * label à la directive pour affichage
 * params supplémentaires:
 *  initial -> l'ID fourni
 *  reverseurl -> l'url permettant d'obtenir le label correspondant à l'ID
 */

//  options="{{field.options}}"
//  option="{{field.options}} contient toutes les options relatives au requetage : url, reverse_url, ...
angular.module('FormDirectives').directive('angucompletewrapper', ['dataServ', '$q', 
    function(dataServ, $q){
    return {
        restrict: 'E',
        scope: {
            inputclass: '@',
            decorated: '@',
            selectedobject: '=',
            ngBlur: '=',
            options: '=',
            initial: '=',
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
                dfd = $q.defer();
                if(txt){
                    if ($scope.options.searchField) {
                        search_url = '?' + $scope.options.searchField + '=' + txt
                    }
                    else {
                        search_url = '/' + txt
                    }
                    
                    dataServ.get($scope.options.url + search_url, function(resp){
                        results = $scope.mapResponse(resp);
                        dfd.resolve(results);
                    });
                    
                }
                else {
                    dfd.resolve();
                }
                return dfd.promise;
            };

            $scope.$watch('localselectedobject', function(newval){
                if(newval && newval.id){
                    $scope.selectedobject = newval.id;
                    elem[0].firstChild.children[1].focus();
                }
            });

            $scope.$watch('initial', function(newval){
                if(newval){
                    dataServ.get($scope.options.reverseurl + '/' + newval, function(resp){
                        results = $scope.mapResponse([resp]);
                        $scope.localselectedobject = results[0];
                    });
                }
                else{
                    $scope.localselectedobject = null;
                }
            });

            $scope.mapResponse = function (resp) {
                results = [];
                resp.forEach(function(r) {
                    results.push({
                        "id" : r[$scope.options.idField],
                        "label" : $scope.options.displayField.map(function(a) {return r[a]}).join(' ')
                    })
                })
                return results;
            }
        }
    };
}]);
