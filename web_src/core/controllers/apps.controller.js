/*
 * controleur selection app
 */
angular.module('appSuiviProtocoles').controller('appsController',
    ['$scope', '$location', 'configServ', 'userServ', 'RESOURCES', function($scope, $location, configServ, userServ, RESOURCES){

    if(!userServ.getUser()){
        $location.url('login');
    }
    $scope.user = userServ.getUser();

    $scope.$emit('app:selection');

    $scope.setData = function(resp){
        $scope.apps = resp;
    };

    $scope.select = function(id){
        $scope.apps.app.forEach(function(item){
            if(item.id == id){
                userServ.setCurrentApp(item);
                $scope.$emit('app:select', item);
            }
        });
    };

    configServ.getUrl(RESOURCES.BASE_CONFIG_URL + '?app=suivis&vue=apps', $scope.setData, true);
}]);

