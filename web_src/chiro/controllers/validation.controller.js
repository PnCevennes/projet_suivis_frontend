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
