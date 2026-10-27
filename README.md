# Moodle · Arzobispo Loayza

**Empieza aquí:** este es el README principal para instalar y ejecutar este proyecto.
El archivo `moodle/README.md` es la documentación original del software Moodle;
se conserva como parte del código de origen.

Proyecto Moodle 5.1.3 con el tema institucional `institution` y el diseño de Loayza.
El repositorio contiene código y diseño; no incluye la base de datos, usuarios,
cursos ni archivos subidos de otra instalación.

## Elegir cómo instalar

Para Docker, `.env` debe estar en esta misma carpeta, junto a `docker-compose.yml`.
Docker Compose lo carga automáticamente al ejecutar los comandos desde aquí.
Cada persona lo crea copiando `.env.example`; `.env` no se sube al repositorio.

| Modalidad | Qué instalar en tu computadora | Instrucciones |
| --- | --- | --- |
| Con Docker | Docker Desktop; Git es opcional si descargas ZIP. | [Instalación con Docker](documentacion/INSTALACION_DOCKER.md) |
| Sin Docker | Apache, PHP y MariaDB. | Sigue los pasos 1 a 8 de este README. |

En ambas modalidades crearás tu propia cuenta administradora durante el asistente.
Las contraseñas de MariaDB las eliges al preparar la instalación; son distintas
al acceso de Moodle. No hay una cuenta o contraseña compartida para quienes clonen.
El diseño viene incluido, pero debes activarlo después de instalar siguiendo
la guía de la modalidad elegida.

## Instalación sin Docker

## 1. Descargar el proyecto

Desde el repositorio privado de GitHub: **Code → Download ZIP** y descomprime en
una carpeta permanente. También puedes usar Git:

```sh
git clone URL_DEL_REPOSITORIO arzobispo-loaysa
cd arzobispo-loaysa
```

La carpeta correcta contiene `moodle/`, `configuracion/` y este README.
No descargues otro Moodle para sustituir esta copia: perderías el tema personalizado.

## 2. Preparar Apache, PHP y MariaDB

Necesitas:

- Apache 2.4.
- PHP 8.3, tanto para Apache como para la terminal.
- MariaDB 10.11 o una versión compatible con Moodle 5.1.
- Internet para instalar el idioma español y descargar recursos durante la instalación.

Puedes usar un entorno local que ya tengas. Si utilizas WampServer o XAMPP,
comprueba sus versiones: muchos paquetes incluyen una base de datos antigua
que no cumple los requisitos de Moodle 5.1.

Activa las extensiones PHP `mysqli`, `intl`, `mbstring`, `curl`, `zip`, `gd`,
`sodium`, `dom`, `SimpleXML`, `xml`, `xmlreader`, `fileinfo` e `iconv`.
También se recomiendan `exif`, `soap` y OPcache. El instalador te indicará si falta alguna.

Aplica los valores de [configuracion/php-local.ini.example](configuracion/php-local.ini.example)
al `php.ini` que usa Apache y reinícialo. No basta con editar solamente el PHP de la terminal.

## 3. Crear una base de datos vacía

En phpMyAdmin o tu cliente MariaDB crea la base `moodle_loayza` y un usuario
`loayza` con permisos solo sobre esa base. Ejemplo SQL, cambiando la contraseña:

```sql
CREATE DATABASE moodle_loayza
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'loayza'@'localhost' IDENTIFIED BY 'CAMBIAR_CLAVE';
GRANT ALL PRIVILEGES ON moodle_loayza.* TO 'loayza'@'localhost';
```

No importes una base de datos demo. El usuario de base de datos no es el
administrador de Moodle; crearás el administrador durante la instalación.

## 4. Configurar Apache y moodledata

1. Crea una carpeta de datos **fuera del área pública**, por ejemplo
   `C:/moodledata/loayza` en Windows o `/srv/moodledata/loayza` en Linux.
   El usuario que ejecuta PHP debe poder escribir allí. No uses permisos `777`.
2. Configura el sitio Apache usando
   [configuracion/apache-local.conf.example](configuracion/apache-local.conf.example).
   Reemplaza `/RUTA/PROYECTO` por la ruta real de la carpeta descargada.
3. El `DocumentRoot` debe ser **`moodle/public/`**, no `moodle/`.
4. El ejemplo utiliza `http://localhost:8081`. Habilita `Listen 8081` en Apache
   si ese puerto todavía no está configurado. Si está ocupado, elige otro y
   usa la misma dirección en Apache y Moodle.
5. Reinicia Apache y MariaDB.

En Windows utiliza rutas como `C:/proyectos/arzobispo-loaysa/moodle/public`.
El archivo de ejemplo incluye bloqueo de rutas internas y desactiva listados de directorios.

## 5. Instalar Moodle

Abre **http://localhost:8081** y completa el asistente:

| Campo | Valor |
| --- | --- |
| Directorio Moodle | Ruta real a `moodle/public` |
| Directorio de datos | La carpeta moodledata creada fuera del área pública |
| Tipo de base de datos | MariaDB |
| Servidor de base de datos | `localhost` |
| Base de datos | `moodle_loayza` |
| Usuario de base de datos | `loayza` |
| Contraseña | La que creaste en el paso 3 |
| Prefijo de tablas | `mdl_` |

Acepta la licencia y revisa que el verificador no tenga errores pendientes.
Crea tu cuenta administradora y configura el nombre del sitio.

El asistente crea **`moodle/config.php`**, fuera de `public/`.
Si no puede escribirlo, guarda el contenido que te proporcione en esa ubicación.
Como referencia tienes [moodle/config.local.php.example](moodle/config.local.php.example),
pero el asistente es el método recomendado.

**No uses `config.docker.php.example` ni copies un `config.php` de otra máquina.**
En esta modalidad no necesitas Docker ni `.env`. Para ejecutar esta entrega
no necesitas recompilar JavaScript o SCSS con npm.

## 6. Activar el diseño y el español

1. En **Administración del sitio → Apariencia → Temas → Selector de temas**,
   elige **Tema Institucional (`institution`)** como predeterminado.
2. En **Idioma → Paquetes de idioma**, instala **Español - Internacional (`es`)**
   y configúralo como idioma predeterminado.
3. En **General → Página principal del sitio → Ajustes de la página principal**,
   configura el nombre de la institución y deja todos los elementos de portada
   en **Ninguno**, tanto para visitantes como para usuarios conectados.
   Así no se añade un catálogo nativo debajo del diseño personalizado.
4. Purga las cachés desde Administración del sitio o desde una terminal abierta en `moodle/`:

   ```sh
   php admin/cli/purge_caches.php
   ```

El **logo predeterminado y las imágenes del hero ya vienen en el código**.
Al activar el tema se muestran automáticamente. Puedes reemplazar el logo desde
Apariencia → Logos; el logo cargado allí tendrá prioridad sobre el predeterminado.

Para comprobar la portada, abre **http://localhost:8081/?redirect=0**.
Sin `redirect=0`, Moodle puede enviar al usuario al Área personal según sus preferencias.
Los permisos, matrículas, notas y actividades siguen las reglas nativas de Moodle.

## 7. Programar cron

Moodle necesita ejecutar sus tareas cada minuto. Utiliza la ruta real de PHP y
el script **`moodle/admin/cli/cron.php`**.

En Linux, agrega una entrada al cron del usuario del servidor web, ajustando las rutas:

```cron
* * * * * /usr/bin/php /RUTA/PROYECTO/moodle/admin/cli/cron.php >/dev/null 2>&1
```

En Windows, usa el Programador de tareas: ejecutar `php.exe`, pasar como argumento
la ruta completa a `moodle/admin/cli/cron.php` y repetir cada minuto mientras el equipo esté encendido.

## 8. Comprobación antes de darlo por instalado

- La portada muestra el logo, las tres fotos del hero, las secciones y el footer.
- Los menús y formularios funcionan en escritorio y móvil.
- El administrador puede crear cursos y usuarios.
- No hay cursos ni usuarios demo: en una instalación nueva esto es lo esperado.
- Avisos del campus puede estar vacío hasta crear foros de anuncios y matrículas.
- Los avisos de actualización o servicios no configurados no son fallos del diseño.

## Mantener el código con GitHub

Usa un **repositorio privado** cuya raíz sea esta carpeta `arzobispo-loaysa/`,
no el workspace general ni solamente `moodle/`. Así también se entregan el README
y los ejemplos de configuración. GitHub distribuye el código;
no ejecuta Moodle ni almacena automáticamente sus cursos o archivos privados.

En una instalación existente, antes de descargar cambios, respalda base de datos,
moodledata y configuración. Revisa qué cambió antes de aplicar `git pull`.
Si cambian versiones de Moodle o plugins, sigue el procedimiento de actualización;
no reemplaces indiscriminadamente toda la carpeta.

Nunca subas `.env`, `moodle/config.php`, credenciales, archivos `.demo-*.json`,
bases de datos ni moodledata. El `.gitignore` los excluye en ubicaciones habituales,
pero revisa `git status` antes de subir: los archivos ya versionados no se dejan de
publicar solo por añadirlos al `.gitignore`.

La limpieza del entorno de pruebas es una tarea aparte. No hace falta exportar
su base de datos para entregar este diseño y no debe ejecutarse una herramienta
de datos demo en la instalación nueva.

## Archivos de apoyo

- [Guía Word](documentacion/Guia_instalacion_Loayza.docx): instrucciones sencillas para quien recibe el proyecto.
- [Apache local](configuracion/apache-local.conf.example).
- [PHP local](configuracion/php-local.ini.example).
- [Configuración local de referencia](moodle/config.local.php.example).
- [Instalación con Docker](documentacion/INSTALACION_DOCKER.md): alternativa completa usando contenedores.

Para publicar en Internet, el responsable del servidor debe configurar dominio,
HTTPS, correo, respaldos y permisos seguros. Protege `config.php` contra escritura
desde PHP después de instalar. La puesta en producción no es equivalente a iniciar
este entorno local.

Fuentes: [instalación Moodle 5.1](https://docs.moodle.org/501/en/Installing_Moodle)
y [requisitos Moodle 5.1](https://moodledev.io/general/releases/5.1).
