/**
 * Service de gestion des communications avec le serveur
 */
angular.module('suiviProtocoleServices').service('dataServ', 
['$http', '$filter', 'userMessages', 'RESOURCES', function($http, $filter, userMessages, RESOURCES){
    //cache de données pour ne pas recharger systématiquement les données du serveur
    var cache = {};

    //flag ordonnant la recharge des données plutôt que l'utilisation du cache
    this.forceReload = false;
    this.baseurl = RESOURCES.API_URL;
    // this.baseurl = 'http://localhost:8000/';

    /*
     * contacte le serveur en GET et met en cache les données renvoyées
     * Si les données sont déja en cache, retourne le données directement, à moins 
     * que le flag forceReload ou le paramtre "force" soient true, auquel cas le serveur
     * est recontacté et les données renvoyées écrasent le cache.
     * retourne les données via la callback success
     *
     * params:
     *  url: l'url à contacter
     *  success: la callback à utiliser pour traiter les données
     *  error: une callback appelée en cas d'erreur gérable
     *  force: flag permettant de forcer le rechargement des données plutot que l'utilisation
     *         du cache
     *  baseurl : permet de spécifier l'url du serveur de l'API
     */
    this.get = function(url, success, error, force, baseurl=RESOURCES.API_URL){
        // if (!baseurl) baseurl = this.baseurl;
        // ne recharger les données du serveur que si le cache est vide ou 
        // si l'option force est true
        if(!error){
            error = function(err){console.log(err)};
        }
        if(cache[url] == undefined || force || this.forceReload){
            $http.get(baseurl + url, { withCredentials: true })
                .then(function(data){
                    this.forceReload = false;
                    cache[url] = data.data;
                    success(data.data);
                },
                function(err){
                    switch(err.status){
                        case 500: 
                            userMessages.errorMessage = "Erreur serveur ! Si cette erreur se reproduit, contactez un administrateur.";
                            break;
                        case 404: 
                            userMessages.errorMessage = "Erreur : Donnée inexistante";
                            break;
                        case 403: 
                            userMessages.errorMessage = "Vous n'êtes pas autorisé à effectuer cette action";
                            break;
                        case 400: 
                            userMessages.errorMessage = "Données inutilisables";
                            break;
                        case 302: 
                            userMessages.errorMessage = "Droits insuffisants";
                            break;
                        default: userMessages.errorMessage = "Erreur !";
                    };
                    error(err);
                }
            );
        }
        else{
            success(cache[url]);
        }
    };

    /*
     * contacte le serveur en POST et renvoie le résultat via la callback success
     * aucune donnée n'est mise en cache
     * params: 
     *  url: l'url à contacter
     *  data: les données POST
     *  success: la callback de traitement de la réponse du serveur
     *  error: la callback de traitement en cas d'erreur gérable
     */
    this.post = function(url, data, success, error){
        $http.post(
            this.baseurl + url, data, { withCredentials: true }
        ).then(
            success,
            error || function(err){console.log(err);}
        );
    };

    /*
     * contacte le serveur en PUT et renvoie le résultat via la callback success
     * params:
     *  cf. this.post
     */
    this.put = function(url, data, success, error){
        $http.put(this.baseurl + url, data, { withCredentials: true }).then(
            success,
            error || function(err){console.log(err);}
        );
    };

    /*
     * contacte le serveur en DELETE
     * params:
     *  url: l'url à contacter
     *  success: la callback de traitement de la réponse du serveur
     *  error: la callback de traitement en cas d'erreur gérable
     */
    this.delete = function(url, success, error){
        $http.delete(this.baseurl + url, { withCredentials: true }).then(
            success,
            error || function(err){console.log(err);}
        );
    };

}]);

