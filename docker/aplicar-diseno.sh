#!/bin/sh
# Ejecutar desde la raíz del proyecto, después de instalar Moodle.
set -eu

docker compose exec -T --user www-data moodle php admin/cli/cfg.php --name=theme --set=institution
docker compose exec -T --user www-data moodle php admin/cli/cfg.php --name=frontpage --set=
docker compose exec -T --user www-data moodle php admin/cli/cfg.php --name=frontpageloggedin --set=
docker compose exec -T --user www-data moodle php admin/cli/cfg.php --name=sessioncookie --set=LoayzaPruebaClon
docker compose exec -T --user www-data moodle php admin/cli/purge_caches.php
