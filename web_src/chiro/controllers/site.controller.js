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
