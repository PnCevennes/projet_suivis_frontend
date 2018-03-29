/*
 * controleur selection app
 */
angular.module('appSuiviProtocoles').controller('appsController', ['$scope', '$location', 'configServ', 'userServ', function($scope, $location, configServ, userServ){
    
    if(!userServ.getUser()){
        $location.url('login');
    }

    $scope.$emit('app:selection');

    $scope.setData = function(resp){
        $scope.apps = resp;
    };

    $scope.select = function(id){
        $scope.apps.forEach(function(item){
            if(item.id == id){
                userServ.setCurrentApp(item);
                $scope.$emit('app:select', item);
            }
        });
    };

    configServ.getUrl('config/apps', $scope.setData);
}]);

