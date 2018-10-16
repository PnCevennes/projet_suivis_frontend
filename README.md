# Front end du Projet application suivis

Application de saisie des protocoles de suivi naturaliste qui fonctionne avec [GeoNature](https://github.com/PnX-SI/GeoNature) comme backend ainsi qu'un module GeoNature dédié à un protocole comme celui pour le [Suivi des chiroptères](https://github.com/PnCevennes/gn_module_suivi_chiro).


Documentation
------------

TODO

Prerequis
---------
browersify ```npm install -g browserify```
apache2

Installation
------------

Copier le fichier de paramètres et adapter en fonction : 
```
  cp web_src/core/constant.js.sample web_src/core/constant.js
```

Générer les fichiers JavaScript :
```
  ./web_src/compile.sh
```

Rendre le répertoire web accessible par Apache ou Nginx.

Technologies
------------

- Langages : HTML, JS, CSS
- Framework JS : Angular JS
- Framework carto : Leaflet
- Framework CSS : Bootstrap
- Fonds rasters : Geoportail, OpenStreetMap, Google Maps, WMS


Aperçu
------

![Screenshot 01](http://geonature.fr/img/screenshot_chiro_01.jpg)
*Liste des sites*

![Screenshot 02](http://geonature.fr/img/screenshot_chiro_02.jpg)
*Fiche d'une visite*

![Screenshot 03](http://geonature.fr/img/screenshot_chiro_03.jpg)
*Formulaire de saisie d'une observation chiro lors d'une visite d'un site*


Auteurs
-------

Parc national des Cévennes

* Frédéric FIDON
* Amandine SAHL


License
-------

* OpenSource - GPL V3
* Copyleft 2015 - Parc national des Cévennes

![logo-pnc](http://geonature.fr/img/logo-pnc.jpg)

