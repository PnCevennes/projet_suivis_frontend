angular.module('appSuiviProtocoles', [
    'generiques', 'baseSites', 'baseObservations', 'baseTaxons', 'baseValidation', 
    'biometrie', 'suiviProtocoleServices', 'FormDirectives', 'DisplayDirectives', 
    'ui.bootstrap', 'darthwade.loading', 'SimpleMap', 'LocalStorageModule', 
    'ngTableResizableColumns'
]);

// generiques
angular.module('generiques', ['suiviProtocoleServices', 'SimpleMap', 'ngRoute', 'ngTable']);

// services de l'application
angular.module('suiviProtocoleServices', ['SimpleMap']);

// directives formulaires
angular.module('FormDirectives', ['ngFileUpload', 'SimpleMap']);

// directives affichage
angular.module('DisplayDirectives', ['SimpleMap']);

// directives map
angular.module('SimpleMap', ['suiviProtocoleServices']);




require('./services/services.js');
require('./directives/display.js');
require('./directives/form.js');
require('./controllers/base.js');
require('./controllers/generic.js');


require('./constant.js');