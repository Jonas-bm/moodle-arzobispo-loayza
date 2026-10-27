# Instalación nueva con Docker

Necesitas Docker Desktop instalado e iniciado. Descarga y descomprime el proyecto
con **Code → Download ZIP**, o clónalo:

```sh
git clone URL_DEL_REPOSITORIO arzobispo-loaysa
cd arzobispo-loaysa
```

Ejecuta los comandos desde la raíz del proyecto, donde está `docker-compose.yml`.
Los comandos de copia y el script utilizan una terminal compatible con `sh`:
Terminal en macOS/Linux o Git Bash en Windows. En PowerShell puedes copiar los
archivos con el Explorador y activar el diseño manualmente como se indica abajo.
PHP, Apache y MariaDB se ejecutan dentro de contenedores; no necesitas instalarlos
en tu computadora ni ejecutar Composer o npm para utilizar el diseño incluido.

## Preparar una copia nueva

```sh
cp .env.example .env
cp moodle/config.docker.php.example moodle/config.php
```

Si ya existen, no los sobrescribas. Edita `.env` y sustituye las dos contraseñas
de ejemplo por claves largas y distintas. Las eliges tú: MariaDB crea los usuarios
al inicializar una base vacía. `MOODLE_DB_PASSWORD` corresponde al usuario `moodle`
que utiliza la aplicación. `DB_ROOT_PASSWORD` corresponde al administrador de
MariaDB, no al administrador del sitio Moodle.

Para probar junto con otra instalación, agrega a `.env`:

```dotenv
COMPOSE_PROJECT_NAME=loayza-prueba-clon
```

El ejemplo utiliza el puerto 8082 y `http://localhost:8082`. Cambia ambos valores
si ese puerto está ocupado. Conserva el nombre del proyecto después de instalar:
identifica sus contenedores y volúmenes.

El archivo `.env` lo crea cada persona y no se comparte. Para esta modalidad solo
necesitas las variables de `.env.example`; la contraseña del administrador de
Moodle se elige en el asistente, no en `.env`.

## Iniciar e instalar

```sh
docker compose up -d --build moodle
```

Abre http://localhost:8082/admin/index.php, acepta la licencia y completa la
instalación. Crea tu cuenta administradora con tu propio usuario, correo y contraseña, y escribe el nombre del sitio.
La conexión a MariaDB ya está definida en `moodle/config.php`.
Si deseas español, selecciona el idioma durante la instalación; descarga el
paquete desde Administración del sitio → Idioma si todavía no está disponible.

Después de terminar el asistente:

```sh
sh docker/aplicar-diseno.sh
docker compose up -d cron
```

El script activa `institution`, oculta el catálogo nativo de portada, configura
una cookie propia y purga las cachés. Se puede volver a ejecutar, pero volverá
a aplicar esos ajustes. El logo, las fotos y los estilos vienen en el código.
El tema queda seleccionado en la base de datos para los siguientes arranques.

Comprueba http://localhost:8082/?redirect=0 en escritorio y móvil: logo, imágenes,
secciones, footer y acceso. Crea un curso y un usuario de prueba para comprobar
las funciones. Una instalación nueva no incluye usuarios ni cursos anteriores.

## Alternativa para activar el diseño sin ejecutar el script

Si no tienes una terminal `sh`, después del asistente entra como administrador:

1. En Administración del sitio → Apariencia → Temas → Selector de temas,
   selecciona **Tema Institucional (`institution`)** como predeterminado.
2. En los ajustes de la página principal, deja todos los elementos de portada
   en **Ninguno**, tanto para visitantes como para usuarios conectados.
3. Si tienes otro Moodle en `localhost`, asigna un nombre de cookie propio
   en Servidor → Gestión de sesiones para evitar conflictos.
4. Purga las cachés desde Administración del sitio → Desarrollo → Purgar cachés.
5. Ejecuta `docker compose up -d cron` desde la raíz del proyecto.

## Archivos que se entregan y archivos locales

El repositorio debe incluir `Dockerfile`, `docker-compose.yml`, `.env.example`,
`moodle/config.docker.php.example`, la carpeta `docker/` y esta guía, además del
código Moodle y el tema. El script `docker/aplicar-diseno.sh` ya se entrega:
quien clone el proyecto solo lo ejecuta; no necesita escribirlo.

Cada instalación crea sus propios `.env` y `moodle/config.php`, excluidos de Git.
No reutilices archivos con credenciales de otra persona.

## Uso diario

```sh
docker compose ps
docker compose logs --tail=100 moodle db cron
docker compose stop
docker compose up -d
```

`dbdata` conserva la base y `moodledata` los archivos. `docker compose down`
conserva esos volúmenes; **`docker compose down -v` los elimina**.
Cambiar claves en `.env` no cambia las de una base que ya se inicializó.

No publiques `.env` ni `moodle/config.php`: Git los ignora. Cada persona que clone
el proyecto debe generar su configuración y sus claves. Este entorno publica
el sitio únicamente en la computadora local.
