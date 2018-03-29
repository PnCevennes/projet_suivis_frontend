/**
 * filtre basique - transforme une date yyyy-mm-dd en dd/mm/yyyy pour l'affichage
 */
angular.module('suiviProtocoleServices').filter('datefr', function(){
    return function(input){
        try{
            return input.replace(/^(\d+)-(\d+)-(\d+).*$/i, "$3/$2/$1");
        }
        catch(e){
            return input;
        }
    }
});

