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

