/*
 * controleur logout
 */
angular.module('appSuiviProtocoles').controller('logoutController', ['$scope', '$location', 'userServ', 'userMessages', 'configServ', function($scope, $location, userServ, userMessages, configServ){
    $scope.$on('user:logout', function(ev){
        userMessages.infoMessage = "Tchuss !";
        $location.url('login');
    });

    userServ.logout();
}]);

