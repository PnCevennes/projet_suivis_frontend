
/*
 * Configuration des routes
 */
angular.module('appSuiviProtocoles').config(['$routeProvider', function($routeProvider){
    $routeProvider
        .when('/', {
            controller: 'baseController',
            templateUrl: 'js/templates/index.htm'
        })
        .when('/login', {
            controller: 'loginController',
            templateUrl: 'js/views/login.htm',
        })
        .when('/logout', {
            controller: 'logoutController',
            templateUrl: 'js/templates/index.htm'
        })
        .when('/apps', {
            controller: 'appsController',
            templateUrl: 'js/views/appSelection.htm'
        })
        .otherwise({redirectTo: '/'});
}]);

angular.module('appSuiviProtocoles').config(['localStorageServiceProvider', function (localStorageServiceProvider) {
    localStorageServiceProvider.setPrefix('projetSuivis');
    localStorageServiceProvider.setStorageType('sessionStorage');
}])

require('./base.controller.js');
require('./login.controller.js');
require('./logout.controller.js');
require('./apps.controller.js');
