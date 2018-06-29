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
angular.module('FormDirectives').directive('taxhubangucomplete', ['dataServ', '$q', 'RESOURCES', 
    function(dataServ, $q, RESOURCES){
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
            
            $scope.find = function(txt){
                dfd = $q.defer();
                if(txt){
                    url = "taxref/allnamebylist/" + $scope.options.id_liste + "?search_name=" + txt
                   
                    dataServ.get(url, function(resp){
                        results = $scope.mapResponse(resp);
                        dfd.resolve(results);
                    }, undefined, undefined, RESOURCES.TAXHUB_URL);
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
                    dataServ.get("taxref/" + newval, function(resp){
                        results = $scope.mapResponse([resp]);
                        $scope.localselectedobject = results[0];
                    }, undefined, undefined, RESOURCES.TAXHUB_URL);
                }
                else{
                    $scope.localselectedobject = null;
                }
            });

            $scope.mapResponse = function (resp) {
                results = [];
                resp.forEach(function(r) {
                    results.push({
                        "id" : r['cd_nom'],
                        "label" : r['search_name'] || r['nom_complet']
                    })
                })
                return results;
            }
        }
    };
}]);
