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
