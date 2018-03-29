/*
 * service utilisateur
 */
angular.module('suiviProtocoleServices').service('userServ', ['dataServ', '$rootScope', 'localStorageService', function(dataServ, $rootScope, localStorageService){
    var _user = null;
    var _tmp_password = '';

    this.getUser = function(){
        if(!_user){
            var tmp_user = localStorageService.get('user');
            if(tmp_user){
                this.login(tmp_user.identifiant, tmp_user.pass);
                _user = tmp_user;
            }
        }
        return _user;
    };

    this.setUser = function(){
        localStorageService.set('user', _user);
    };
    
    this.getCurrentApp = function(){
        return localStorageService.get('currentApp');
    };
    
    this.setCurrentApp = function(appId){
        localStorageService.set('currentApp', appId);
    };
    
    this.checkLevel = angular.bind(this, function(level){
        try{
            return this.getUser().apps[this.getCurrentApp().appId] >= level;
        }
        catch(e){
            return false;
        }
    });

    this.isOwner = angular.bind(this,function(ownerId){
        if(_user==null){
            return false;
        }
        return _user.id_role == ownerId;
    });

    this.login = function(login, password, app){
        _tmp_password = password;
        dataServ.post('users/login', {login: login, pass: password},
            this.connected,
            this.error
            );
    };

    this.logout = function(){
        dataServ.get('users/logout', 
                this.disconnected, 
                function(){}, 
                true);
    };

    this.connected = angular.bind(this, function(resp){
        _user = resp;
        _user.pass = _tmp_password;
        this.setUser()
        $rootScope.$broadcast('user:login', _user);
    });

    this.disconnected = function(resp){
        _user = null;
        localStorageService.remove('user');
        localStorageService.remove('currentApp');
        $rootScope.$broadcast('user:logout');
    }

    this.error = function(resp){
        $rootScope.$broadcast('user:error');
    };

    
}]);

