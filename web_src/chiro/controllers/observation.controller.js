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
