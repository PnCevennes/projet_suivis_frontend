/**
 * génération automatique de formulaire à partir d'un json qui représente le schéma du formulaire
 * params:
 *  schema: le squelette du formulaire (cf. doc schémas)
 *  data: le dictionnaire de données source/cible
 *  errors: liste d'erreurs de saisie (dictionnaire {nomChamp: errMessage})
 */
angular.module('FormDirectives').directive('dynform', function(){
    return {
        restrict: 'E',
        scope: {
            name: '@',
            group: '=',
            data: '=',
            errors: '=',
        },
        templateUrl: 'js/templates/form/dynform.htm',
        controller: ['$scope', function($scope){}],
    };
});

