angular.module('FormDirectives').directive('fileinput', function(){
    return {
        restrict: 'E',
        scope: {
            refer: '=',
            options: '=',
            attacheduuid: '='
        },
        templateUrl: 'js/templates/form/fileinput.htm',
        controller: ['$scope',
            'Upload',
            'userMessages',
            'dataServ',
            'RESOURCES', function($scope, Upload, userMessages, dataServ, RESOURCES){
            var maxSize = $scope.options.maxSize || 2048000;

            $scope.current_upload = null;
            $scope.progress = undefined;

            var default_object = {
                "id_table_location": $scope.options.id_table_location,
                "uuid_attached_row": $scope.attacheduuid
            };


            if($scope.refer == undefined || $scope.refer == null){
                $scope.refer = [];
            }

            // Récupération des données types de média
            if ($scope.options.url_nomenclature_media_type == undefined) {
                $scope.options.url_nomenclature_media_type = "nomenclatures/nomenclature/117"; 
            }
            dataServ.get(
                $scope.options.url_nomenclature_media_type,
                function (resp) {
                    $scope.media_type = resp.values;
                }
            )

            $scope.items = angular.copy($scope.refer);
            
            $scope.$watch(function(){return $scope.refer}, function(nv, ov){
                if(nv !== ov){
                    $scope.refer = nv || [angular.copy(default_object)]; 
                    if(!$scope.refer.length){
                        $scope.refer.push(angular.copy(default_object));
                    }
                    $scope.items = angular.copy($scope.refer);
                }
            });
            
            $scope.add_item = function(){
                $scope.refer.push(angular.copy(default_object));
            };

            $scope.remove_item = function(idx){
                $scope.refer.splice(idx, 1);
            };

            $scope.delete_media = function(idx){
                if ($scope.refer[idx].unique_id_media) {
                    dataServ.delete(
                        'gn_commons/media/' + $scope.refer[idx].id_media, 
                        function(resp){
                            $scope.remove_item(idx);
                            console.log(resp);
                        }
                    );
                }
                else{
                    $scope.remove_item(idx);
                }
            }

            $scope.reset_item = function(idx){
                if($scope.items[idx]){
                    $scope.refer[idx] = angular.copy($scope.items[idx]);
                }
                else{
                    $scope.refer[idx] = angular.copy(default_object);
                }
            }

            $scope.is_valid = function(form, idx){
                if(form.$valid){
                    if(
                        ($scope.refer[idx].media_path && $scope.refer[idx].media_path.length) ^ 
                        ($scope.refer[idx].media_url && $scope.refer[idx].media_url.length>0) ^ 
                        ($scope.refer[idx].file_name && $scope.refer[idx].file_name.length>0)
                    ){
                        var valid = !!($scope.refer[idx].title_fr && $scope.refer[idx].title_fr.length > 0);
                        return valid;
                    }
                }
                return false;
            }

            $scope.is_invalid = function(form, idx){
                return !$scope.is_valid(form, idx);
            }

            $scope.file_selected = function(idx){
                if ($scope.refer[idx].upload_file) {
                    if(!($scope.refer[idx].title_fr && $scope.refer[idx].title_fr.length)) {
                        $scope.refer[idx].title_fr = $scope.refer[idx].upload_file.name;
                    }
                    $scope.refer[idx].file_name = $scope.refer[idx].upload_file.name;
                }
                else {
                    $scope.refer[idx].file_name = undefined;
                }
            }

            $scope.action_upload = function(idx){
                
                url = 'gn_commons/media' + ($scope.refer[idx].id_media ? '/' + $scope.refer[idx].id_media : '')

                data = angular.copy($scope.refer[idx]);
                delete data['upload_file'];
                delete data['file_name'];

                if (! $scope.attacheduuid) {
                    delete data['uuid_attached_row'];
                }

                if ($scope.refer[idx].upload_file) {
                    
                    data["file"] = $scope.refer[idx].upload_file;
                    data["isFile"] = true;
                    
                    // Test type de fichier
                    if ($scope.options.accepted) {
                        $scope.options.accepted.map(function(item) { return item.toLowerCase();});
                        var ext = $scope.refer[idx].upload_file.name.slice(
                            $scope.refer[idx].upload_file.name.lastIndexOf('.')+1, $scope.refer[idx].upload_file.name.length
                        ).toLowerCase();
                        if($scope.options.accepted.indexOf(ext) == -1){
                            userMessages.errorMessage = "Type d'extension refusé";
                            return;
                        }
                    }

                    // Test taille du fichier
                    if($scope.refer[idx].upload_file.size > maxSize){
                        userMessages.errorMessage = "La taille du fichier doit être inférieure à " + (maxSize/1024) + " Ko";
                        return;
                    }
    
                    Upload.upload({
                        url: RESOURCES.API_URL+url,
                        data: data
                    }).then(function (resp) {
                        $scope.progress = undefined;
                        $scope.refer[idx] = resp.data;
                        $scope.items = angular.copy($scope.refer);
                        userMessages.successMessage = "Média enregistré avec success";
                    }, function (resp) {
                        $scope.progress = undefined;
                        userMessages.errorMessage = "Erreur d'enregistrement";
                    }, function (evt) {
                        $scope.progress = parseInt(100.0 * evt.loaded / evt.total);
                    });
                }
                else {
                    dataServ.post(
                        url,
                        data,
                        function(resp) {
                            $scope.refer[idx] = resp.data;
                            $scope.items = angular.copy($scope.refer);
                            userMessages.successMessage = "Média enregistré avec success";
                        },function(resp) {
                            $scope.refer[idx] = resp.data;
                            userMessages.errorMessage = "Erreur d'enregistrement";
                        }
                    )
                }
            };
        }]
    };
});

