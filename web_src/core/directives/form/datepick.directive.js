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

            $scope.toggle = function($event){
                $event.preventDefault();
                $event.stopPropagation();
                $scope.opened = !$scope.opened;
            };

            $scope.$watch('date', function(newval){
                if ($scope.date){
                    try {
                        $scope.date_display = new Date($scope.date);
                    } catch (e) {
                        console.log(e); 
                    }
                }
            });

            $scope.$watch('date_display', function(newval){
                if (newval) {
                    $scope.date = newval.toISOString();
                }
            });
        }]
    }
});

