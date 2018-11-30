/*
 * time
 * params:
 *  uid: id du champ
 *  date: valeur initiale format yyyy-MM-dd
 */
angular.module('FormDirectives').directive('time', function(){
    return{
        restrict:'A',
        scope: {
            uid: '@',
            time: '=',
            ngrequired: '=',
        },
        // templateUrl: 'js/templates/form/datepick.htm',
        controller: ['$scope', function($scope){
            $scope.opened = false;

            $scope.toggle = function($event){
                $event.preventDefault();
                $event.stopPropagation();
                $scope.opened = !$scope.opened;
            };

            $scope.$watch('time', function(newval){
                if ($scope.time){
                    try {

                        $scope.time_display = newval;
                    } catch (e) {
                        console.log(e); 
                    }
                }
            });

            $scope.$watch('time_display', function(newval){
                if (newval) {
                    $scope.time = newval;
                }
            });
        }]
    }
});

