angular.module('DisplayDirectives').directive('detailDisplay', function(){
    return{
        restrict: 'A',
        scope: {
            schemaUrl: '@schemaurl',
            dataUrl: '@dataurl',
            genericDataUrl: '=',
            updateUrl: '@updateurl',
            dataId: '@dataid',
        },
        transclude: true,
        templateUrl: 'js/templates/display/detail.htm',
        controller: ['$scope', '$rootScope', 'dataServ', 'configServ', 'userServ', '$loading', '$q', function($scope, $rootScope, dataServ, configServ, userServ, $loading, $q){
            $scope.subEditing = false;
            /*
             * Spinner
             * */
            $loading.start('spinner-detail');
            var dfd = $q.defer();
            var promise = dfd.promise;
            promise.then(function(result) {
                $loading.finish('spinner-detail');
            });
            
            $scope.setSchema = function(resp){
                $scope.schema = angular.copy(resp);
                $scope.editAccess = userServ.checkLevel($scope.schema.editAccess);
                $scope.subEditAccess = userServ.checkLevel($scope.schema.subEditAccess);
                $rootScope.$broadcast('schema:init', resp);
                //récupération des données
                if($scope.dataUrl){
                    dataServ.get($scope.dataUrl, $scope.setData, function(){dfd.resolve('loading data')});
                }
                else{
                    $scope.$watch('genericDataUrl', function(newval){
                        if(newval){
                            dataServ.get($scope.genericDataUrl, $scope.setData, function(){dfd.resolve('loading data')});
                        }
                    });
                }
            };

            $scope.setData = function(resp){
                $scope.data = angular.copy(resp);
                if(!$scope.editAccess && $scope.schema.editAccessOverride){
                    $scope.editAccess = userServ.isOwner($scope.data[$scope.schema.editAccessOverride]);
                }

                // envoi des données vers le controleur
                $rootScope.$broadcast('display:init', $scope.data);

                // si le schema a un sous-schema (sous-protocole)
                // récupération du sous-schema
                if($scope.schema.subSchemaUrl){
                    configServ.getUrl($scope.schema.subSchemaUrl, $scope.setSubSchema);
                }
                else {
                  dfd.resolve('loading data');
                }
            }

            $scope.setSubSchema = function(resp){
                $scope.subSchema = angular.copy(resp);
                if(!$scope.subSchema.filtering){
                    $scope.subSchema.filtering = {limit: null, fields: []};
                }
                // récupération des données liées au sous-schéma (sous-protocole)
                //dataServ.get($scope.schema.subDataUrl + $scope.dataId, $scope.setSubData);
            }

            $scope.setSubData = function(resp, deferred){
                $scope.subData = angular.copy(resp);
                dfd.resolve('loading data');

                if(deferred){
                    deferred.resolve('loading data');
                }
            }

            $scope.$on('subEdit:dataAdded', function(evt, data){
                $scope.subEditing = false;
                dataServ.forceReload = true;
                dataServ.get($scope.schema.subDataUrl + $scope.dataId, $scope.setSubData);
            });

            $scope.switchEditing = function(){
                $scope.subEditing = !$scope.subEditing;
            }

            $scope.recenter = function(_id){
                $rootScope.$broadcast('map:centerOnSelected', _id);
            }

            // récupération du schéma
            configServ.getUrl($scope.schemaUrl, $scope.setSchema);
        }]
    }
});

