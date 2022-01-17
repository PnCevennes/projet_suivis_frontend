/*
 * Controleur de base
 */
angular.module('appSuiviProtocoles').controller('baseController',
['$scope', '$location', 'dataServ', 'configServ', 'mapService', 'userMessages', 'userServ' ,'RESOURCES',
function($scope, $location, dataServ, configServ, mapService, userMessages, userServ, RESOURCES){
    $scope._appName = null;
    $scope.app = {name: "Suivi des protocoles", menu: []};
    $scope.success = function(resp){
        $scope.user = userServ.getUser();
        if(!$scope.user){
            $location.url('login');
        }
        $scope.data = resp;

        configServ.put('debug', RESOURCES.DEBUG);

        //configServ.put('app', $scope.data[0]);
        //$scope._appName = $scope.data[0].name;

        $scope.$on('user:login', function(ev, user){
            $scope.user = user;

            var app = userServ.getCurrentApp();
            if(!app){
                $location.url('apps');
            }
            else{
                $scope.app = app;
                if($location.path() == '/'){
                    $scope.setActive(app.menu[0]);
                    $location.url(app.menu[0].url.slice(2));
                }
            }
        });

        $scope.$on('user:logout', function(ev){
            $scope.app = {name: "Suivi des protocoles", menu: []};
            $scope.user = null;
        });

        $scope.$on('app:select', function(ev, app){
            $scope.app = app;
            $scope.setActive(app.menu[0]);
        });

        $scope.$on('app:selection', function(ev){
            $scope.app = {name: "Suivi des protocoles", menu: []};
        });
    };

    $scope.setActive = function(item){
        $scope.app.menu.forEach(function(elem){
            if(elem.url == item.url){
                elem.__active__ = true;
            }
            else{
                elem.__active__ = false;
            }
        });
        userServ.setCurrentApp($scope.app);
    };

    $scope.check = function(val){
        return userServ.checkLevel(val);
    };

    configServ.getUrl(RESOURCES.BASE_CONFIG_URL + '?app=suivis&vue=apps', $scope.success);
}]);
