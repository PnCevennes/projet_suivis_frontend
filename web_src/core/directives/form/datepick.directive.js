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

            if($scope.date && $scope.date.getDate){
                $scope.date = ('00'+$scope.date.getDate()).slice(-2) + '/' + ('00' + ($scope.date.getMonth()+1)).slice(-2) + '/' + $scope.date.getFullYear();
            }

            $scope.$watch('date', function(newval){
                try{
                    newval.setHours(12);
                    $scope.date = newval;
                }
                catch(e){
                    if(newval){
                        try{
                            $scope.date = newval;
                        }
                        catch(e){
                            //$scope.date = $scope.date.replace(/(\d+)-(\d+)-(\d+)/, '$3/$2/$1');
                        }
                    }
                }
            });
        }]
    }
});

