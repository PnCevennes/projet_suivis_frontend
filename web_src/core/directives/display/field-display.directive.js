angular.module('DisplayDirectives').directive('fieldDisplay', function(){
    return {
        restrict: 'A',
        scope: {
            field: '=',
            data: '=',
        },
        templateUrl: 'js/templates/display/field.htm',
        controller: ['$scope', 'RESOURCES', function($scope, RESOURCES){
            $scope.api_url = RESOURCES.API_URL;
        }]
    };
});

