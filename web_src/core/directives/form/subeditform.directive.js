angular.module('FormDirectives').directive('subeditform', function(){
    return{
        restrict: 'A',
        scope: {
            schema: "=",
            saveUrl: "=saveurl",
            refId: "=refid",
        },
    template: '<div spreadsheet schemaurl="schema" dataref="dataRef" data="data" subtitle=""></div><div style="margin-top: 5px;"><button type="button" class="btn btn-success float-right" ng-click="save()">Enregistrer</button></div>',
        controller: ['$scope', '$rootScope', 'dataServ', 'configServ', 'SpreadSheet', 'userMessages', 'userServ', '$loading', '$q', function($scope, $rootScope, dataServ, configServ, SpreadSheet, userMessages, userServ, $loading, $q){
            $scope.data = {refId: $scope.refId};
            $scope.dataRef = '__items__';

            $scope.save = function(){
                errors = SpreadSheet.hasErrors[$scope.dataRef]();
                if(errors){
                    userMessages.errorMessage = SpreadSheet.errorMessage[$scope.dataRef];
                }
                else{
                    /*
                     * Spinner
                     * */
                    $loading.start('spinner-detail');
                    var dfd = $q.defer();
                    var promise = dfd.promise;
                    promise.then(function(result) {
                        $loading.finish('spinner-detail');
                    });
                    dataServ.put($scope.saveUrl, $scope.data, $scope.saved(dfd), $scope.error(dfd));
                }
            };

            $scope.saved = function(deferred){
                return function(resp){
                    resp.data.ids.forEach(function(item, key){
                        $scope.data.__items__[key].id = item;
                    });
                    deferred.resolve();
                    userMessages.successMessage = "Données ajoutées";
                    $rootScope.$broadcast('subEdit:dataAdded', $scope.data.__items__);
                };
            };

            $scope.error = function(deferred){
                var _errmsg = ''
                return function(resp){
                    deferred.resolve();
                    for(errkey in resp){
                        _errmsg += resp[errkey];
                    }
                    userMessages.errorMessage = _errmsg;
                };
            };
        }]
    };
});

