/**
 * Directive qui permet d'avoir un champ de formulaire de type valeur calculée modifiable
 * params: 
 *  data: la source de données du champ (une liste de références aux champs servant au calcul)
 *  refs: une liste du nom des champs à surveiller
 *  model: la source/cible du champ (eq. ng-model)
 *  modifiable: bool -> indique si le champ est modifiable ou en lecture seule
 */
angular.module('FormDirectives').directive('calculated', function(){
    return {
        restrict: 'E',
        scope: {
            id: "@",
            ngclass: "@",
            ngBlur: "=",
            min: '=',
            max: '=',
            data: '=',
            refs: '=',
            model: '=',
            modifiable: '=',
        },
        template: '<input id="{{id}}" ng-blur="ngBlur" class="{{ngclass}}" type="number" min="{{min}}" max="{{max}}" ng-model="model" ng-disabled="!modifiable"/>',
        controller: ['$scope', function($scope){
            angular.forEach($scope.refs, function(elem){
                $scope.$watch(function(){
                    return $scope.data[elem];
                }, function(newval, oldval){
                    //$scope.model += newval-oldval;
                    //if($scope.model<0) $scope.model=0;
                    $scope.model = 0;
                    angular.forEach($scope.refs, function(elem){
                        $scope.model += $scope.data[elem];
                    }, $scope);
                });
            }, $scope);
        }]
    }
});

