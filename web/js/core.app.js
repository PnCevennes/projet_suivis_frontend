(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){

angular.module('appSuiviProtocoles').constant('RESOURCES', 
    {
        API_URL: "http://localhost:8000/"
    }
)

},{}],2:[function(require,module,exports){
/*
 * controleur selection app
 */
angular.module('appSuiviProtocoles').controller('appsController', ['$scope', '$location', 'configServ', 'userServ', function($scope, $location, configServ, userServ){
    
    if(!userServ.getUser()){
        $location.url('login');
    }

    $scope.$emit('app:selection');

    $scope.setData = function(resp){
        $scope.apps = resp;
    };

    $scope.select = function(id){
        $scope.apps.app.forEach(function(item){
            if(item.id == id){
                userServ.setCurrentApp(item);
                $scope.$emit('app:select', item);
            }
        });
    };

    configServ.getUrl('config?app=suivis&vue=apps', $scope.setData, true);
}]);


},{}],3:[function(require,module,exports){
/*
 * Controleur de base
 */
angular.module('appSuiviProtocoles').controller('baseController', ['$scope', '$location', 'dataServ', 'configServ', 'mapService', 'userMessages', 'userServ' ,function($scope, $location, dataServ, configServ, mapService, userMessages, userServ){
    $scope._appName = null;
    $scope.app = {name: "Suivi des protocoles", menu: []};
    $scope.success = function(resp){
        $scope.user = userServ.getUser();
        if(!$scope.user){
            $location.url('login');
        }
        $scope.data = resp;

        // FIXME DEBUG
        configServ.put('debug', true);

        //configServ.put('app', $scope.data[0]);
        //$scope._appName = $scope.data[0].name;

        $scope.$on('user:login', function(ev, user){
            $scope.user = user;

            var app = userServ.getCurrentApp();
            if(!app){
                $location.url('apps');
            }
            else{
                $scope.app = app;
                if($location.path() == '/'){
                    $scope.setActive(app.menu[0]);
                    $location.url(app.menu[0].url.slice(2));
                }
            }
        });

        $scope.$on('user:logout', function(ev){
            $scope.app = {name: "Suivi des protocoles", menu: []};
            $scope.user = null;
        });

        $scope.$on('app:select', function(ev, app){
            $scope.app = app;
            $scope.setActive(app.menu[0]);
            console.log($scope.app);
            
        });

        $scope.$on('app:selection', function(ev){
            $scope.app = {name: "Suivi des protocoles", menu: []};
            console.log($scope.app);
            
        });
    };

    $scope.setActive = function(item){
        $scope.app.menu.forEach(function(elem){
            if(elem.url == item.url){
                elem.__active__ = true;
            }
            else{
                elem.__active__ = false;
            }
        });
        userServ.setCurrentApp($scope.app);
    };

    $scope.check = function(val){
        return userServ.checkLevel(val);
    };

    configServ.getUrl('config?app=suivis&vue=apps', $scope.success);
}]);

},{}],4:[function(require,module,exports){

/*
 * Configuration des routes
 */
angular.module('appSuiviProtocoles').config(['$routeProvider', function($routeProvider){
    $routeProvider
        .when('/', {
            controller: 'baseController',
            templateUrl: 'js/templates/index.htm'
        })
        .when('/login', {
            controller: 'loginController',
            templateUrl: 'js/views/login.htm',
        })
        .when('/logout', {
            controller: 'logoutController',
            templateUrl: 'js/templates/index.htm'
        })
        .when('/apps', {
            controller: 'appsController',
            templateUrl: 'js/views/appSelection.htm'
        })
        .otherwise({redirectTo: '/'});
}]);

angular.module('appSuiviProtocoles').config(['localStorageServiceProvider', function (localStorageServiceProvider) {
    localStorageServiceProvider.setPrefix('projetSuivis');
    localStorageServiceProvider.setStorageType('sessionStorage');
}])

require('./base.controller.js');
require('./login.controller.js');
require('./logout.controller.js');
require('./apps.controller.js');

},{"./apps.controller.js":2,"./base.controller.js":3,"./login.controller.js":9,"./logout.controller.js":10}],5:[function(require,module,exports){
angular.module('generiques').controller('genericDetailController', [ '$scope', '$routeParams', 'configServ', 'dataServ', 'userServ', '$loading', 'mapService', '$q', '$timeout', function($scope, $routeParams, configServ, dataServ, userServ, $loading, mapService, $q, $timeout){

    $scope._appName = $routeParams.appName;
    $scope.configUrl = $routeParams.appName + '/config/' + $routeParams.viewName + '/detail';
    $scope.dataUrl = null;

    $scope.$on('schema:init', function(ev, schema){
        if(schema){
            $scope.schema = schema;
            $scope.dataUrl = schema.dataUrl + $routeParams.id;
            $scope.dataId = $routeParams.id;
        }
    });

    $scope.$on('display:init', function(ev, data){
        if($scope.schema.mapConfig){
            mapService.initialize($scope.schema.mapConfig).then(function(){
                mapService.loadData($scope.schema.mapData).then(
                    function(){
                        mapService.selectItem($routeParams.id);
                    }
                    );
                $scope.title = data.bsNom;
            });
        }
    });
}]);


},{}],6:[function(require,module,exports){
angular.module('generiques').controller('genericEditController', ['$scope', '$routeParams', 'configServ', 'dataServ', 'userServ', '$loading', 'mapService', '$q', '$timeout', 'userMessages', '$location', function($scope, $routeParams, configServ, dataServ, userServ, $loading, mapService, $q, $timeout, userMessages, $location){

    $scope._appName = $routeParams.appName;
    $scope.configUrl = $routeParams.appName + '/config/' + $routeParams.viewName + '/form';

    var _redirectUrl = $routeParams.appName + '/' + $routeParams.viewName + '/';

    if($routeParams.id){
        $scope.saveUrl = $scope._appName + '/' + $routeParams.viewName + '/' + $routeParams.id;
        $scope.dataUrl = null;
        $scope.data = {__origin__: {geom: $routeParams.id}};
    }
    else{
        $scope.saveUrl = $scope._appName + '/' + $routeParams.viewName; 
        $scope.data = {}
    }
    
    $scope.$on('schema:init', function(ev, schema){
        $scope.schema = schema;
        if($routeParams.id){
            $scope.dataUrl = schema.dataUrl + $routeParams.id;
        }

        if($routeParams.protocoleReference){
            schema.groups.forEach(function(_group){
                _group.fields.forEach(function(_field){
                    if(_field.options && (_field.options.referParent || _field.options.ref == 'parent')){
                        $scope.data[_field.name] = $routeParams.idReference;
                    }
                });
            });
        }
    });

    $scope.$on('form:init', function(ev, data){
        if(data[$scope.schema.formTitleRef]){
            $scope.title = $scope.schema.formTitleUpdate + data[$scope.schema.formTitleRef];
        }
        else{
            $scope.title = $scope.schema.formTitleCreate;
        }
    });

    $scope.$on('form:cancel', function(ev, data){
        if($routeParams.id){
            $location.url($scope.schema.formCreateCancelUrl);
        }
        else{
            $location.url(_redirectUrl + data.id);
        }
    });

    $scope.$on('form:create', function(ev, data){
        userMessages.successMessage = $scope.schema.createSuccessMessage;
        $location.url(_redirectUrl + data.id);
    });

    $scope.$on('form:update', function(ev, data){
        userMessages.successMessage = $scope.schema.updateSuccessMessage;
        $location.url(_redirectUrl + data.id);
    });

    $scope.$on('form:delete', function(ev, data){
        userMessages.successMessage = $scope.schema.deleteSuccessMessage;
        dataServ.forceReload = true;
        $location.url($scope.schema.formDeleteRedirectUrl);
    });
}]);


},{}],7:[function(require,module,exports){
angular.module('generiques').controller('genericListController', ['$scope', '$routeParams', 'configServ', 'dataServ', 'userServ', '$loading', 'mapService', '$q', '$timeout', function($scope, $routeParams, configServ, dataServ, userServ, $loading, mapService, $q, $timeout){

    $scope._appName = $routeParams.appName;
    $scope.editAccess = false;
    $scope.data_url = '';

    var _configUrl = $routeParams.appName + '/config/' + $routeParams.viewName + '/list';

    /*
     * Spinner
     * */
    
    $loading.start('spinner-1');
    var dfd = $q.defer();
    var promise = dfd.promise;
    promise.then(function(result) {
        $loading.finish('spinner-1');
    });
    

    $scope.setData = function(resp){
        if($scope.schema.mapConfig){
            $scope.items = resp;
            mapService.initialize($scope.schema.mapConfig).then(function(){
                $scope.data = resp.map(function(item){
                    mapService.addGeom(item); 
                    return item.properties;
                });
            });
        }
        else{
            $scope.data = resp;
        }
        dfd.resolve('data');
    };


    $timeout(function(){
        configServ.getUrl(_configUrl, function(resp){
            $scope.schema = resp;
            $scope.editAccess = userServ.checkLevel(resp.editAccess);
            $scope.data_url = resp.dataUrl;
        });
    }, 0);
}]);


},{}],8:[function(require,module,exports){
/*
 * configuration des routes
 */
angular.module('generiques').config(['$routeProvider', function($routeProvider){
    $routeProvider
        .when('/g/:appName/:viewName/list', {
            controller: 'genericListController',
            templateUrl: 'js/views/generic/list.htm'
        })
        .when('/g/:appName/:viewName/edit', {
            controller: 'genericEditController',
            templateUrl: 'js/views/generic/edit.htm'
        })
        .when('/g/:appName/:viewName/edit/:id', {
            controller: 'genericEditController',
            templateUrl: 'js/views/generic/edit.htm'
        })
        .when('/g/:appName/:viewName/:protocoleReference/edit/:idReference', {
            controller: 'genericEditController',
            templateUrl: 'js/views/generic/edit.htm'
        })
        .when('/g/:appName/:viewName/detail/:id', {
            controller: 'genericDetailController',
            templateUrl: 'js/views/generic/detail.htm'
        });
}]);

require('./generic-detail.controller.js');
require('./generic-edit.controller.js');
require('./generic-list.controller.js');

},{"./generic-detail.controller.js":5,"./generic-edit.controller.js":6,"./generic-list.controller.js":7}],9:[function(require,module,exports){
/*
 * controleur login
 */
angular.module('appSuiviProtocoles').controller('loginController', ['$scope', '$location', '$rootScope', 'userServ', 'userMessages', 'configServ' ,function($scope, $location, $rootScope, userServ, userMessages, configServ){
    if(userServ.getUser()){
        $scope.data = {
            login: userServ.getUser().user.identifiant,
            pass: userServ.getUser().pass, 
        };
    }
    else{
        $scope.data = {login: null, pass: null};
    }

    $scope.$on('user:login', function(ev, user){
        userMessages.infoMessage =  'Bienvenue ' + user.user.identifiant;
        
        $location.url('apps'); 
    });

    $scope.$on('user:error', function(ev){
        userMessages.errorMessage = "Erreur d'identification."
    });

    $scope.send = function(){
        userServ.login($scope.data.login, $scope.data.pass);
    };
}]);


},{}],10:[function(require,module,exports){
/*
 * controleur logout
 */
angular.module('appSuiviProtocoles').controller('logoutController', ['$scope', '$location', 'userServ', 'userMessages', 'configServ', function($scope, $location, userServ, userMessages, configServ){
    $scope.$on('user:logout', function(ev){
        userMessages.infoMessage = "Tchuss !";
        $location.url('login');
    });

    userServ.logout();
}]);


},{}],11:[function(require,module,exports){
angular.module('appSuiviProtocoles', [
    'generiques', 'baseSites', 'baseObservations', 'baseTaxons', 'baseValidation', 
    'biometrie', 'suiviProtocoleServices', 'FormDirectives', 'DisplayDirectives', 
    'ui.bootstrap', 'darthwade.loading', 'SimpleMap', 'LocalStorageModule', 
    'ngTableResizableColumns'
]);

// generiques
angular.module('generiques', ['suiviProtocoleServices', 'SimpleMap', 'ngRoute', 'ngTable']);

// services de l'application
angular.module('suiviProtocoleServices', ['SimpleMap']);

// directives formulaires
angular.module('FormDirectives', ['angularFileUpload', 'SimpleMap']);

// directives affichage
angular.module('DisplayDirectives', ['SimpleMap']);

// directives map
angular.module('SimpleMap', ['suiviProtocoleServices']);




require('./services/services.js');
require('./directives/display.js');
require('./directives/form.js');
require('./controllers/base.js');
require('./controllers/generic.js');


require('./constant.js');
},{"./constant.js":1,"./controllers/base.js":4,"./controllers/generic.js":8,"./directives/display.js":12,"./directives/form.js":22,"./services/services.js":43}],12:[function(require,module,exports){
require('./display/breadcrumb.directive.js');
require('./display/detail-display.directive.js');
require('./display/field-display.directive.js');
require('./display/filterform.directive.js');
require('./display/tablewrapper.directive.js');
require('./display/usermsg.directive.js');
require('./display/xhrdisplay.directive.js');
require('./display/leafletmap.directive.js');
require('./display/maplist.directive.js');

},{"./display/breadcrumb.directive.js":13,"./display/detail-display.directive.js":14,"./display/field-display.directive.js":15,"./display/filterform.directive.js":16,"./display/leafletmap.directive.js":17,"./display/maplist.directive.js":18,"./display/tablewrapper.directive.js":19,"./display/usermsg.directive.js":20,"./display/xhrdisplay.directive.js":21}],13:[function(require,module,exports){
angular.module('DisplayDirectives').directive('breadcrumbs', function(){
    return {
        restrict: 'A',
        scope: {},
        templateUrl: 'js/templates/display/breadcrumbs.htm',
        controller: ['$scope', 'configServ', '$location', function($scope, configServ, $location){
            $scope.bc = [];
            $scope._edit = false;
            $scope._create = false;
            var _generic = false;
            var _url = null;
            var params = $location.path().slice(1).split('/');
            if(params.indexOf('edit') >= 0){
                params.splice(params.indexOf('edit'), 1);
                $scope._edit = true;
                if(!parseInt(params[params.length-1])){
                    $scope._create = true;
                }
            }
            // générique
            if(params[0] == 'g'){
                params.splice(0, 1);
                var _functions = ['list', 'detail'];
                params = params.filter(function(itemName){
                    return (_functions.indexOf(itemName) == -1);
                });
                _generic = true;
            }
            if(params.length == 4){
                if(!parseInt(params[3])){
                    url = params[0] + '/config/breadcrumb?generic='+_generic+'&view=' + params[1]
                }
                else{
                    if($scope._edit){
                        url = params[0] + '/config/breadcrumb?generic='+_generic+'&view=' + params[2] + '&id=' + params[3];
                    }
                    else{
                        url = params[0] + '/config/breadcrumb?generic='+_generic+'&view=' + params[1] + '&id=' + params[3];
                    }
                }
            }
            else if(params.length == 3){
                if(!parseInt(params[2])){
                    url = params[0] + '/config/breadcrumb?generic='+_generic+'&view=' + params[1]
                }
                else{
                    url = params[0] + '/config/breadcrumb?generic='+_generic+'&view=' + params[1]+ '&id=' + params[2];           
                }
            }
            else if(params.length == 2){
                url = params[0] + '/config/breadcrumb?generic='+_generic+'&view=' + params[1];
            }
            configServ.getUrl(url, function(resp){
                $scope.bc = resp;
                configServ.put('currentBc', resp);
            });
        }],
    };
});


},{}],14:[function(require,module,exports){
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


},{}],15:[function(require,module,exports){
angular.module('DisplayDirectives').directive('fieldDisplay', function(){
    return {
        restrict: 'A',
        scope: {
            field: '=',
            data: '=',
        },
        templateUrl: 'js/templates/display/field.htm',
        controller: function(){}
    };
});


},{}],16:[function(require,module,exports){
angular.module('DisplayDirectives').directive('filterform', function(){
    return {
        restrict: 'E',
        scope: {
            url: '@',
            _schema: '=schema',
            callback: '=',
        },
        templateUrl: 'js/templates/form/filterForm.htm',
        controller: ['$scope', '$timeout', '$q', '$loading', 'dataServ', 'configServ', function($scope, $timeout, $q, $loading, dataServ, configServ){
            $scope.filterData = {};
            $scope.counts = {};
            $scope.filters = {};
            $scope.pageNum = 0;
            $scope.maxCount = 0;
            $scope.schema_initialized = false;
            $scope.schema = {
                fields: [],
                limit: null
            };


            $scope.setArray = function(field, setArray){
                if(setArray){
                    var val = $scope.filterData[field].value;
                    $scope.filterData[field].value = [val, null];
                }
                else{
                    if(Array.isArray($scope.filterData[field].value)){
                        var val = $scope.filterData[field].value[0];
                        $scope.filterData[field].value = val;
                   }
                }
            };

            $scope.nextPage = function(){
                $scope.pageNum += 1;
                $scope.send();
            };

            $scope.prevPage = function(){
                $scope.pageNum -= 1;
                $scope.send();
            };

            $scope.clear = function(){
                $scope.schema.fields.forEach(function(item){
                    $scope.filterData[item.name] = {filter: '=', value: item.default};
                });
                $scope.send();
            };

            $scope.send = function(resetPage){
                if(resetPage){
                    $scope.pageNum = 0;
                }
                var _qs = [];
                $scope.schema.fields.forEach(function(item){
                    if($scope.filterData[item.name] && $scope.filterData[item.name].value != null){
                        var _val = $scope.filterData[item.name].value;
                        var _filter = $scope.filterData[item.name].filter;
                        if(!(item.zeroNull && _val === 0)){
                            _qs.push({item: item.name, filter: _filter, value: _val});
                        }
                    }
                });
                extraParam = ''
                url = $scope.url.split("?")[0]
                if ($scope.url.split("?")[1]){
                    extraParam = $scope.url.split("?")[1]+"&"
                }
                if(_qs.length){
                    var _url = url + "?" + extraParam + "offset="+$scope.pageNum+"&limit="+$scope.schema.limit+"&filters=" + angular.toJson(_qs);
                }
                else{
                    var _url = url +  "?" + extraParam + "offset="+$scope.pageNum+"&limit="+$scope.schema.limit;
                }
                configServ.put($scope.url, 
                    {
                        page: $scope.pageNum,
                        limit: $scope.schema.limit,
                        qs: _qs,
                        url: _url
                    }
                );
                // spinner
                $loading.start('spinner-1');
                var dfd = $q.defer();
                var promise = dfd.promise;
                promise.then(function(result) {
                    $loading.finish('spinner-1');
                });

                dataServ.get(_url, function(resp){
                    //envoi des données filtrées à la vue
                    $scope.collapseFilters = false;
                    $scope.counts.total = resp.total;
                    $scope.counts.current = resp.total_filtered;
                    $scope.maxCount = Math.min(($scope.pageNum+1) * $scope.schema.limit, $scope.counts.current);
                    $scope.callback(resp.items, dfd);
                }, null, true);
            };

            $scope.init_schema = function(){
                if($scope._schema){
                    $scope.schema = angular.copy($scope._schema);
                }
                if($scope.schema.fields == undefined){
                    $scope.schema.fields = [];
                }
                $scope.schema.fields.forEach(function(item){
                    $scope.filterData[item.name] = {filter: '=', value: item.default};
                });
                $scope.paginate = $scope.schema.limit != null;

                configServ.get($scope.url, function(resp){
                    if(resp){
                        $scope.page = resp.page;
                        if(resp.limit){
                            $scope.schema.limit = resp.limit;
                        }
                        resp.qs.forEach(function(item){
                            $scope.filterData[item.item] = {
                                filter: item.filter, 
                                value: item.value
                            };
                        });
                        //console.log(resp);
                    }
                    $scope.send();
                });
                
            };

            //$timeout($scope.init_schema, 0);

            $scope.$watch('_schema', function(newval){
                if(newval){
                    $scope.init_schema();
                }
            });

        }]
    };
});


},{}],17:[function(require,module,exports){
/*
 * directive pour l'affichage et l'édition des cartes
 * params:
 *  data [obj] -> Liste des géométries 
 */
angular.module('SimpleMap').directive('leafletMap', function(){
    return {
        restrict: 'A',
        scope: {
            data: '=',
        },
        templateUrl: 'js/templates/display/map.htm',
        //template: '<div dw-loading="map-loading" dw-loading-options="{text: \'Chargement des données\'}" ng-options="{ text: \'\', className: \'custom-loading\', spinnerOptions: {radius:30, width:8, length: 16, color: \'#f0f\', direction: -1, speed: 3}}"></div><div id="mapd"></div>',
        controller: ['$scope', '$filter', '$q', '$rootScope', 'LeafletServices', 'mapService', 'configServ', 'dataServ', '$timeout', '$loading', function($scope, $filter, $q, $rootScope, LeafletServices, mapService, configServ, dataServ, $timeout, $loading){
            /*
             */

            var map = null;
            var layer = null; 
            var tileLayers = {};
            var geoms = [];
            var currentSel = null;
            var layerControl = null;
            var resource = null;

            var initialize = function(configUrl){
                if(!configUrl){
                    configUrl = 'js/resources/defaults.json';
                }
                if(map){
                    $timeout(function() {
                        map.invalidateSize();
                    }, 0 );
                }
                var dfd = $q.defer();
                try{
                    map = L.map('mapd', {maxZoom: 17});
                    layer = L.markerClusterGroup();
                    layer.addTo(map);
                    configServ.getUrl(configUrl, function(res){
                        resource = res[0];
                        if(!resource.clustering){
                            layer.options.disableClusteringAtZoom = 13;
                        }
                        var curlayer = null;
                        configServ.get('map:currentLayer', function(_curlayer){
                            curlayer = _curlayer
                        });
                        resource.layers.baselayers.forEach(function(_layer, name){
                            var layerData = LeafletServices.loadData(_layer);
                            tileLayers[layerData.name] = layerData.map;
                            if(curlayer){
                                if(layerData.name == curlayer){
                                    layerData.map.addTo(map);
                                }
                            }
                            else{
                                if(layerData.active){
                                    layerData.map.addTo(map);
                                }
                            }
                        });
                        map.setView(
                            [resource.center.lat, resource.center.lng], 
                            resource.center.zoom);
                        layerControl = L.control.layers(tileLayers, {'Données': layer});
                        
                        layerControl.addTo(map);


                        var recenterCtrl = L.control({position: 'topleft'});
                        recenterCtrl.onAdd = function(map){
                            this._rectCtrl = L.DomUtil.create('div', 'recenterBtn');
                            this.update();
                            return this._rectCtrl;
                        }
                        recenterCtrl.update = function(){
                            this._rectCtrl.innerHTML = '<button type="button" onclick="recenter();" style="padding-top: 4px; padding-bottom: 2px;"><span class="glyphicon glyphicon-move"></span></button>';
                        };
                        recenterCtrl.addTo(map);

                        document.recenter = function(){
                            $rootScope.$apply(
                                $rootScope.$broadcast('mapService:centerOnSelected')
                            );
                        }

                        /*
                         * déplacement carte récupération de la zone d'affichage
                         */
                        map.on('moveend', function(ev){
                            $rootScope.$apply(
                                $rootScope.$broadcast('mapService:pan')
                            );
                        });

                        map.on('baselayerchange', function(ev){
                            $rootScope.$apply(function(){
                                configServ.put('map:currentLayer', ev.name);
                            })
                        });

                        $timeout(function(){
                            $rootScope.$broadcast('map:ready');
                        }, 0);

                        dfd.resolve();
                    });
                }
                catch(e){
                    layer.clearLayers();
                    geoms.splice(0);
                    dfd.resolve();
                }

                var getVisibleItems = function(){
                    var bounds = map.getBounds();
                    var visibleItems = [];
                    geoms.forEach(function(item){
                        try{
                            var _coords = item.getLatLng();
                        }
                        catch(e){
                            var _coords = item.getLatLngs();
                        }
                        try{
                            if(bounds.intersects(_coords)){
                                visibleItems.push(item.feature.properties.id);
                            }
                        }
                        catch(e){
                            if(bounds.contains(_coords)){
                                visibleItems.push(item.feature.properties.id);
                            }
                        }
                    });
                    return visibleItems;
                };
                mapService.getVisibleItems = getVisibleItems;

                var getLayerControl = function(){
                    return layerControl;
                };
                mapService.getLayerControl = getLayerControl;

                var getLayer = function(){
                    return layer;
                };
                mapService.getLayer = getLayer;

                var getMap = function(){
                    return map;
                }
                mapService.getMap = getMap;

                var getGeoms = function(){
                    return geoms;
                }
                mapService.getGeoms = getGeoms;

                var filterData = function(ids){
                    angular.forEach(geoms, function(geom){
                        if(ids.indexOf(geom.feature.properties.id) < 0){
                            geom.feature.$shown = false;
                            layer.removeLayer(geom);
                        }
                        else{
                            if(geom.feature.$shown === false){
                                geom.feature.$shown = true;
                                layer.addLayer(geom);
                            }
                        }
                    });
                };
                mapService.filterData = filterData;

                var getItem = function(_id){
                    var res = geoms.filter(function(item){
                        return item.feature.properties.id == _id;
                    });
                    if(res.length){
                        $timeout(function(){
                            try{
                                /*
                                 * centre la carte sur le point sélectionné
                                 */
                                map.setView(res[0].getLatLng(), Math.max(map.getZoom(), 13));
                            }
                            catch(e){
                                /*
                                 * centre la carte sur la figure sélectionnée
                                 */
                                map.fitBounds(res[0].getBounds());
                            }
                        }, 0);
                        return res[0];
                    }
                    return null;
                };
                mapService.getItem = getItem;

                var _set_selected = function(item, _status){
                    var iconUrl = 'js/lib/leaflet/images/marker-icon.png';
                    var polygonColor = '#03F'; 
                    var zOffset = 0;
                    if(_status){
                        iconUrl = 'js/lib/leaflet/images/marker-rouge.png';
                        polygonColor = '#F00'; 
                        zOffset = 1000;
                    }
                    try{
                        item.setIcon(L.icon({
                            iconUrl: iconUrl, 
                            shadowUrl: 'js/lib/leaflet/images/marker-shadow.png',
                            iconSize: [25, 41], 
                            iconAnchor: [13, 41],
                            popupAnchor: [0, -41],
                        }));
                        item.setZIndexOffset(zOffset);
                    }
                    catch(e){
                        item.setStyle({
                            color: polygonColor,
                        });
                    }
                };

                var selectItem = function(_id){
                    var geom = getItem(_id);
                    if(currentSel){
                        _set_selected(currentSel, false);
                    }
                    _set_selected(geom, true);
                    currentSel = geom;
                    return geom;
                };
                mapService.selectItem = selectItem;

                addGeom = function(jsonData){
                    var geom = L.GeoJSON.geometryToLayer(jsonData);
                    geom.feature = jsonData;
                    geom.on('click', function(e){
                        $rootScope.$apply(
                            $rootScope.$broadcast('mapService:itemClick', geom)    
                        );
                    });
                    if(jsonData.properties.geomLabel){
                        geom.bindPopup(jsonData.properties.geomLabel);
                    }
                    try{
                        geom.setZIndexOffset(0);
                    }
                    catch(e){}
                    geoms.push(geom);
                    layer.addLayer(geom);
                    return geom;
                };
                mapService.addGeom = addGeom;


                var loadData = function(url){
                    var defd = $q.defer();
                    $loading.start('map-loading');
                    configServ.get(url, function(resp){
                        if(resp){
                            url = resp.url;
                        }
                    });
                    dataServ.get(url, dataLoad(defd));
                    return defd.promise;
                };
                mapService.loadData = loadData;


                var dataLoad = function(deferred){
                    return function(resp){
                        if(resp.filtered){
                            resp.filtered.forEach(function(geom){
                                addGeom(geom);
                            });
                        }
                        else{
                            resp.forEach(function(geom){
                                addGeom(geom);
                            });
                        }
                        $rootScope.$broadcast('mapService:dataLoaded');
                        $loading.finish('map-loading');
                        deferred.resolve();
                    };
                };

                return dfd.promise;
            };
            mapService.initialize = initialize;

            $scope.recenter = function(){
                if(currentSel){
                    mapService.getItem(currentSel.feature.properties.id);
                }
            };

            $scope.$on('mapService:centerOnSelected', function(ev){
                if(currentSel){
                    mapService.getItem(currentSel.feature.properties.id);
                }
            });


            $scope.$on('$destroy', function(evt){
                if(map){
                    map.remove();
                    mapService.initialize = null;
                    mapService.map = null;
                    geoms = [];
                }
            });
        }]
    };
});


},{}],18:[function(require,module,exports){
angular.module('SimpleMap').directive('maplist', ['$rootScope', '$timeout', 'mapService' ,function($rootScope, $timeout, mapService){
    return {
        restrict: 'A',
        transclude: true,
        //templateUrl: 'js/templates/display/mapList.htm',
        template: '<div><ng-transclude></ng-transclude></div>',
        link: function(scope, elem, attrs){
            // récupération de l'identificateur d'événements de la liste
            var target = attrs['maplist'];
            var filterTpl = '<div class="mapFilter"><label> filtrer avec la carte <input type="checkbox" onchange="filterWithMap(this);"/></label></div>';
            scope.mapAsFilter = false;
            scope.toolBoxOpened = true;
            var visibleItems = [];
            /*
             * initialisation des listeners d'évenements carte 
             */
            var connect = function(){
                // click sur la carte
                scope.$on('mapService:itemClick', function(ev, item){
                    mapService.selectItem(item.feature.properties.id);
                    $rootScope.$broadcast(target + ':select', item.feature.properties);
                });

                scope.$on('mapService:pan', function(ev){
                    scope.filter();
                });

                scope.filter = function(){
                    visibleItems = mapService.getVisibleItems();
                    $rootScope.$broadcast(target + ':filterIds', visibleItems, scope.mapAsFilter);
                }

                // sélection dans la liste
                scope.$on(target + ':ngTable:ItemSelected', function(ev, item){
                    $timeout(function(){
                        try{
                            var geom = mapService.selectItem(item.id);
                            geom.openPopup();
                        }
                        catch(e){}
                    }, 0);
                });

                // filtrage de la liste
                scope.$on(target + ':ngTable:Filtered', function(ev, data){
                    ids = [];
                    data.forEach(function(item){
                        ids.push(item.id);
                    });
                    if(mapService.filterData){
                        mapService.filterData(ids);
                    }
                });

            };

            var _createFilterCtrl = function(){
                var filterCtrl = L.control({position: 'bottomleft'});
                filterCtrl.onAdd = function(map){
                    this._filtCtrl = L.DomUtil.create('div', 'filterBtn');
                    this.update();
                    return this._filtCtrl;
                };
                filterCtrl.update = function(){
                    this._filtCtrl.innerHTML = filterTpl;
                };
                filterCtrl.addTo(mapService.getMap());
            }

            scope.$on('map:ready', function(){
                _createFilterCtrl();
            });

            document.filterWithMap = function(elem){
                $rootScope.$apply(function(){
                    scope.mapAsFilter = elem.checked;
                    scope.filter();
                });
            };

            $timeout(function(){
                connect();
            }, 0);

        }
    };
}]);


},{}],19:[function(require,module,exports){
angular.module('DisplayDirectives').directive('tablewrapper', function(){
    return {
        restrict: 'A',
        scope: {
            refName: '@refname',
            schema: '=',
            data: '=',
            filterUrl: '@',
            filterCallback: '=',
        },
        transclude: true,
        templateUrl: 'js/templates/display/tableWrapper.htm',
        controller: ['$scope', '$rootScope', '$timeout', '$filter', 'configServ', 'userServ', 'ngTableParams', 
            function($scope, $rootScope, $timeout, $filter, configServ, userServ, ngTableParams){
            $scope.currentItem = null;
            $scope._checkall = false;
            filterIds = [];
            extFilter = false;
            var orderedData;

            $scope.filterZero = function(x){
                if(x.id == 0){
                    x.id = '';
                }
                return x;
            };

            var filterFuncs = {
                starting: function(key, filterTxt){
                    if(filterTxt == ''){
                        return function(x){return true};
                    }
                    return function(filtered){
                        if(!filtered[key]){
                            if(filterTxt == '-'){
                                return true;
                            }
                            return false;
                        }
                        return filtered[key].toLowerCase().indexOf(filterTxt.toLowerCase())===0;
                    }
                },
                integer: function(key, filterTxt){
                    filterTxt = filterTxt.trim();
                    if(filterTxt == ''){
                        return function(x){return true};
                    }
                    return function(filtered){
                        //Abscence de filtre quand uniquement = > ou <
                        if (filterTxt.length <2 ) return true; 
                        
                        var nbr = parseFloat(filterTxt.slice(1, filterTxt.length)); 
                        if (isNaN(nbr)) return false;
                        
                        if (filterTxt.indexOf('>') === 0){
                            return filtered[key] > nbr;
                        }
                        else if(filterTxt.indexOf('<') === 0){
                            return filtered[key] < nbr;
                        }
                        else if(filterTxt.indexOf('=') === 0){
                            return filtered[key] == nbr;
                        }
                        else return false;
                    };
                },
            };
            var filtering = {};

            $scope.__init__ = function(){
                $scope.editAccess = userServ.checkLevel($scope.schema.editAccess);
                $scope.schema.fields.forEach(function(field){
                    if(field.filterFunc && filterFuncs[field.filterFunc]){
                        filtering[field.name] = filterFuncs[field.filterFunc];
                    }
                });
            };


            if(!$scope.schema){
                $scope.$watch('schema', function(newval){
                    if(newval){
                        $scope.__init__();
                    }
                });
            }
            else{
                $scope.__init__();
            }

            /*
             *  initialisation des parametres du tableau
             */
            $scope.tableParams = new ngTableParams({
                page: 1,
                count: 10,
                filter: {},
                sorting: {}
            },
            {
                counts: [10, 25, 50],
                total: $scope.data ? $scope.data.length : 0, // length of data
                getData: function ($defer, params) {
                    /*
                    // use build-in angular filter
                    var filteredData = params.filter() ?
                            $filter('filter')($scope.data, params.filter()) :
                            $scope.data;
                    */
                    if(extFilter){
                        var filteredData = $scope.data.filter(function(item){return filterIds.indexOf(item.id) !== -1});
                    }
                    else{
                        var filteredData = $scope.data;
                    }
                    if(!filteredData.length){
                        return;
                    }
                    reqFilter = params.filter();
                    if(reqFilter){
                        for(filterKey in reqFilter){
                            if(filtering[filterKey]){
                                //filteredData = $filter('filter')(filteredData, filterDef, );
                                filteredData = filteredData.filter(filtering[filterKey](filterKey, reqFilter[filterKey]))
                            }
                            else{
                                var filterDef = {}
                                filterDef[filterKey] = reqFilter[filterKey];
                                filteredData = $filter('filter')(filteredData, filterDef);
                            }
                        }
                    }
                    $scope._checkall = false;
                    //$scope.clearChecked();
                    orderedData = params.sorting() ?
                            $filter('orderBy')(filteredData, params.orderBy()) :
                            $scope.data;
                    configServ.put($scope.refName + ':ngTable:Filter', params.filter());
                    configServ.put($scope.refName + ':ngTable:Sorting', params.sorting());
                    $rootScope.$broadcast($scope.refName + ':ngTable:Filtered', orderedData);


                    params.total(orderedData.length); // set total for recalc pagination
                    $scope.currentSel = {total: $scope.data.length, current: orderedData.length};

                    var curPg = params.page() || 1;
                    $defer.resolve(orderedData.slice((curPg - 1) * params.count(), curPg * params.count()));
                } 
            });
            


            // récupération des filtres utilisés sur le tableau 
            configServ.get($scope.refName + ':ngTable:Filter', function(filter){
                $scope.tableParams.filter(filter);
            });

            // récupération du tri utilisé sur le tableau 
            configServ.get($scope.refName + ':ngTable:Sorting', function(sorting){
                $scope.tableParams.sorting(sorting);
            });


            $scope.checkItem = function(item){
                $rootScope.$broadcast($scope.refName + ':ngTable:itemChecked', item);
            };


            // selection case à cocher
            $scope.checkAll = function(){
                $scope._checkall = !$scope._checkall;

                var page = $scope.tableParams.page();
                var count = $scope.tableParams.count();
                var to_check = orderedData.slice((page-1) * count, page * count);
                to_check.forEach(function(item){
                    item._checked = $scope._checkall;
                    $scope.checkItem(item);
                });
            }

            $scope.clearChecked = function(){
                $scope.data.forEach(function(item){
                    $scope._checkall = false;
                    if(item._checked){
                        item._checked = false;
                    }
                });
                $rootScope.$broadcast($scope.refName + ':cleared');
            };

            /*
             * Fonctions
             */
            $scope.selectItem = function(item, broadcast){
                if($scope.currentItem && $scope.currentItem != item){
                    $scope.currentItem.$selected = false;
                }
                if(broadcast == undefined){
                    broadcast = true;
                }
                item.$selected = true;
                $scope.currentItem = item;
                configServ.put($scope.refName + ':ngTable:ItemSelected', item);
                var idx = orderedData.indexOf(item);
                var pgnum = Math.ceil((idx + 1) / $scope.tableParams.count());
                $scope.tableParams.page(pgnum);
                $timeout(function(){
                    var _elem = document.getElementById('item'+item.id);
                    if(_elem){
                        _elem.focus();
                    }
                }, 0);
                if(broadcast){
                    $rootScope.$broadcast($scope.refName + ':ngTable:ItemSelected', item);
                }
            };

            $scope.$watch('data', function(newval){
                if(newval && newval.length){
                    configServ.get($scope.refName + ':ngTable:ItemSelected', function(item){
                        if(item){
                            _item = $scope.data.filter(function(elem){
                                return elem.id == item.id;
                            });
                            if(_item.length){
                                item = _item[0];
                            }
                            $scope.currentItem = item;
                            $timeout(function(){
                                $scope.selectItem(item, false);
                                $rootScope.$broadcast($scope.refName + ':ngTable:ItemSelected', item);
                            }, 0);
                            return;
                        }
                    });
                    $scope.tableParams.reload();
                }
            });


            /*
             * Listeners
             */
            $scope.$on($scope.refName + ':select', function(evt, item){
                $scope.selectItem(item, false);
            });

            $scope.$on($scope.refName + ':filterIds', function(ev, itemIds, filter){
                filterIds = itemIds;
                extFilter = filter;
                $scope.tableParams.reload();
                if($scope.currentItem && filterIds.indexOf($scope.currentItem.id) !== -1){
                    var idx = orderedData.indexOf($scope.currentItem);
                    var pgnum = Math.ceil((idx + 1) / $scope.tableParams.count());
                    $scope.tableParams.page(pgnum);
                }
            });

            $scope.$on($scope.refName + ':clearChecked', function(){
                $scope.clearChecked();
            });
        }],
    };
});


},{}],20:[function(require,module,exports){
/**
 * Directive pour l'affichage des messages utilisateur en popover
 */
angular.module('DisplayDirectives').directive('usermsg', ['userMessages', '$timeout', function(userMessages, $timeout){
    return {
        restrict: 'A',
        templateUrl: 'js/templates/modalMsg.htm',
        controller: ['$scope', function($scope){
            $scope.hideMsg=true;
            $scope.$watch(
                function(){return userMessages.infoMessage},
                function(newval){
                    if(newval){
                        $scope.msgStyle = 'alert-info';
                        $scope.showMsg(newval);
                    }
                }
            );

            $scope.$watch(
                function(){return userMessages.errorMessage},
                function(newval){
                    if(newval){
                        $scope.msgStyle = 'alert-danger';
                        $scope.showMsg(newval);
                    }
                }
            );

            $scope.$watch(
                function(){return userMessages.successMessage},
                function(newval){
                    if(newval){
                        $scope.msgStyle = 'alert-success';
                        $scope.showMsg(newval);
                    }
                }
            );

            $scope.showMsg = function(msg){
                $scope.userMessage = msg;
                $scope.hideMsg=false;
                $timeout(function(){
                    userMessages.infoMessage = null;
                    $scope.hideMsg=true;
                    userMessages.infoMessage = '';
                    userMessages.errorMessage = '';
                    userMessages.successMessage = '';
                }, 5500);
            };
        }]
    };
}]);


},{}],21:[function(require,module,exports){
/**
 * fonction qui renvoie le label associé à un identifiant
 * paramètres : 
 *  xhrurl ->url du  service web
 *  inputid -> identifiant de l'élément
 */
angular.module('DisplayDirectives').directive('xhrdisplay', function(){
    return {
        restrict: 'A',
        scope: {
            inputid: '=',
            xhrurl: '=',
        },
        template: '{{value}}',
        controller: ['$scope', 'dataServ', function($scope, dataServ){
            $scope.setResult = function(resp){
                $scope.value = resp.label;
            };
            $scope.$watch(function(){return $scope.inputid}, function(newval, oldval){
                if(newval){
                    dataServ.get($scope.xhrurl + '/' + newval, $scope.setResult);
                }
            });
        }]
    };
});


},{}],22:[function(require,module,exports){
require('./form/angucompletewrapper.directive.js');
require('./form/calculated.directive.js');
require('./form/datepick.directive.js');
require('./form/dynform.directive.js');
require('./form/fileinput.directive.js');
require('./form/geometry.directive.js');
require('./form/multi.directive.js');
require('./form/multisel.directive.js');
require('./form/simpleform.directive.js');
require('./form/spreadsheet.directive.js');
require('./form/subeditform.directive.js');
require('./form/subform.directive.js');
require('./form/table-fieldset.directive.js');
require('./form/filetype.directive.js');
require('./form/fileup.directive.js');

},{"./form/angucompletewrapper.directive.js":23,"./form/calculated.directive.js":24,"./form/datepick.directive.js":25,"./form/dynform.directive.js":26,"./form/fileinput.directive.js":27,"./form/filetype.directive.js":28,"./form/fileup.directive.js":29,"./form/geometry.directive.js":30,"./form/multi.directive.js":31,"./form/multisel.directive.js":32,"./form/simpleform.directive.js":33,"./form/spreadsheet.directive.js":34,"./form/subeditform.directive.js":35,"./form/subform.directive.js":36,"./form/table-fieldset.directive.js":37}],23:[function(require,module,exports){
/**
 * wrapper pour la directive typeahead permettant de l'utiliser en édition
 * requete inverse au serveur pour obtenir un label lié à l'ID fourni et passage
 * label à la directive pour affichage
 * params supplémentaires:
 *  initial -> l'ID fourni
 *  reverseurl -> l'url permettant d'obtenir le label correspondant à l'ID
 */
angular.module('FormDirectives').directive('angucompletewrapper', ['dataServ', '$http', function(dataServ, $http){
    return {
        restrict: 'E',
        scope: {
            inputclass: '@',
            decorated: '@',
            selectedobject: '=',
            ngBlur: '=',
            url: '@',
            initial: '=',
            reverseurl: '@',
            ngrequired: '=',
        },
        transclude: true,
        templateUrl: 'js/templates/form/autoComplete.htm',
        link: function($scope, elem){
            $scope.localselectedobject = '';
            $scope.testIsNull = function(){
                if($('#aw')[0].value == ''){
                    $scope.selectedobject = null;
                }
            };

            $scope.find = function(txt){
                if(txt){
                    return $http.get($scope.url + txt).then(function(resp){
                        return resp.data;
                    });
                }
            };

            $scope.$watch('localselectedobject', function(newval){
                if(newval && newval.id){
                    $scope.selectedobject = newval.id;
                    elem[0].firstChild.children[1].focus();
                }
            });

            $scope.$watch('initial', function(newval){
                if(newval){
                    dataServ.get($scope.reverseurl + '/' + newval, function(resp){
                        $scope.localselectedobject = resp;
                    });
                }
                else{
                    $scope.localselectedobject = null;
                }
            });
        }
    };
}]);

},{}],24:[function(require,module,exports){
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


},{}],25:[function(require,module,exports){
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


},{}],26:[function(require,module,exports){
/**
 * génération automatique de formulaire à partir d'un json qui représente le schéma du formulaire
 * params:
 *  schema: le squelette du formulaire (cf. doc schémas)
 *  data: le dictionnaire de données source/cible
 *  errors: liste d'erreurs de saisie (dictionnaire {nomChamp: errMessage})
 */
angular.module('FormDirectives').directive('dynform', function(){
    return {
        restrict: 'E',
        scope: {
            name: '@',
            group: '=',
            data: '=',
            errors: '=',
        },
        templateUrl: 'js/templates/form/dynform.htm',
        controller: ['$scope', function($scope){}],
    };
});


},{}],27:[function(require,module,exports){
angular.module('FormDirectives').directive('fileinput', function(){
    return {
        restrict: 'E',
        scope: {
            refer: '=',
            options: '='
        },
        templateUrl: 'js/templates/form/fileinput.htm',
        controller: ['$scope', function($scope){

            $scope.current_upload = null;

            var default_object = {ftype: $scope.options.target};


            if($scope.refer == undefined || $scope.refer == null){
                $scope.refer = [angular.copy(default_object)];
            }
            if(!$scope.refer.length){
                $scope.refer.push(angular.copy(default_object));
            }

            $scope.refer.map(function(item){
                item.ftype = $scope.options.target;
            });

            $scope.items = angular.copy($scope.refer);
            
            $scope.$watch(function(){return $scope.refer}, function(nv, ov){
                if(nv !== ov){
                    $scope.refer = nv || [angular.copy(default_object)]; 
                    if(!$scope.refer.length){
                        $scope.refer.push(angular.copy(default_object));
                    }
                    $scope.items = angular.copy($scope.refer);
                    $scope.refer.map(function(item){
                        item.ftype = $scope.options.target;
                    });
                }
            });

            
            $scope.add_item = function(){
                $scope.refer.push(angular.copy(default_object));
            };

            $scope.remove_item = function(idx){
                $scope.refer.splice(idx, 1);
                if(!$scope.refer.length){
                    $scope.refer.push(angular.copy(default_object));
                }
            };

            $scope.reset_item = function(idx){
                if($scope.items[idx]){
                    $scope.refer[idx] = angular.copy($scope.items[idx]);
                }
                else{
                    $scope.refer[idx] = angular.copy(default_object);
                }
            }

            $scope.is_valid = function(form, idx){
                if(!($scope.refer[idx].titre && $scope.refer[idx].titre.length)){
                    if($scope.refer[idx].path && $scope.refer[idx].path.length){
                        $scope.refer[idx].titre = $scope.refer[idx].path;
                    }
                    else if($scope.refer[idx].url && $scope.refer[idx].url.length){
                        $scope.refer[idx].titre = $scope.refer[idx].url;
                    }
                }
                if(form.$valid){
                    if(($scope.refer[idx].path && $scope.refer[idx].path.length) ^ ($scope.refer[idx].url && $scope.refer[idx].url.length>0)){
                        var valid = !!($scope.refer[idx].titre && $scope.refer[idx].titre.length >= 5);
                        return valid;
                    }
                }
                return false;
            }

            $scope.is_invalid = function(form, idx){
                return !$scope.is_valid(form, idx);
            }
        }]
    };
});


},{}],28:[function(require,module,exports){
/*
 * Directive qui permet d'avoir un champ de formulaire de type fichier et qui l'envoie au serveur
 * envoie un fichier au serveur qui renvoie un identifiant de création.
 * params:
 *  fileids: la valeur source/cible du champ (liste d'identifiants)
 */
angular.module('FormDirectives').directive('filetype', function(){
    return {
        restrict: 'E',
        scope: {
            fileids: '=',
            options: '='
        },
        templateUrl: 'js/templates/form/filetype.htm',
        controller: ['$scope', '$rootScope', '$upload', 'dataServ', 'userMessages', function($scope, $rootScope, $upload, dataServ, userMessages){
            var maxSize = $scope.options.maxSize || 2048000;
            var getOptions = '';
            if($scope.options.target){
                getOptions = '?target=' + $scope.options.target;
            }
            if($scope.fileids == undefined){
                $scope.fileids = [];
            }
            $scope.delete_file = function(f_id){
                dataServ.delete('upload_file/' + f_id + getOptions, function(resp){
                    $scope.fileids.splice($scope.fileids.indexOf(resp.id), 1);
                });
                $scope.lock = false;
            };
            $scope.$watch('upload_file', function(){
                $scope.upload($scope.upload_file);
            });
            $scope.upload = function(files){
                angular.forEach(files, function(item){
                    var ext = item.name.slice(item.name.lastIndexOf('.')+1, item.name.length);
                    if($scope.options.accepted && $scope.options.accepted.indexOf(ext)>-1){
                        if(item.size < maxSize){
                            $scope.lock = true;
                            $upload.upload({
                                url: 'upload_file' + getOptions,
                                file: item,
                                })
                                .progress(function(evt){
                                    $scope.progress = parseInt(100.0 * evt.loaded / evt.total);    
                                })
                                .success(function(data){
                                    $scope.fileids.push(data.path);
                                    if(!$scope.options.unique){
                                        $scope.lock = false;
                                    }
                                })
                                .error(function(data){
                                    userMessages.errorMessage = "Une erreur s'est produite durant l'envoi du fichier.";
                                    $scope.lock = false;
                                });
                        }
                        else{
                            userMessages.errorMessage = "La taille du fichier doit être inférieure à " + (maxSize/1024) + " Ko";
                        }
                    }
                    else{
                        userMessages.errorMessage = "Type d'extension refusé";
                    }
                });
            };
        }]
    }
});


},{}],29:[function(require,module,exports){
angular.module('FormDirectives').directive('fileup', function(){
    return {
        restrict: 'E',
        scope: {
            options: '=',
            fileid: '=',
            filepath: '='
        },
        templateUrl: 'js/templates/form/fileup.htm',
        controller: [
            '$scope',
            '$upload',
            'userMessages',
            'dataServ',
            function($scope, $upload, userMessages, dataServ){
                var maxSize = $scope.options.maxSize || 2048000;
                var getOptions = '';

                $scope.lock = false;

                if($scope.options.target){
                    getOptions = '?target=' + $scope.options.target;
                }

                $scope.$watch('upload_file', function(){
                    $scope.upload($scope.upload_file);
                });

                $scope.delete = function(){
                    console.log('delete');
                    dataServ.delete('/upload_file/'+$scope.fileid+getOptions, function(res){
                        $scope.filepath = '';
                        $scope.fileid = null;
                        $scope.lock = false;

                    });
                };

                $scope.upload = function(files){
                    $scope.options.accepted.map(function(item) { return item.toLowerCase();});
                    angular.forEach(files, function(item){
                        var ext = item.name.slice(item.name.lastIndexOf('.')+1, item.name.length).toLowerCase();
                        if($scope.options.accepted && $scope.options.accepted.indexOf(ext)>-1){
                            if(item.size < maxSize){
                                $scope.lock = true;
                                $upload.upload({
                                    url: 'upload_file' + getOptions,
                                    file: item,
                                    })
                                    .progress(function(evt){
                                        $scope.progress = parseInt(100.0 * evt.loaded / evt.total);
                                    })
                                    .success(function(data){
                                        $scope.fileid = data.id;
                                        $scope.filepath = data.path.slice(data.path.indexOf('_')+1);
                                    })
                                    .error(function(data){
                                        userMessages.errorMessage = "Une erreur s'est produite durant l'envoi du fichier.";
                                        $scope.lock = false;
                                    });
                            }
                            else{
                                userMessages.errorMessage = "La taille du fichier doit être inférieure à " + (maxSize/1024) + " Ko";
                            }
                        }
                        else{
                            userMessages.errorMessage = "Type d'extension refusé";
                        }
                    });
                };
            }
        ]
    };
});

},{}],30:[function(require,module,exports){
/*
 * directive pour la gestion des données spatiales
 * params:
 *  geom -> eq. ng-model
 *  options: options à passer tel que le type de géométrie editer
 *  origin: identifiant du point à éditer
 */
angular.module('FormDirectives').directive('geometry', function(){
    return {
        restrict: 'A',
        scope: {
            geom: '=',
            options: '=',
            origin: '=',
        },
        templateUrl:  'js/templates/form/geometry.htm',
        controller: ['$scope', '$rootScope', '$timeout', 'mapService', function($scope, $rootScope, $timeout, mapService){
            $scope.editLayer = new L.FeatureGroup();

            var current = null;

            var setEditLayer = function(layer){
                mapService.getLayer().removeLayer(layer);
                $scope.updateCoords(layer);
                $scope.editLayer.addLayer(layer);
                current = layer;
            };

            var coordsDisplay = null;

            $scope.update_point = function(pt_index, pt_coord){
                return function(value){
                    if(arguments.length){
                        var _eqs = ['lng', 'lat'];
                        $scope.geom[pt_index][pt_coord] = value;
                        var _geom = $scope.editLayer.getLayers()[0];
                        try{
                            var _coords = _geom.getLatLngs();
                            _coords[pt_index][_eqs[pt_coord]] = value;
                            _geom.setLatLngs(_coords);
                            _geom.redraw();
                        }
                        catch(e){
                            var _coords = _geom.getLatLng();
                            _coords[_eqs[pt_coord]] = value;
                            _geom.setLatLng(_coords);
                            _geom.update();
                        }
                    }
                    return $scope.geom[pt_index][pt_coord];
                };
            };


            if(!$scope.options.mapConfig){
                $scope.configUrl = 'js/resources/defaults.json';
            }
            else{
              // $scope.configUrl = $scope.options.configUrl; A voir s'il ne faut pas mieu utiliser configUrl
                $scope.configUrl = $scope.options.mapConfig;
            }

            var _initialize = function(){
                mapService.initialize($scope.configUrl).then(function(){
                    mapService.getLayerControl().addOverlay($scope.editLayer, "Edition");
                    mapService.loadData($scope.options.dataUrl).then(function(){
                        if($scope.origin){
                            $timeout(function(){
                                var layer = mapService.selectItem($scope.origin);
                                if(layer){
                                    setEditLayer(layer);
                                }
                            }, 0);
                        }
                        mapService.getMap().addLayer($scope.editLayer);
                        mapService.getMap().removeLayer(mapService.getLayer());
                    });

                    $scope.controls = new L.Control.Draw({
                        edit: {featureGroup: $scope.editLayer},
                        draw: {
                            circle: false,
                            rectangle: false,
                            marker: $scope.options.geometryType == 'point',
                            polyline: $scope.options.geometryType == 'linestring',
                            polygon: $scope.options.geometryType == 'polygon',
                        },
                    });

                    mapService.getMap().addControl($scope.controls);

                    /*
                     * affichage coords curseur en edition
                     * TODO confirmer le maintien
                     */
                    coordsDisplay = L.control({position: 'bottomleft'});
                    coordsDisplay.onAdd = function(map){
                        this._dsp = L.DomUtil.create('div', 'coords-dsp');
                        return this._dsp;
                    };
                    coordsDisplay.update = function(evt){
                        this._dsp.innerHTML = '<span>Long. : ' + evt.latlng.lng + '</span><span>Lat. : ' + evt.latlng.lat + '</span>';
                    };

                    mapService.getMap().on('mousemove', function(e){
                        coordsDisplay.update(e);
                    });

                    coordsDisplay.addTo(mapService.getMap());
                    /*
                     * ---------------------------------------
                     */


                    mapService.getMap().on('draw:created', function(e){
                        if(!current){
                            $scope.editLayer.addLayer(e.layer);
                            current = e.layer;
                            $rootScope.$apply($scope.updateCoords(current));
                        }
                    });

                    mapService.getMap().on('draw:edited', function(e){
                        $rootScope.$apply($scope.updateCoords(e.layers.getLayers()[0]));
                    });

                    mapService.getMap().on('draw:deleted', function(e){
                        current = null;
                        $rootScope.$apply($scope.updateCoords(current));
                    });
                    $timeout(function() {
                        mapService.getMap().invalidateSize();
                    }, 0 );

                });
            };

            var initialize = function(){
                try{
                    _initialize();
                }
                catch(e){
                    $scope.$watch(function(){ return mapService.initialize }, function(newval){
                        if(newval){
                            _initialize();
                        }
                    });
                }
            }

            // initialisation de la carte
            $timeout(initialize, 0);

            $scope.geom = $scope.geom || [];

            $scope.updateCoords = function(layer){
                $scope.geom.splice(0);
                if(layer){
                    try{
                        layer.getLatLngs().forEach(function(point){
                            $scope.geom.push([point.lng, point.lat]);
                        });
                    }
                    catch(e){
                        point = layer.getLatLng();
                        $scope.geom.push([point.lng, point.lat]);
                    }
                }
            };
        }],
    };
});

},{}],31:[function(require,module,exports){
/**
 * génération d'un champ formulaire de type multivalué
 * params:
 *  refer: la valeur source/cible du champ (une liste)
 *  schema: le schema descripteur du champ (cf. doc schemas)
 */
angular.module('FormDirectives').directive('multi', ['userMessages', '$timeout', function(userMessages, $timeout){
    return {
        restrict: 'E',
        scope: {
            refer: '=',
            schema: '=',
        },
        templateUrl: 'js/templates/form/multi.htm',
        link: function($scope, elem){
            $scope.addDisabled = true;
            if(!$scope.refer){
                $scope.refer = [];
            }
            $scope.data = $scope.refer;
            $scope.$watch(function(){return $scope.refer;}, function(newval, oldval){
                if(newval){
                    $scope.data = $scope.refer;
                    if(newval.length == 0){
                        $scope.add(null);
                        $scope.addDisabled = true;
                    }
                    else{
                        $scope.addDisabled = false;
                    }
                }
            });
            $scope.add = function(item){
                $scope.data.push(item || null);
                $scope.$watch(
                    function(){
                        return $scope.data[$scope.data.length-1]
                    },
                    function(newval){
                        if(newval){
                            // protection doublons
                            if($scope.data.indexOf(newval)<$scope.data.length-1){
                                userMessages.errorMessage = "Il y a un doublon dans votre saisie !";
                                $scope.data.pop();
                            }
                            $scope.addDisabled = false;
                        }
                        else{
                            $scope.addDisabled = true;
                        }
                    }
                );
                $timeout(function(){
                    // passage du focus à la ligne créée
                    var name = $scope.schema.name+($scope.data.length-1);
                    try{
                        //cas angucomplete
                        document.getElementById(name).children[0].children[1].focus();
                    }
                    catch(e){
                        document.getElementById(name).focus();
                    }
                }, 0);
            };
            $scope.remove = function(idx){
                $scope.data.splice(idx, 1);
            };
            if($scope.refer && $scope.refer.length==0){
                $scope.add(null);
            }
            else{
            //if($scope.data && $scope.data.length>0){
                $scope.addDisabled = false;
            }
        }
    }
}]);


},{}],32:[function(require,module,exports){
angular.module('FormDirectives').directive('multisel', function(){
    return {
        restrict: 'E',
        templateUrl: 'js/templates/form/multisel.htm',
        scope: {
            schema: '=',
            data: '=',
        },
        controller: ['$scope', function($scope){
            console.log('multisel');
            $scope.$watch('schema', function(nv, ov){
                console.log($scope.schema);
            });
            if(!$scope.data){
                $scope.data = [];
            }
            if(!$scope.data.push){
                //données anciennes
                $scope.data = [$scope.data];
            }
            $scope.tmp_data = {};

            $scope.$watch('data', function(nv, ov){
                if(nv !== undefined){
                    if(nv === null ){
                        $scope.data = [];
                    }
                    if(!nv.push){
                        $scope.data = [nv];
                    }
                    try{
                        $scope.data.forEach(function(value){
                            $scope.tmp_data[value] = true;
                        });
                    }
                    catch(e){

                    }
                }
            });
            $scope.update_values = function(){
                for(key in $scope.tmp_data){
                    key = parseInt(key);
                    if($scope.tmp_data[key]){
                        if($scope.data.indexOf(key) === -1){
                            $scope.data.push(key);
                        }
                    }
                    else{
                        var idx = $scope.data.indexOf(key);
                        if( idx !== -1){
                            $scope.data.splice(idx, 1);
                        }                        
                    }
                }
            }
        }]
    };
});


},{}],33:[function(require,module,exports){
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
        controller: ['$scope', '$rootScope', 'configServ', 'dataServ', 'userServ', 'userMessages', '$loading', '$q', 'SpreadSheet', '$modal', '$location', '$timeout', function($scope, $rootScope, configServ, dataServ, userServ, userMessages, $loading, $q, SpreadSheet, $modal, $location, $timeout){
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
                var modInstance = $modal.open({
                    templateUrl: 'js/templates/modalConfirm.htm',
                    resolve: {txt: function(){return txt}},
                    controller: function($modalInstance, $scope, txt){
                        $scope.txt = txt;
                        $scope.ok = function(){
                            $modalInstance.close();
                        };
                        $scope.cancel = function(){
                            $modalInstance.dismiss('cancel');
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


},{}],34:[function(require,module,exports){
/**
 * Directive pour l'affichage d'un tableau de saisie rapide style feuille de calcul
 * params : 
 *  schemaurl -> url du schema descripteur du tableau
 *  data -> reference vers le dictionnaire de données du formulaire parent
 *  dataref -> champ à utiliser pour stocker les données
 *  subtitle -> Titre indicatif du formulaire
 */
angular.module('FormDirectives').directive('spreadsheet', function(){
    return {
        restrict: 'A',
        scope: {
            schemaUrl: '=schemaurl',
            dataRef: '=dataref',
            subTitle: '=subtitle',
            dataIn: '=data',
        },
        templateUrl: 'js/templates/form/spreadsheet.htm',
        controller: ['$scope', 'configServ', 'userServ', 'SpreadSheet', 'ngTableParams', function($scope, configServ, userServ, SpreadSheet, ngTableParams){
            var defaultLine = {};
            var lines = [];
            $scope.data = [];
            $scope.$watch(
                function(){
                    return $scope.schemaUrl;
                }, 
                function(newval){
                    if(newval){
                        configServ.getUrl(newval, $scope.setSchema);
                    }
                }
            );
            $scope.setSchema = function(schema){
                $scope.schema = schema;
                $scope.schema.fields.forEach(function(item){
                    defaultLine[item.name] = item.default || null;
                });
                $scope.data = lines;
                $scope.addLines();
            };

            $scope.addLines = function(){
                for(i=0; i<3; i++){
                    line = angular.copy(defaultLine);
                    lines.push(line);
                }
            };

            $scope.tableParams = new ngTableParams({},
                {
                    getData: function($defer, params){
                        return $scope.data;
                    }
                }
            );

            $scope.check = function(){
                var out = [];
                var err_lines = [];
                var primaries = [];
                var errMsg = "Erreur";
                var hasErrors = false;
                $scope.data.forEach(function(line){
                    var line_valid = true;
                    var line_empty = true;
                    $scope.schema.fields.forEach(function(field){
                        if(field.type == "hidden"){
                            if(field.options && field.options.ref == 'userId' && line[field.name] == null){
                                /*
                                 * ajout du numérisateur à la ligne
                                 */
                                line[field.name] = userServ.getUser().user.id_role;
                            }
                        }
                        else{
                            if(line[field.name] && line[field.name] != null){
                                line_empty = false;
                            }
                            if((field.options.required || field.options.primary) && (!line[field.name] || line[field.name] == null)){
                                line_valid = false;
                            }
                            if(field.options.primary && line_valid){
                                /*
                                 * gestion des clés primaires pour la suppression des doublons
                                 */
                                if(primaries.indexOf(line[field.name])>-1){
                                    line_valid = false;
                                    errMsg = "Doublon";
                                    hasErrors = true
                                }
                                else{
                                    primaries.push(line[field.name]);
                                }
                            }
                        }
                    });
                    if(line_valid){
                        out.push(line);
                    }
                    else{
                        if(!line_empty){
                            err_lines.push($scope.data.indexOf(line) + 1);
                            hasErrors = true;
                        }
                    }
                });


                if(!$scope.dataIn[$scope.dataRef]){
                    $scope.dataIn[$scope.dataRef] = [];
                }
                else{
                    $scope.dataIn[$scope.dataRef].splice(0);
                }
                out.forEach(function(item){
                    $scope.dataIn[$scope.dataRef].push(item);
                });
                if(hasErrors){
                    errMsg = 'Il y a des erreurs ligne(s) : '+err_lines.join(', ');
                    SpreadSheet.errorMessage[$scope.dataRef]= errMsg;
                }
                return hasErrors;
            };
            SpreadSheet.hasErrors[$scope.dataRef] = $scope.check;
        }],
    };
});


},{}],35:[function(require,module,exports){
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
                    resp.ids.forEach(function(item, key){
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


},{}],36:[function(require,module,exports){
angular.module('FormDirectives').directive('subform', function(){
    return {
        restrict: 'E',
        scope: {
            refer: '=',
            schema: '=',
        },
        templateUrl: 'js/templates/form/subform.htm',
        controller: ['$scope', function($scope){
            if($scope.refer == undefined){
                $scope.refer = [{}];
            }

            $scope.items = angular.copy($scope.refer);
            
            $scope.$watch(function(){return $scope.refer}, function(nv, ov){
                if(nv !== ov){
                    $scope.refer = nv || [{}]; 
                    $scope.items = angular.copy($scope.refer);
                }
            });
            
            $scope.add_item = function(){
                $scope.refer.push({});
            };

            $scope.remove_item = function(idx){
                $scope.refer.splice(idx, 1);
            };

            $scope.reset_item = function(idx){
                if($scope.items[idx]){
                    $scope.refer[idx] = angular.copy($scope.items[idx]);
                }
                else{
                    $scope.refer[idx] = {};
                }
            }
        }]
    };
});


},{}],37:[function(require,module,exports){
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


},{}],38:[function(require,module,exports){
/**
 * Service de récupération et stockage des configurations
 * Utiliser pour stocker les variables globales ou les éléments de configuration de l'application
 */
angular.module('suiviProtocoleServices').service('configServ', ['dataServ', 'localStorageService', function(dataServ, localStorageService){
    var cache = {};

    this.bc = null;

    /*
     * charge des informations depuis une url si elles ne sont pas déja en cache
     * et les retourne via une callback. Si les variables sont déjà en cache, les 
     * retourne directement.
     * params:
     *  serv: l'url du serveur
     *  success: la callback de traitement
     */
    this.getUrl = function(serv, success){
        if(cache['debug']){
            var data = cache[serv];
        }
        else{
            var data = localStorageService.get(serv);
        }
        if(data){
            success(data);
        }
        else{
            dataServ.get(serv, function(resp){
                if(cache['debug']){
                    cache[serv] = resp;
                }
                else{
                    localStorageService.set(serv, resp);
                }
                success(resp);
            });
        }
    };

    /*
     * retourne une variable globale via la callback success
     * params:
     *  key : le nom de la variable
     *  success : la callback de traitement
     */
    this.get = function(key, success){
        success(cache[key]);
    };


    /*
     * crée ou met à jour une variable globale
     * params:
     *  key : le nom de la variable
     *  data : le contenu
     */
    this.put = function(key, data){
        cache[key] = data;
    };
}]);


},{}],39:[function(require,module,exports){
/**
 * Service de gestion des communications avec le serveur
 */
angular.module('suiviProtocoleServices').service('dataServ', 
['$http', '$filter', 'userMessages', 'RESOURCES', function($http, $filter, userMessages, RESOURCES){
    //cache de données pour ne pas recharger systématiquement les données du serveur
    var cache = {};

    //flag ordonnant la recharge des données plutôt que l'utilisation du cache
    this.forceReload = false;
    this.baseurl = RESOURCES.API_URL;
    // this.baseurl = 'http://localhost:8000/';
    /*
     * contacte le serveur en GET et met en cache les données renvoyées
     * Si les données sont déja en cache, retourne le données directement, à moins 
     * que le flag forceReload ou le paramtre "force" soient true, auquel cas le serveur
     * est recontacté et les données renvoyées écrasent le cache.
     * retourne les données via la callback success
     *
     * params:
     *  url: l'url à contacter
     *  success: la callback à utiliser pour traiter les données
     *  error: une callback appelée en cas d'erreur gérable
     *  force: flag permettant de forcer le rechargement des données plutot que l'utilisation
     *         du cache
     */
    this.get = function(url, success, error, force){
        // ne recharger les données du serveur que si le cache est vide ou 
        // si l'option force est true
        if(!error){
            error = function(err){console.log(err)};
        }
        if(cache[url] == undefined || force || this.forceReload){
            $http.get(this.baseurl + url)
                .then(function(data){
                    this.forceReload = false;
                    cache[url] = data.data;
                    success(data.data);
                },
                function(err){
                    switch(err.status){
                        case 500: 
                            userMessages.errorMessage = "Erreur serveur ! Si cette erreur se reproduit, contactez un administrateur.";
                            break;
                        case 404: 
                            userMessages.errorMessage = "Erreur : Donnée inexistante";
                            break;
                        case 403: 
                            userMessages.errorMessage = "Vous n'êtes pas autorisé à effectuer cette action";
                            break;
                        case 400: 
                            userMessages.errorMessage = "Données inutilisables";
                            break;
                        default: userMessages.errorMessage = "Erreur !";
                    };
                    error(err);
                }
            );
        }
        else{
            success(cache[url]);
        }
    };

    /*
     * contacte le serveur en POST et renvoie le résultat via la callback success
     * aucune donnée n'est mise en cache
     * params: 
     *  url: l'url à contacter
     *  data: les données POST
     *  success: la callback de traitement de la réponse du serveur
     *  error: la callback de traitement en cas d'erreur gérable
     */
    this.post = function(url, data, success, error){
        $http.post(this.baseurl + url, data).success(success).error(error || function(err){console.log(err);});
    };

    /*
     * contacte le serveur en PUT et renvoie le résultat via la callback success
     * params:
     *  cf. this.post
     */
    this.put = function(url, data, success, error){
        $http.put(this.baseurl + url, data).success(success).error(error || function(err){console.log(err);});
    };

    /*
     * contacte le serveur en DELETE
     * params:
     *  url: l'url à contacter
     *  success: la callback de traitement de la réponse du serveur
     *  error: la callback de traitement en cas d'erreur gérable
     */
    this.delete = function(url, success, error){
        $http.delete(this.baseurl + url).success(success).error(error || function(err){console.log(err);});
    };

}]);


},{}],40:[function(require,module,exports){
/**
 * filtre basique - transforme une date yyyy-mm-dd en dd/mm/yyyy pour l'affichage
 */
angular.module('suiviProtocoleServices').filter('datefr', function(){
    return function(input){
        try{
            return input.replace(/^(\d+)-(\d+)-(\d+).*$/i, "$3/$2/$1");
        }
        catch(e){
            return input;
        }
    }
});


},{}],41:[function(require,module,exports){
angular.module('SimpleMap').factory('LeafletServices', ['$http', function($http) {
    return {
      layer : {}, 
      
      loadData : function(layerdata) {
        this.layer = {};
        this.layer.name = layerdata.name;
        this.layer.active = layerdata.active;
        
        if (layerdata.type == 'xyz' || layerdata.type == 'ign') {
          if ( layerdata.type == 'ign') {
            url = 'https://gpp3-wxs.ign.fr/' + layerdata.key + '/geoportail/wmts?LAYER='+layerdata.layer+'&EXCEPTIONS=text/xml&FORMAT=image/jpeg&SERVICE=WMTS&VERSION=1.0.0&REQUEST=GetTile&STYLE=normal&TILEMATRIXSET=PM&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}'; 
          }
          else {
            url = layerdata.url;
          }
          this.layer.map = new L.TileLayer(url,layerdata.options);
        }
        else if (layerdata.type == 'wms') {
          this.layer.map = L.tileLayer.wms(layerdata.url,layerdata.options);
        }
        return this.layer;
      }
   };
}]);


},{}],42:[function(require,module,exports){
angular.module('SimpleMap').factory('mapService', function(){
    return {};
});


},{}],43:[function(require,module,exports){
require('./configserv.service.js');
require('./dataserv.service.js');
require('./userserv.service.js');
require('./usermessages.service.js');
require('./datefr.filter.js');
require('./tselect.filter.js');
require('./tmultisel.filter.js');
require('./spreadsheet.service.js');
require('./leafletservice.service.js');
require('./mapservice.service.js');

},{"./configserv.service.js":38,"./dataserv.service.js":39,"./datefr.filter.js":40,"./leafletservice.service.js":41,"./mapservice.service.js":42,"./spreadsheet.service.js":44,"./tmultisel.filter.js":45,"./tselect.filter.js":46,"./usermessages.service.js":47,"./userserv.service.js":48}],44:[function(require,module,exports){
angular.module('FormDirectives').factory('SpreadSheet', function(){
    return {
        errorMessage: {},
        hasErrors: {},
    };
});


},{}],45:[function(require,module,exports){
angular.module('suiviProtocoleServices').filter('tmultisel', function(){
    return function(input, param){
        if(!param){
            return 'Aucun(e)';
        }
        var out = [];
        try{
            param.forEach(function(elem){
                var xitem = input.filter(function(item){
                    return item.id==elem;
                })[0];
                out.push(xitem.libelle);
            });
            return out.join(', ');
        }
        catch(e){
            //params anciens
            return 'Valeur incompatible';
        }
    }
});


},{}],46:[function(require,module,exports){
/**
 * Affichage du label d'une liste déroulante à partir de son identifiant
 */
angular.module('suiviProtocoleServices').filter('tselect', ['$filter', function($filter){
    return function(input, param){
        if(!param){
            return 'Non renseigné';
        }
        var res = $filter('filter')(input, {id: param}, function(act, exp){return act==exp;});
        try{
            return res[0].libelle;
        }
        catch(e){
            return 'Erreur : Valeur incompatible'; //Erreur censée ne jamais arriver.
        }
    }
}]);


},{}],47:[function(require,module,exports){
/*
 * messages utilisateurs
 */
angular.module('DisplayDirectives').service('userMessages', function(){
    this.infoMessage = '';
    this.errorMessage = '';
    this.successMessage = '';

    // wrapper pour alert
    this.alert = function(txt){
        return alert(txt);
    };

    // wrapper pour confirm
    this.confirm = function(txt){
        return confirm(txt);
    };
});


},{}],48:[function(require,module,exports){
/*
 * service utilisateur
 */
angular.module('suiviProtocoleServices').service(
    'userServ', ['dataServ', '$rootScope', 'localStorageService', function(dataServ, $rootScope, localStorageService){
    var _user = null;
    var _tmp_password = '';

    this.getUser = function(){
        if(!_user){
            var tmp_user = localStorageService.get('user');
            if(tmp_user){
                this.login(tmp_user.user.identifiant, tmp_user.pass);
                _user = tmp_user;
            }
        }
        return _user;
    };

    this.setUser = function(){
        localStorageService.set('user', _user);
    };
    
    this.getCurrentApp = function(){
        return localStorageService.get('currentApp');
    };
    
    this.setCurrentApp = function(appId){
        localStorageService.set('currentApp', appId);
    };
    
    this.checkLevel = angular.bind(this, function(level){
        try{
            return this.getUser().user.apps[this.getCurrentApp().appId] >= level;
        }
        catch(e){
            return false;
        }
    });

    this.isOwner = angular.bind(this,function(ownerId){
        if(_user==null){
            return false;
        }
        return _user.id_role == ownerId;
    });

    this.login = function(login, password, app){
        _tmp_password = password;
        dataServ.post('auth/login', {login: login, password: password, id_application: 100, with_cruved: false},
            this.connected,
            this.error
        );
    };

    this.logout = function(){
        dataServ.get('auth/logout', 
                this.disconnected, 
                function(){}, 
                true);
    };

    this.connected = angular.bind(this, function(resp){
        _user = resp;
        _user.pass = _tmp_password;
        this.setUser()
        $rootScope.$broadcast('user:login', _user);
    });

    this.disconnected = function(resp){
        _user = null;
        localStorageService.remove('user');
        localStorageService.remove('currentApp');
        $rootScope.$broadcast('user:logout');
    }

    this.error = function(resp){
        $rootScope.$broadcast('user:error');
    };

    
}]);


},{}]},{},[11]);
