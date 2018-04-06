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

            $scope.geom = $scope.geom || [];
            var current = null;

            var setEditLayer = function(layer){
                mapService.getLayer().removeLayer(layer);
                $scope.updateCoords(layer);
                $scope.editLayer.addLayer(layer);
                current = layer;
            };

            var coordsDisplay = null;

            $scope.update_point = function(){
                var _geom = $scope.editLayer.getLayers()[0];
                _geom.setLatLng($scope.new_coo);
                _geom.update();  
                mapService.getMap().setView($scope.new_coo);
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
                    mapService.loadData($scope.options.mapData).then(function(){
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
                        $scope.new_coo = [point.lat, point.lng];
                    }
                }
            };
        }],
    };
});
