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
        controller: ['$scope', '$rootScope', '$timeout', '$filter', 'configServ', 'userServ', 'ngTableParams', function($scope, $rootScope, $timeout, $filter, configServ, userServ, ngTableParams){
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

