/*
 * messages utilisateurs
 */
angular.module('DisplayDirectives').service('userMessages', function(){
    this.infoMessage = '';
    this.errorMessage = '';
    this.successMessage = '';

    // wrapper pour alert
    this.alert = function(txt){
        return alert(txt);
    };

    // wrapper pour confirm
    this.confirm = function(txt){
        return confirm(txt);
    };
});

