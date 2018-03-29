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

