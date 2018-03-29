/*
 * configuration des routes
 */
angular.module('generiques').config(['$routeProvider', function($routeProvider){
    $routeProvider
        .when('/g/:appName/:viewName/list', {
            controller: 'genericListController',
            templateUrl: 'js/views/generic/list.htm'
        })
        .when('/g/:appName/:viewName/edit', {
            controller: 'genericEditController',
            templateUrl: 'js/views/generic/edit.htm'
        })
        .when('/g/:appName/:viewName/edit/:id', {
            controller: 'genericEditController',
            templateUrl: 'js/views/generic/edit.htm'
        })
        .when('/g/:appName/:viewName/:protocoleReference/edit/:idReference', {
            controller: 'genericEditController',
            templateUrl: 'js/views/generic/edit.htm'
        })
        .when('/g/:appName/:viewName/detail/:id', {
            controller: 'genericDetailController',
            templateUrl: 'js/views/generic/detail.htm'
        });
}]);

require('./generic-detail.controller.js');
require('./generic-edit.controller.js');
require('./generic-list.controller.js');
