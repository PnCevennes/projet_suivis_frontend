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
                if(_qs.length){
                    var _url = $scope.url + "?page="+$scope.pageNum+"&limit="+$scope.schema.limit+"&filters=" + angular.toJson(_qs);
                }
                else{
                    var _url = $scope.url + "?page="+$scope.pageNum+"&limit="+$scope.schema.limit;
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
                    $scope.counts.current = resp.filteredCount;
                    $scope.maxCount = Math.min(($scope.pageNum+1) * $scope.schema.limit, $scope.counts.current);
                    $scope.callback(resp.filtered, dfd);
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

