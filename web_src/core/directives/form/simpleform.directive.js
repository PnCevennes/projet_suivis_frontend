/*
 * directive pour l'affichage simple d'un formulaire
 * params: 
 *  saveurl : l'url à laquelle seront envoyées les données
 *  schemaUrl : l'url du schéma descripteur du formulaire
 *  dataurl : url pour récupérer les données en édition
 *  data : conteneur de données (complété par les données obtenues par l'url *
 */
angular.module('FormDirectives').directive('simpleform', function(){
    return {
        restrict: 'A',
        scope: {
            saveUrl: '=saveurl',
            schemaUrl: '=schemaurl',
            dataUrl: '=dataurl',
            data: '='
        },
        transclude: true,
        templateUrl: 'js/templates/simpleForm.htm',
        controller: ['$scope', '$rootScope', 'configServ', 'dataServ', 'userServ', 'userMessages', '$loading', '$q', 'SpreadSheet', '$uibModal', '$location', '$timeout', function($scope, $rootScope, configServ, dataServ, userServ, userMessages, $loading, $q, SpreadSheet, $uibModal, $location, $timeout){
            var dirty = true;
            var editAccess = false;
            $scope.errors = {};
            $scope.currentPage = 0;
            $scope.addSubSchema = false;
            $scope.isActive = [];
            $scope.isDisabled = [];
            configServ.get('debug', function(value){
                $scope.debug = value;   
            });
            /*
             * Spinner
             * */
            $loading.start('spinner-form');
            var dfd = $q.defer();
            var promise = dfd.promise;
            promise.then(function(result) {
                $loading.finish('spinner-form');
            });

            $scope.openConfirm = function(txt){
                var modInstance = $uibModal.open({
                    templateUrl: 'js/templates/modalConfirm.htm',
                    resolve: {txt: function(){return txt}},
                    controller: function($uibModalInstance, $scope, txt){
                        $scope.txt = txt;
                        $scope.ok = function(){
                            $uibModalInstance.close();
                        };
                        $scope.cancel = function(){
                            $uibModalInstance.dismiss('cancel');
                        }
                    }
                });
                return modInstance.result;
            }
            
            
            $scope.prevPage = function(){
                if($scope.currentPage > 0){
                    $scope.isActive[$scope.currentPage] = false;
                    $scope.currentPage--;
                    $scope.isActive[$scope.currentPage] = true;
                }
            };

            $scope.nextPage = function(){
                if($scope.currentPage < $scope.isActive.length-1){
                    $scope.isActive[$scope.currentPage] = false;
                    $scope.isDisabled[$scope.currentPage] = false;
                    $scope.currentPage++;
                    $scope.isActive[$scope.currentPage] = true;
                    $scope.isDisabled[$scope.currentPage] = false;
                }
            };

            $scope.hasNext = function(idx){
                if($scope.addSubSchema){
                    return idx < $scope.isActive.length;
                }
                return idx < ($scope.isActive.length - 1);
            };

            $scope.isFormValid = function(){
                for(i=0; i<$scope.schema.groups.length; i++){
                    if($scope.Simpleform['sub_'+i]){
                        if(!$scope.Simpleform['sub_'+i].$valid){
                            return false;
                        }
                    }
                    else{
                        return false;
                    }
                }
                return true;
                //return $scope.Simpleform.$valid;
            }

            $scope.setSchema = function(resp){
                $scope.schema = angular.copy(resp);

                editAccess = userServ.checkLevel(resp.editAccess)
                
                // mise en place tabulation formulaire
                $scope.schema.groups.forEach(function(group){
                    $scope.isActive.push(false);
                    $scope.isDisabled.push(!$scope.dataUrl);
                    group.fields.forEach(function(field){
                        if(field.type=='group'){
                            field.fields.forEach(function(sub){
                                if(!sub.options){
                                    sub.options = {};
                                }
                            });

                        }
                        else{
                            if(!field.options){
                                field.options = {};
                            }
                        }
                        field.options.readOnly = !userServ.checkLevel(field.options.editLevel || 0);
                        field.options.dismissed = !userServ.checkLevel(field.options.restrictLevel || 0);
                    });
                });
                $scope.isActive[0] = true;
                $scope.isDisabled[0] = false;

                $rootScope.$broadcast('schema:init', resp);

                if($scope.dataUrl){
                    dataServ.get($scope.dataUrl, $scope.setData);
                }
                else{
                    $scope.$watch('dataUrl', function(newval){
                        if(newval){
                            dataServ.get(newval, $scope.setData);
                        }
                    });
                    if($scope.schema.subSchemaAdd && userServ.checkLevel($scope.schema.subSchemaAdd)){
                        $scope.addSubSchema = true;
                        $scope.isActive.push(false);
                    }
                    $scope.setData($scope.data || {});
                    dfd.resolve('loading form');
                }
            };

            $scope.setData = function(resp){
                if(!editAccess){
                    if($scope.schema.editAccessOverride){
                        if(!userServ.isOwner(resp[$scope.schema.editAccessOverride])){
                            dirty = false;
                            $rootScope.$broadcast('form:cancel', []);
                        }
                    }
                    else{
                        dirty = false;
                        $rootScope.$broadcast('form:cancel', []);
                    }
                }
                $scope.schema.groups.forEach(function(group){
                    group.fields.forEach(function(field){
                        if(field.type != 'group'){
                            $scope.data[field.name] = resp[field.name] != undefined ? angular.copy(resp[field.name]) : field.default != undefined ? field.default : null;
                            if(field.type=='hidden' && field.options && field.options.ref=='userId' && $scope.data[field.name]==null && userServ.checkLevel(field.options.restrictLevel || 0)){
                                $scope.data[field.name] = userServ.getUser().user.id_role;
                            }
                        }
                        else{
                            field.fields.forEach(function(line){
                                line.fields.forEach(function(grField){
                                    $scope.data[grField.name] = resp[grField.name] != undefined ? angular.copy(resp[grField.name]) : grField.default != undefined ? grField.default : null;
                                });
                            });
                        }

                    });
                });
                $scope.deleteAccess = userServ.checkLevel($scope.schema.deleteAccess);
                if(!$scope.deleteAccess && $scope.schema.deleteAccessOverride){
                    $scope.deleteAccess = userServ.isOwner($scope.data[$scope.schema.deleteAccessOverride]);
                }
                $rootScope.$broadcast('form:init', $scope.data);
                dfd.resolve('loading form');
            };

            $scope.cancel = function(){
                $rootScope.$broadcast('form:cancel', $scope.data);
            };


            $scope.saveConfirmed = function(){
                $loading.start('spinner-send');
                var dfd = $q.defer();
                var promise = dfd.promise;
                promise.then(function(result) {
                    $loading.finish('spinner-send');
                });
                
                if($scope.dataUrl){
                    dataServ.post($scope.saveUrl, $scope.data, $scope.updated(dfd), $scope.error(dfd));
                }
                else{
                    dataServ.put($scope.saveUrl, $scope.data, $scope.created(dfd), $scope.error(dfd));
                }
            };


            $scope.save = function(){
                var errors = null;
                if($scope.schema.subDataRef){
                    if(SpreadSheet.hasErrors[$scope.schema.subDataRef]){
                        errors = SpreadSheet.hasErrors[$scope.schema.subDataRef]();
                    }
                    else{
                        errors = null;
                    }
                    if(errors){
                        $scope.openConfirm(["Il y a des erreurs dans le sous formulaire de saisie rapide.", "Si vous confirmez l'enregistrement, les données du sous formulaire de saisie rapide ne seront pas enregistrées"]).then(function(){
                            scope.saveConfirmed();
                        },
                        function(){
                            userMessages.errorMessage = SpreadSheet.errorMessage[$scope.schema.subDataRef];
                        });
                    }
                    else{
                        $scope.saveConfirmed();
                    }
                }
                else{
                    $scope.saveConfirmed();
                }
            };

            $scope.updated = function(dfd){
                return function(resp){
                    dataServ.forceReload = true;
                    $scope.data.id = resp.id;
                    dirty = false;
                    dfd.resolve('updated');
                    $rootScope.$broadcast('form:update', $scope.data);
                };
            };

            $scope.created = function(dfd){
                return function(resp){
                    dataServ.forceReload = true;
                    $scope.data.id = resp.id;
                    dirty = false;
                    dfd.resolve('created');
                    $rootScope.$broadcast('form:create', $scope.data);
                };
            };

            $scope.error = function(dfd){
                return function(resp){
                    userMessages.errorMessage = 'Il y a des erreurs dans votre saisie';
                    $scope.errors = angular.copy(resp);
                    dfd.resolve('errors');
                }
            };

            $scope.remove = function(){
                $scope.openConfirm(["Êtes vous certain de vouloir supprimer cet élément ?"]).then(function(){
                    $loading.start('spinner-send');
                    var dfd = $q.defer();
                    var promise = dfd.promise;
                    promise.then(function(result) {
                        $loading.finish('spinner-send');
                    });
                    dataServ.delete($scope.saveUrl, $scope.removed(dfd));
                });
            };

            $scope.removed = function(dfd){
                return function(resp){
                    dirty = false;
                    dfd.resolve('removed');
                    $rootScope.$broadcast('form:delete', $scope.data);
                };
            };

            var locationBlock = $scope.$on('$locationChangeStart', function(ev, newUrl){
                if(!dirty){
                    locationBlock();
                    $location.path(newUrl.slice(newUrl.indexOf('#')+1));
                    return;
                }
                ev.preventDefault();
                $scope.openConfirm(["Etes vous certain de vouloir quitter cette page ?", "Les données non enregistrées pourraient être perdues."]).then(
                    function(){
                        locationBlock();
                        $location.path(newUrl.slice(newUrl.indexOf('#')+1));
                    }
                    );
            });

            $timeout(function(){
                configServ.getUrl($scope.schemaUrl, $scope.setSchema);
            },0);
        }]
    }
});

