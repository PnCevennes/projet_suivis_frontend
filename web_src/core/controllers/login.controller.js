/*
 * controleur login
 */
angular.module('appSuiviProtocoles').controller('loginController', ['$scope', '$location', '$rootScope', 'userServ', 'userMessages', 'configServ' ,function($scope, $location, $rootScope, userServ, userMessages, configServ){
    if(userServ.getUser()){
        $scope.data = {
            login: userServ.getUser().identifiant,
            pass: userServ.getUser().pass, 
        };
    }
    else{
        $scope.data = {login: null, pass: null};
    }

    $scope.$on('user:login', function(ev, user){
        userMessages.infoMessage = user.nom_complet.replace(/(\w+) (\w+)/, 'Bienvenue $2 $1 !');
        
        $location.url('apps'); 
    });

    $scope.$on('user:error', function(ev){
        userMessages.errorMessage = "Erreur d'identification."
    });

    $scope.send = function(){
        userServ.login($scope.data.login, $scope.data.pass);
    };
}]);

