/**
 * Affichage du label d'une liste déroulante à partir de son identifiant
 */
angular.module('suiviProtocoleServices').filter('tselect', ['$filter', function($filter){
    return function(input, param){
        if(!param){
            return 'Non renseigné';
        }
        var res = $filter('filter')(input, {id: param}, function(act, exp){return act==exp;});
        try{
            return res[0].libelle;
        }
        catch(e){
            return 'Erreur : Valeur incompatible'; //Erreur censée ne jamais arriver.
        }
    }
}]);

