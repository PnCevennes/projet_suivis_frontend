// module de gestion des sites
angular.module('baseSites', ['suiviProtocoleServices', 'SimpleMap', 'ngRoute', 'ngTable']);

// module de gestion de la validation
angular.module('baseValidation', ['suiviProtocoleServices', 'SimpleMap', 'ngRoute', 'ngTable']);

// module de gestion des observations
angular.module('baseObservations', ['suiviProtocoleServices', 'SimpleMap', 'ngRoute', 'ngTable']);

// module de gestion des taxons
angular.module('baseTaxons', ['suiviProtocoleServices', 'ngRoute', 'ngTable']);

// module de gestion des biometries
angular.module('biometrie', ['suiviProtocoleServices', 'ngRoute']);

require('./controllers/site.controller.js');
require('./controllers/observation.controller.js');
require('./controllers/taxon.controller.js');
require('./controllers/biometrie.controller.js');
require('./controllers/validation.controller.js');

