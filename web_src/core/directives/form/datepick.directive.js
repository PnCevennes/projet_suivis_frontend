/*
 * datepicker
 * params:
 *  uid: id du champ
 *  date: valeur initiale format yyyy-MM-dd
 */
angular.module('FormDirectives').directive('datepick', function(){
    return{
        restrict:'A',
        scope: {
            uid: '@',
            date: '=',
            ngrequired: '=',
        },
        templateUrl: 'js/templates/form/datepick.htm',
        controller: ['$scope', function($scope){
            $scope.opened = false;
            console.log($scope.date);
            $scope.toggle = function($event){
                $event.preventDefault();
                $event.stopPropagation();
                $scope.opened = !$scope.opened;
            };

            if($scope.date){
                try {
                    $scope.date_display = new Date($scope.date);
                  } catch (e) {
                    
                }
            }
            $scope.$watch('date_display', function(newval){
                $scope.date = newval.toISOString();
            });
        }]
    }
});

