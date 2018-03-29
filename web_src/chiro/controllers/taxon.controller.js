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
