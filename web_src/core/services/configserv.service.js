/**
 * Service de récupération et stockage des configurations
 * Utiliser pour stocker les variables globales ou les éléments de configuration de l'application
 */
angular.module('suiviProtocoleServices').service('configServ', ['dataServ', 'localStorageService', function(dataServ, localStorageService){
    var cache = {};

    this.bc = null;

    /*
     * charge des informations depuis une url si elles ne sont pas déja en cache
     * et les retourne via une callback. Si les variables sont déjà en cache, les 
     * retourne directement.
     * params:
     *  serv: l'url du serveur
     *  success: la callback de traitement
     */
    this.getUrl = function(serv, success){
        if(cache['debug']){
            var data = cache[serv];
        }
        else{
            var data = localStorageService.get(serv);
        }
        if(data){
            success(data);
        }
        else{
            dataServ.get(serv, function(resp){
                if(cache['debug']){
                    cache[serv] = resp;
                }
                else{
                    localStorageService.set(serv, resp);
                }
                success(resp);
            });
        }
    };

    /*
     * retourne une variable globale via la callback success
     * params:
     *  key : le nom de la variable
     *  success : la callback de traitement
     */
    this.get = function(key, success){
        success(cache[key]);
    };


    /*
     * crée ou met à jour une variable globale
     * params:
     *  key : le nom de la variable
     *  data : le contenu
     */
    this.put = function(key, data){
        cache[key] = data;
    };
}]);

