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

