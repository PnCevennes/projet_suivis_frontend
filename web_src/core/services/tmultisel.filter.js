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

