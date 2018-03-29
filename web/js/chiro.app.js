(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
// module de gestion des sites
angular.module('baseSites', ['suiviProtocoleServices', 'SimpleMap', 'ngRoute', 'ngTable']);

// module de gestion de la validation
angular.module('baseValidation', ['suiviProtocoleServices', 'SimpleMap', 'ngRoute', 'ngTable']);

// module de gestion des observations
angular.module('baseObservations', ['suiviProtocoleServices', 'SimpleMap', 'ngRoute', 'ngTable']);

// module de gestion des taxons
angular.module('baseTaxons', ['suiviProtocoleServices', 'ngRoute', 'ngTable']);

// module de gestion des biometries
angular.module('biometrie', ['suiviProtocoleServices', 'ngRoute']);

require('./controllers/site.controller.js');
require('./controllers/observation.controller.js');
require('./controllers/taxon.controller.js');
require('./controllers/biometrie.controller.js');
require('./controllers/validation.controller.js');


},{"./controllers/biometrie.controller.js":4,"./controllers/observation.controller.js":10,"./controllers/site.controller.js":14,"./controllers/taxon.controller.js":18,"./controllers/validation.controller.js":20}],2:[function(require,module,exports){
angular.module('biometrie').controller('biometrieDetailController', function($scope, $rootScope, $routeParams, configServ, dataServ){

    $scope._appName = $routeParams.appName;
    $scope.schemaUrl = $scope._appName + '/config/biometrie/detail';
    $scope.dataUrl = $scope._appName + '/biometrie/' + $routeParams.id;
    $scope.updateUrl = '#/' + $scope._appName + '/edit/biometrie/' + $routeParams.id;

    $scope.dataId = $routeParams.id;

    $scope.$on('display:init', function(ev, data){
        $scope.title = "Biométrie n°" + data.id;
    });

});


},{}],3:[function(require,module,exports){
angular.module('biometrie').controller('biometrieEditController', function($scope, $rootScope, $routeParams, $location, configServ, dataServ, userMessages){
    $scope._appName = $routeParams.appName;
    $rootScope.$broadcast('map:hide');
    $scope.configUrl = $scope._appName + '/config/biometrie/form';
    if($routeParams.id){
        $scope.saveUrl = $scope._appName + '/biometrie/' + $routeParams.id;
        $scope.dataUrl = $scope._appName + '/biometrie/' + $routeParams.id;
        $scope.data = {};
    }
    else{
        $scope.saveUrl = $scope._appName + '/biometrie'
        $scope.data = {fkCotxId: $routeParams.otx_id};
    }
    $scope.$on('form:init', function(ev, data){
        if($routeParams.id){
            $scope.title = "Modification de la biométrie";
        }
        else{
            $scope.title = 'Nouvelle biométrie';
        }
    });

    $scope.$on('form:cancel', function(ev, data){
        if(data.id){
            $location.url($scope._appName + '/biometrie/' + data.id);
        }
        else{
            $location.url($scope._appName + '/taxons/' + data.fkCotxId);
        }
    });

    $scope.$on('form:create', function(ev, data){
        userMessages.infoMessage = "La biométrie n°" + data.id + ' a été créée avec succès.'
        $location.url($scope._appName + '/biometrie/' + data.id);
    });

    $scope.$on('form:update', function(ev, data){
        userMessages.infoMessage = "La biométrie n°" + data.id + ' a été modifiée avec succès.'
        $location.url($scope._appName + '/biometrie/' + data.id);
    });

    $scope.$on('form:delete', function(ev, data){
        userMessages.infoMessage = "La biométrie n°" + data.id + "a été supprimée."; 
        dataServ.forceReload = true;
        $location.url($scope._appName + '/taxons/' + data.fkCotxId);
    });
});


},{}],4:[function(require,module,exports){
angular.module('biometrie').config(function($routeProvider){
    $routeProvider
        .when('/:appName/biometrie/:id', {
            controller: 'biometrieDetailController',
            templateUrl: 'js/views/biometrie/detail.htm'
        })
        .when('/:appName/edit/biometrie/taxon/:otx_id', {
            controller: 'biometrieEditController',
            templateUrl: 'js/views/biometrie/edit.htm'
        })
        .when('/:appName/edit/biometrie/:id', {
            controller: 'biometrieEditController',
            templateUrl: 'js/views/biometrie/edit.htm'
        })
});

require('./biometrie-detail.controller.js');
require('./biometrie-edit.controller.js');

},{"./biometrie-detail.controller.js":2,"./biometrie-edit.controller.js":3}],5:[function(require,module,exports){
/*
 * Détail d'une observation sans site
 */
angular.module('baseObservations').controller('inventaireDetailController', function($scope, $rootScope, $routeParams, dataServ, configServ, mapService){
    $scope._appName = $routeParams.appName;


    $scope.schemaUrl = $scope._appName + '/config/observation/sans-site/detail';
    $scope.dataUrl = $scope._appName + '/observation/' + $routeParams.id;
    $scope.updateUrl = '#/' + $scope._appName + '/edit/inventaire/' + $routeParams.id;
    $scope.dataId = $routeParams.id;

    $scope.$on('display:init', function(ev, data){
        $scope.title = "Inventaire du " + data.bvDate.replace(/(\d+)-(\d+)-(\d+)/, '$3/$2/$1');
        
        mapService.initialize('js/resources/chiro_obs.json').then(function(){
            mapService.loadData($scope._appName + '/observation').then(function(){
                mapService.selectItem($routeParams.id);
            });
        });

    });
});


},{}],6:[function(require,module,exports){
/*
 * Edition d'une observation sans site
 */
angular.module('baseObservations').controller('inventaireEditController', function($scope, $rootScope, $routeParams, $location, configServ, dataServ, userMessages){
    $scope._appName = $routeParams.appName;
    $scope.configUrl = $scope._appName + '/config/observation/sans-site/form';
    if($routeParams.id){
        $scope.saveUrl = $scope._appName + '/observation/' + $routeParams.id;
        $scope.dataUrl = $scope._appName + '/observation/' + $routeParams.id;
        $scope.data = {__origin__: {geom: $routeParams.id}};
    }
    else{
        $scope.saveUrl = $scope._appName + '/observation';
        $scope.data = {};
    }

    var frDate = function(dte){
        try{
            return dte.getDate() + '/' + dte.getMonth() + '/' + dte.getFullYear();
        }
        catch(e){
            return dte.replace(/^(\w+)-(\w+)-(\w+).*/, '$3/$2/$1');
        }
    }

    $scope.$on('form:init', function(ev, data){
        if(data.bvDate){
            $scope.title = "Modification de l'inventaire du " + frDate(data.bvDate)
            // breadcrumbs
        }
        else{
            $scope.title = 'Nouvel inventaire';
        }
    });

    $scope.$on('form:cancel', function(ev, data){
        if(data.id){
            $location.url($scope._appName + '/inventaire/' + data.id);
        }
        else{
            $location.url($scope._appName + '/inventaire');
        }
    });

    $scope.$on('form:create', function(ev, data){
        userMessages.infoMessage = "l'inventaire n° " + data.id + " du " + frDate(data.bvDate) + ' a été créée avec succès.';
        $location.url($scope._appName + '/inventaire/' + data.id);
    });

    $scope.$on('form:update', function(ev, data){
        userMessages.infoMessage = "l'inventaire n° " + data.id + " du " + frDate(data.bvDate) + ' a été mise à jour avec succès.';
        $location.url($scope._appName + '/inventaire/' + data.id);
    });

    $scope.$on('form:delete', function(ev, data){
        userMessages.infoMessage = "l'inventaire n° " + data.id + " du " + frDate(data.bvDate) + " a été supprimé.";
        dataServ.forceReload = true;
        $location.url($scope._appName + '/inventaire');
    });
});



},{}],7:[function(require,module,exports){
/*
 * Detail d'une observation associée à un site
*/
angular.module('baseObservations').controller('observationDetailController', function($scope, $rootScope, $routeParams, dataServ, configServ, mapService){
    $scope._appName = $routeParams.appName;

    $scope.schemaUrl = $scope._appName + '/config/observation/detail';
    $scope.dataUrl = $scope._appName + '/observation/' + $routeParams.id;
    $scope.updateUrl = '#/' + $scope._appName + '/edit/observation/' + $routeParams.id;
    $scope.dataId = $routeParams.id;

    $scope.$on('display:init', function(ev, data){
        $scope.title = "Visite du " + data.bvDate.replace(/(\d+)-(\d+)-(\d+)/, '$3/$2/$1');

        mapService.initialize('js/resources/chiro_obs.json').then(function(){
            mapService.loadData($scope._appName + '/site').then(function(){
                mapService.selectItem(data.fkBsId);
            });
        });

    });
});


},{}],8:[function(require,module,exports){
/*
 * Edition d'une observation associée à un site
 */
angular.module('baseObservations').controller('observationEditController', function($scope, $rootScope, $routeParams, $location, configServ, dataServ, userMessages){
    $scope._appName = $routeParams.appName;
    $scope.configUrl = $scope._appName + '/config/observation/form';
    if($routeParams.id){
        $scope.saveUrl = $scope._appName + '/observation/' + $routeParams.id;
        $scope.dataUrl = $scope._appName + '/observation/' + $routeParams.id;
        $scope.data = {};
    }
    else{
        $scope.saveUrl = $scope._appName + '/observation';
        $scope.data = {fkBsId: $routeParams.site_id};
    }

    var frDate = function(dte){
        try{
            return dte.getDate() + '/' + dte.getMonth() + '/' + dte.getFullYear();
        }
        catch(e){
            return dte.replace(/^(\w+)-(\w+)-(\w+).*/, '$3/$2/$1');
        }
    }

    $scope.$on('form:init', function(ev, data){
        if(data.bvDate){
            $scope.title = "Modification de la visite du " + frDate(data.bvDate);
            // breadcrumbs
        }
        else{
            $scope.title = 'Nouvelle visite';
        }
    });

    $scope.$on('form:cancel', function(ev, data){
        if(data.id){
            $location.url($scope._appName + '/observation/' + data.id);
        }
        else{
            $location.url($scope._appName + '/site/' + data.fkBsId);
        }
    });

    $scope.$on('form:create', function(ev, data){
        userMessages.infoMessage = "La visite n° " + data.id + " du " + frDate(data.bvDate) + ' a été créée avec succès.';
        $location.url($scope._appName + '/observation/' + data.id);
    });

    $scope.$on('form:update', function(ev, data){
        userMessages.infoMessage = "La visite n° " + data.id + " du " + frDate(data.bvDate) + ' a été mise à jour avec succès.';
        $location.url($scope._appName + '/observation/' + data.id);
    });

    $scope.$on('form:delete', function(ev, data){
        userMessages.infoMessage = "La viste n° " + data.id + " du " + frDate(data.bvDate) + " a été supprimée.";
        dataServ.forceReload = true;
        $location.url($scope._appName + '/site/' + data.fkBsId);
    });
});


},{}],9:[function(require,module,exports){
/*
 *  Liste des observations sans site
 */
angular.module('baseObservations').controller('observationListController', function($scope, $routeParams, dataServ, mapService, configServ, $loading, userServ, $q, $timeout){
    $scope._appName = $routeParams.appName;


    var data = [];
    $scope._appName = $routeParams.appName;
    $scope.editAccess = userServ.checkLevel(2);
    $scope.data_url = $routeParams.appName + '/observation';
    $scope.data = [];

    
    /*
     * Spinner
     * */
    
    $loading.start('spinner-1');
    var dfd = $q.defer();
    var promise = dfd.promise;
    promise.then(function(result) {
        $loading.finish('spinner-1');
    });
    
    $scope.setData = function(resp, deferred){
        $scope.items = resp;
        mapService.initialize('js/resources/chiro_obs.json').then(function(){
            $scope.data = resp.map(function(item){
                mapService.addGeom(item);
                return item.properties;
            });
        });
        $scope.geoms = resp;
        dfd.resolve('loading data');

        //reception données filterform
        if(deferred){
            deferred.resolve('loading data');
        }
    };

    $scope.setSchema = function(schema){
        $scope.schema = schema;
    };

    $timeout(function(){
        configServ.getUrl($scope._appName + '/config/observation/sans-site/list', $scope.setSchema);
    }, 0);
});


},{}],10:[function(require,module,exports){
/*
 * configuration des routes
 */
angular.module('baseObservations').config(function($routeProvider){
    $routeProvider
        .when('/:appName/inventaire', {
            controller: 'observationListController',
            templateUrl: 'js/views/observation/list.htm'
        })
        .when('/:appName/observation/site/:id', {
            controller: 'observationSiteListController',
            templateUrl: 'js/views/observation/list.htm'
        })
        .when('/:appName/inventaire/:id', {
            controller: 'inventaireDetailController',
            templateUrl: 'js/views/observation/detailSsSite.htm'
        })
        .when('/:appName/edit/observation', {
            controller: 'observationEditController',
            templateUrl: 'js/views/observation/edit.htm'
        })
        .when('/:appName/edit/observation/site/:site_id', {
            controller: 'observationEditController',
            templateUrl: 'js/views/observation/edit.htm'
        })
        .when('/:appName/edit/inventaire', {
            controller: 'inventaireEditController',
            templateUrl: 'js/views/observation/edit.htm'
        })
        .when('/:appName/edit/inventaire/:id', {
            controller: 'inventaireEditController',
            templateUrl: 'js/views/observation/edit.htm'
        })
        .when('/:appName/edit/observation/:id', {
            controller: 'observationEditController',
            templateUrl: 'js/views/observation/edit.htm'
        })
        .when('/:appName/observation/:id', {
            controller: 'observationDetailController',
            templateUrl: 'js/views/observation/detail.htm'
        });

});

require('./observation-list.controller.js');
require('./observation-edit.controller.js');
require('./observation-detail.controller.js');
require('./inventaire-detail.controller.js');
require('./inventaire-edit.controller.js');

},{"./inventaire-detail.controller.js":5,"./inventaire-edit.controller.js":6,"./observation-detail.controller.js":7,"./observation-edit.controller.js":8,"./observation-list.controller.js":9}],11:[function(require,module,exports){
/*
 * controleur pour l'affichage basique des détails d'un site
 */
angular.module('baseSites').controller('siteDetailController', function($scope, $rootScope, $routeParams, configServ, userServ, mapService, $timeout){

    $scope._appName = $routeParams.appName;
    $scope.schemaUrl = $scope._appName + '/config/site/detail';
    $scope.dataUrl = $scope._appName + '/site/' + $routeParams.id;
    $scope.dataId = $routeParams.id;
    $scope.updateUrl = '#/' + $scope._appName + '/edit/site/' + $routeParams.id;

    $scope.$on('display:init', function(ev, data){
        if ($scope.schema) $scope.initDisplay(data);
        else {
          configServ.getUrl($scope.schemaUrl, function(schema){
            $scope.setSchema(schema);
            $scope.initDisplay(data);
          });
        }
    });

    $scope.setSchema = function(schema){
        $scope.schema = schema;
    };

    $scope.initDisplay = function(data){
      mapService.initialize($scope.schema.mapConfig).then(function(){
          mapService.loadData($scope._appName + '/site').then(
              function(){
                  mapService.selectItem($routeParams.id);
              }
              );
          $scope.title = data.bsNom;
      });
    }

});

},{}],12:[function(require,module,exports){
/*
 * controleur pour l'édition d'un site
 */
angular.module('baseSites').controller('siteEditController', function($scope, $rootScope, $routeParams, $location,
    $filter, dataServ, mapService, configServ, userMessages, $timeout){

    $scope._appName = $routeParams.appName;
    $scope.configUrl = $scope._appName + '/config/site/form';

    if($routeParams.id){
        $scope.saveUrl = $scope._appName + '/site/' + $routeParams.id;
        $scope.dataUrl = $scope._appName + '/site/' + $routeParams.id;
        $scope.data = {__origin__: {geom: $routeParams.id}};
    }
    else{
        $scope.saveUrl = $scope._appName + '/site';
        $scope.data = {}
    }

    $scope.$on('form:init', function(ev, data){
        if(data.bsNom){
            $scope.title = 'Modification du site ' + data.bsNom;
        }
        else{
            $scope.title = 'Nouveau site';
        }
    });

    $scope.$on('form:cancel', function(ev, data){
        $location.url($scope._appName + '/site/');
    });

    $scope.$on('form:create', function(ev, data){
        userMessages.successMessage = 'le site ' + data.bsNom + ' a été créé avec succès.'
        $location.url($scope._appName + '/site/' + data.id);
    });

    $scope.$on('form:update', function(ev, data){

        userMessages.successMessage = 'le site ' + data.bsNom + ' a été mis à jour avec succès.'
        $location.url($scope._appName + '/site/' + data.id);
    });

    $scope.$on('form:delete', function(ev, data){

        userMessages.successMessage = 'le site ' + data.bsNom + ' a été supprimé.'
        dataServ.forceReload = true;
        $location.url($scope._appName + '/site/');
    });
});

},{}],13:[function(require,module,exports){
/*
 * controleur pour la carte et la liste des sites
 */
angular.module('baseSites').controller('siteListController', function($scope, $routeParams, dataServ, mapService, configServ,
    $loading, userServ, $q, $timeout){

    var data = [];
    $scope._appName = $routeParams.appName;
    $scope.editAccess = userServ.checkLevel(3);
    $scope.data_url = $routeParams.appName + '/site';
    $scope.data = [];


    /*
     * Spinner
     * */

    $loading.start('spinner-1');
    var dfd = $q.defer();
    var promise = dfd.promise;
    promise.then(function(result) {
        $loading.finish('spinner-1');
    });

    $scope.setData = function(resp, deferred){
        $scope.items = resp;
        mapService.initialize($scope.schema.mapConfig).then(function(){
            $scope.data = resp.map(function(item){
                mapService.addGeom(item);
                return item.properties;
            });
        });
        $scope.geoms = resp;
        dfd.resolve('loading data');
        if(deferred){
            deferred.resolve('loading data');
        }
    };

    $scope.setSchema = function(schema){
        $scope.schema = schema;

    };

    $timeout(function(){
        configServ.getUrl($scope._appName + '/config/site/list', $scope.setSchema);
    }, 0);

});

},{}],14:[function(require,module,exports){
/*
 * configuration des routes
 */
angular.module('baseSites').config(function($routeProvider){
    $routeProvider
        .when('/:appName/site', {
            controller: 'siteListController',
            templateUrl: 'js/views/site/list.htm'
        })
        .when('/:appName/edit/site', {
            controller: 'siteEditController',
            templateUrl: 'js/views/site/edit.htm'
        })
        .when('/:appName/edit/site/:id', {
            controller: 'siteEditController',
            templateUrl: 'js/views/site/edit.htm'
        })
        .when('/:appName/site/:id', {
            controller: 'siteDetailController',
            templateUrl: 'js/views/site/detail.htm'
        });
});

require('./site-list.controller.js');
require('./site-edit.controller.js');
require('./site-detail.controller.js');

},{"./site-detail.controller.js":11,"./site-edit.controller.js":12,"./site-list.controller.js":13}],15:[function(require,module,exports){
angular.module('baseTaxons').controller('taxonDetailController', function($scope, $rootScope, $routeParams, configServ, dataServ){

    $scope._appName = $routeParams.appName;
    $scope.schemaUrl = $scope._appName + '/config/obstaxon/detail';
    $scope.dataUrl = $scope._appName + '/obs_taxon/' + $routeParams.id;
    $scope.dataId = $routeParams.id;
    $scope.updateUrl = '#/' + $scope._appName + '/edit/taxons/' + $routeParams.id;
    
    $scope.$on('display:init', function(ev, data){
        $scope.title = 'Observation du taxon "' + data.cotxNomComplet + '"';
    });
});


},{}],16:[function(require,module,exports){
angular.module('baseTaxons').controller('taxonEditController', function($scope, $rootScope, $routeParams, $location, configServ, dataServ, userMessages){
    $scope._appName = $routeParams.appName;
    $rootScope.$broadcast('map:hide');
    
    $scope.configUrl = $scope._appName + '/config/obstaxon/form';
    if($routeParams.id){
        $scope.saveUrl = $scope._appName + '/obs_taxon/' + $routeParams.id;
        $scope.dataUrl = $scope._appName + '/obs_taxon/' + $routeParams.id;
        $scope.data = {};
    }
    else{
        $scope.saveUrl = $scope._appName + '/obs_taxon';
        $scope.data = {fkBvId: $routeParams.obs_id};
    }


    $scope.$on('form:init', function(ev, data){
        if(data.cotxCdNom){
            $scope.title = "Modification de l'observation du taxon";
        }
        else{
            $scope.title = 'Nouveau taxon';
        }
    });

    $scope.$on('form:cancel', function(ev, data){
        if(data.id){
            $location.url($scope._appName + '/taxons/' + data.id);
        }
        else{
            $location.url($scope._appName + '/observation/' + data.fkBvId);
        }
    });

    $scope.$on('form:create', function(ev, data){
        userMessages.infoMessage = "l'observation a été créée avec succès.";
        $location.url($scope._appName + '/taxons/' + data.id);
    });

    $scope.$on('form:update', function(ev, data){
        userMessages.infoMessage = "l'observation a été modifiée avec succès.";
        $location.url($scope._appName + '/taxons/' + data.id);
    });

    $scope.$on('form:delete', function(ev, data){
        userMessages.infoMessage = "le taxon a été retiré avec succès";
        dataServ.forceReload = true;
        var link = null;
        configServ.get('currentBc', function(resp){
            link = resp[resp.length-2].link;
            $location.url(link.slice(2));
        });
    });
});


},{}],17:[function(require,module,exports){
angular.module('baseTaxons').controller('taxonListController', function(){
    $scope._appName = $routeParams.appName;
});


},{}],18:[function(require,module,exports){
/*
 * configuration des routes
 */
angular.module('baseTaxons').config(function($routeProvider){
    $routeProvider
        .when('/:appName/taxons', {
            controller: 'taxonListController',
            templateUrl: 'js/views/taxon/list.htm'
        })
        .when('/:appName/taxons/:id', {
            controller: 'taxonDetailController',
            templateUrl: 'js/views/taxon/detail.htm'
        })
        .when('/:appName/edit/taxons', {
            controller: 'taxonEditController',
            templateUrl: 'js/views/taxon/edit.htm'
        })
        .when('/:appName/edit/taxons/observation/:obs_id', {
            controller: 'taxonEditController',
            templateUrl: 'js/views/taxon/edit.htm'
        })
        .when('/:appName/edit/taxons/:id', {
            controller: 'taxonEditController',
            templateUrl: 'js/views/taxon/edit.htm'
        });
});

require('./taxon-list.controller.js');
require('./taxon-edit.controller.js');
require('./taxon-detail.controller.js');

},{"./taxon-detail.controller.js":15,"./taxon-edit.controller.js":16,"./taxon-list.controller.js":17}],19:[function(require,module,exports){
angular.module('baseValidation').controller('validationListController', function($scope, $rootScope, ngTableParams, $routeParams, $loading, $q, $timeout, dataServ, configServ, userServ, mapService){

    $scope._appName = $routeParams.appName;
    $scope.geoms = [];
    $scope.data = [];
    $scope.selection = [];
    $scope.action = 55;
    $scope.data_url = $routeParams.appName + '/obs_taxon';
    var data = [];
    var checked = [];
    $scope.checkedSelection = checked;
    
    /*
     * Spinner
     * */
    $loading.start('spinner-1');
    var dfd = $q.defer();
    var promise = dfd.promise;
    promise.then(function(result) {
        $loading.finish('spinner-1');
    });

    $scope.changed = function(actID){
        $scope.action = actID;
    };


    $scope.send = function(){
        var act = {action: $scope.action, selection: $scope.selection};
        dataServ.post($scope._appName + '/validate_taxon', act, function(resp){
            checked.forEach(function(item){
                item.cotxObjStatusValidation = $scope.action;
                item.cotxValidateur = userServ.getUser().nom_complet;
                var today = new Date();
                item.cotxDateValidation = today.getFullYear() + '-' + ('00'+(today.getMonth()+1)).slice(-2) + '-' + today.getDate();
            });
        });
    };
 
    $scope.clear = function(emit){
        $scope.selection.splice(0);
        checked.splice(0);
        if(emit===true){
            $rootScope.$broadcast('chiro/validation:clearChecked');
        }
    };

    $scope.$on('chiro/validation:cleared', function(){
        $scope.clear();
    });
   
    $scope.setData = function(resp, deferred){
        $scope.selection.splice(0);
        checked.splice(0);

        mapService.initialize('js/resources/chiro_obs.json').then(function(){
            $scope.$on('chiro/validation:ngTable:itemChecked', function(ev, item){
                if(item._checked){
                    if(checked.indexOf(item)==-1){
                        checked.push(item);
                    }
                }
                else{
                    if(checked.indexOf(item)>=-1){
                        checked.splice(checked.indexOf(item), 1);
                    }
                }
                var checked_ids = [];
                checked.forEach(function(item){
                    checked_ids.push(item.id);
                });
                $scope.selection = checked_ids;
            });

            var tmp = [];
            $scope.items = resp;
            resp.forEach(function(item){
                tmp.push(item.properties);
                mapService.addGeom(item);
            });
            //$scope.geoms = resp;
            $scope.data = tmp;

            dfd.resolve('loading data');
            //réception données filterForm
            if(deferred){
                deferred.resolve('loading data');
            }
        });
    };

    $timeout(function(){
        configServ.getUrl($scope._appName + '/config/obstaxon/validation', function(resp){
            $scope.schema = resp;
        });
    }, 0);
});


},{}],20:[function(require,module,exports){
/*
 * configuration des routes
 */
angular.module('baseValidation').config(function($routeProvider){
    $routeProvider
        .when('/:appName/validation', {
            controller: 'validationListController',
            templateUrl: 'js/views/validation/list.htm'
        });
});

require('./validation-list.controller.js');

},{"./validation-list.controller.js":19}]},{},[1]);
