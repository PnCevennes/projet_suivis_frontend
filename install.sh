#!/bin/bash

if [ ! -f config/settings.ini ]
then
    echo "fichier de configuration config/settings.ini inexistant"
    exit
fi
. config/settings.ini


if [ ! -f $GEONATURE_PATH/config/settings.ini ]
then
    echo "fichier de configuration $GEONATURE_PATH/config/settings.ini inexistant"
    echo "Revoir la variable GEONATURE_PATH du fichier settings.ini"
    exit
fi

if ! type "browserify" > /dev/null; then
    echo "Browserify n'est pas installé"
    exit
fi

. $GEONATURE_PATH/config/settings.ini

SCRIPTPATH="$( cd "$(dirname "$0")" ; pwd -P )"

# Création d'une application suivi

ID_APP=$(export PGPASSWORD=$user_pg_pass;psql -h $db_host -U $user_pg -d $db_name -t -c "
SELECT id_application
FROM utilisateurs.t_applications
WHERE code_application = 'SUIVIS'
LIMIT 1
")

if [[ "${ID_APP}" = "" ]]
then
    echo "Création application"
    VALUE=$(export PGPASSWORD=$user_pg_pass;psql -h $db_host -U $user_pg -d $db_name -t -c "
    INSERT INTO utilisateurs.t_applications(nom_application, desc_application, code_application)
        VALUES ('suivi', 'Application mère dédiée aux protocole de suivis', 'SUIVIS')
        RETURNING id_application;
    ")
    ID_APP=$(echo $VALUE|cut --delimiter=" " -f1)
fi


# Préremplissage du fichier constant.js
if [ ! -d web_src/core/constant.js ]
then
    echo "
    angular.module('appSuiviProtocoles').constant('RESOURCES',
        {
            API_URL: \"$API_URL\",
            TAXHUB_URL: \"$TAXHUB_URL\",
            ID_APP: $ID_APP,
            DEBUG: $DEBUG,
        }
    )
    " > web_src/core/constant.js
fi

# Création fichier liste des applications pour geonature v2

if [ ! -f config/apps.toml ]
then
    cp config/apps.toml.sample config/apps.toml
fi

mkdir -p $GEONATURE_PATH/backend/static/configs/suivis
ln -s $SCRIPTPATH/config/apps.toml $GEONATURE_PATH/backend/static/configs/suivis

# Compilation
./web_src/compile.sh