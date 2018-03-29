angular.module('FormDirectives').directive('tableFieldset', function(){
    return {
        restrict: 'E',
        scope: {
            group: '=',
            data: '=',
            errors: '=',
        },
        templateUrl: 'js/templates/form/tableFieldset.htm',
        controller: ['$scope', function($scope){}],
    };
});

