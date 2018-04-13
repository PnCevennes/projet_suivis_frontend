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

            $scope.remove_line = function(index) {
                lines.pop(index);
            };

            $scope.addLines = function(){
                line = angular.copy(defaultLine);
                lines.push(line);
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

