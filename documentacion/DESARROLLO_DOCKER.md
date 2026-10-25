# Referencia del entorno original con Docker

Para la entrega e instalación local **sin Docker**, usa [README.md](../README.md).
Las siguientes notas describen el entorno de desarrollo previo; no son los pasos de la entrega.

# Arzobispo Loaysa

## Estado actual y continuidad

**Esta instalación ya está creada y personalizada.** Las instrucciones de instalación
de abajo son para una instalación nueva; para retomar ésta utiliza `docker compose up -d`.
El workspace original incluye notas adicionales de continuidad para desarrollo.
Los datos DEMO siguen presentes hasta que se solicite retirarlos para la entrega.

La portada tiene detalles suaves, animaciones que respetan movimiento reducido y
puntos tenues en las secciones blancas. No muestra «Cursos disponibles»:
`frontpage` y `frontpageloggedin` están vacíos, igual que en la base. Se puede
revertir desde los ajustes nativos de la página principal de Moodle.
Se retiró «Explorar cursos» del hero y del footer; «Acceder a mis cursos» lleva
al login y «Ir a mis cursos» lleva a los cursos del usuario conectado.

Esta carpeta es independiente de la base y de las demás universidades.
El identificador Docker es `universidad-arzobispo-loaysa`. No lo cambies después de instalar:
Docker utiliza ese nombre para identificar sus volúmenes de datos.

## Iniciar e instalar

Ejecuta desde esta carpeta:

```sh
docker compose up -d --build
```

Abre http://localhost:8081/admin/index.php y completa la instalación nueva:
acepta la licencia, crea tu cuenta administradora y escribe el nombre
**Arzobispo Loaysa** para el sitio. No hay usuarios ni cursos importados de la base.

Después activa el tema y actualiza sus cachés:

```sh
docker compose exec --user www-data moodle php admin/cli/cfg.php --name=theme --set=institution
docker compose exec --user www-data moodle php admin/cli/purge_caches.php
```

## Personalizar el diseño

- Logo predeterminado: `moodle/public/theme/institution/pix/logo-institucion.png`.
  Aparece automáticamente en cabecera y acceso al activar el tema, sin cargarlo
  en la base de datos. El footer reutiliza el logo de la cabecera.
  Para reemplazarlo, utiliza Apariencia > Logos: los archivos configurados en
  Moodle tienen prioridad. Si se cambia el PNG del tema, purga las cachés.
- Colores y tipografía: `moodle/public/theme/institution/scss/pre.scss`.
- Estilos de páginas: `moodle/public/theme/institution/scss/pages/`.
- Textos y enlaces de portada: `moodle/public/theme/institution/javascript/frontpage_hero.js`.

Los cambios en esta copia no se propagan a la base ni a otras universidades.
Purga las cachés después de editar. Conserva el nombre técnico `institution`.

## Datos y mantenimiento

El servicio Docker `cron` ejecuta las tareas nativas de Moodle cada minuto
mientras el entorno está iniciado. Puedes revisar sus ejecuciones con
`docker compose logs --tail=30 cron`. Comparte únicamente los datos de esta
universidad y no modifica el código de Moodle.

La cookie de sesión de esta instalación está configurada en Moodle como
`ArzobispoLoaysa`. Esto evita conflictos con el Moodle base al usar ambos en
`localhost` con puertos diferentes. El tiempo de inactividad es de 8 horas.
Ambos ajustes se administran en Administración del sitio > Servidor > Gestión
de sesiones (`/admin/settings.php?section=sessionhandling`).

- Base de datos: volumen `universidad-arzobispo-loaysa_dbdata`.
- Archivos: volumen `universidad-arzobispo-loaysa_moodledata`.
- Credenciales locales: `.env`; no lo publiques. `config.php` las lee del entorno.
- `docker compose stop` detiene esta universidad; `docker compose up -d` la inicia.
- `docker compose down` retira contenedores y conserva los volúmenes.
- `docker compose down -v` **elimina los datos**; no lo uses para detener el entorno.

Haz copias coordinadas de la base de datos, `moodledata`, configuración y código.
Respaldar sólo esta carpeta no incluye los datos de los volúmenes Docker.
Cambiar las contraseñas en `.env` no cambia las de una base de datos ya creada.

## Datos ficticios para probar el diseño

Se prepararon tres cursos en la categoría «Pruebas de diseño · DEMO», ocho
estudiantes (`demo.estudiante01` a `demo.estudiante08`) y un docente
(`demo.docente`). Las cuentas tienen correos ficticios. Los estudiantes DEMO
tienen habilitado el panel de notificaciones con sus canales configurables
limitados al aviso web; se conservan las políticas obligatorias de Moodle.
Los accesos están en `moodle/.demo-accesos.json`, excluido de Git; no compartas
ese archivo con la entrega definitiva. Las matrículas están en los cursos,
por lo que el informe de competencias de la portada puede seguir vacío.
Cada curso tiene tres competencias vinculadas del marco «Competencias de
demostración · DEMO», con una escala ficticia «Por iniciar / En desarrollo /
Logrado» y valoraciones de ejemplo. Algunas quedan sin valorar para revisar
también ese estado. Se vinculan al recurso de bienvenida para probar filtros.
No representan el currículo ni las evaluaciones reales de la institución.
Cada estudiante tiene tres calificaciones
ficticias de 0 a 20 por curso, con un promedio calculado por Moodle. Son ítems
manuales del libro de calificaciones; no representan tareas entregadas ni
exámenes reales.

Desde esta carpeta puedes recrear los datos sin duplicarlos:

```sh
docker compose exec -T --user www-data moodle php /dev/stdin crear < herramientas/datos_demo.php
```

Para volver a cargar las notas de ejemplo después de recrear los cursos:

```sh
docker compose exec -T --user www-data moodle php /dev/stdin notas < herramientas/datos_demo.php
```

Para cargar las competencias y sus valoraciones de ejemplo:

```sh
docker compose exec -T --user www-data moodle php /dev/stdin competencias < herramientas/datos_demo.php
```

La pestaña Actividades también incluye una tarea de texto sin calificación,
un foro de práctica, una encuesta con tres opciones y un material de repaso
por curso, todos marcados DEMO. La tarea tiene una fecha de entrega de ejemplo
y no cambia los promedios del libro de calificaciones. Para recrearlos:

```sh
docker compose exec -T --user www-data moodle php /dev/stdin actividades < herramientas/datos_demo.php
```

Estas actividades se eliminan junto con sus cursos al ejecutar `limpiar`.

Cada estudiante DEMO también tiene tres notificaciones ficticias en la campana:
calificación, actividad y competencia. Hay ejemplos leídos y sin leer. Se
crean sólo en el panel web, sin correo ni notificaciones externas. Se activó
su visualización en las ocho cuentas ficticias con autorización del usuario.
El proveedor utilizado por estos ejemplos se valida para impedir que se
generen si obliga a utilizar un canal externo.
Para volver a generar las que falten, sin duplicarlas:

```sh
docker compose exec -T --user www-data moodle php /dev/stdin notificaciones < herramientas/datos_demo.php
```

Sus identificadores quedan registrados en `moodle/.demo-datos.json`, para
retirarlas también al ejecutar `limpiar` antes de la entrega.

El panel de mensajes privados incluye una conversación de tres mensajes
ficticios entre `demo.docente` y `demo.estudiante01`, todos marcados `[DEMO]`.
Se generaron sólo por el canal web y la conversación queda registrada para
eliminarla al limpiar los datos de prueba. Para recrear los mensajes que falten:

```sh
docker compose exec -T --user www-data moodle php /dev/stdin mensajes < herramientas/datos_demo.php
```

El campo «Último acceso» se ocultó a estudiantes mediante Administración del
sitio > Usuarios > Permisos > Políticas de usuario > Ocultar campos de usuario.
Los docentes y administradores conservan su acceso según los permisos nativos.
La lista de participantes incluye también al docente del curso. Los alumnos
ven sus propias notas; el docente puede revisar las de sus estudiantes.

Para retirar exclusivamente los datos DEMO registrados por la herramienta:

```sh
docker compose exec -T --user www-data moodle php /dev/stdin limpiar < herramientas/datos_demo.php
```

La limpieza usa las API de Moodle y conserva el administrador, tema, logo e
idioma. No elimina datos ajenos a su registro `moodle/.demo-datos.json`.
También retira el marco de competencias DEMO y su escala si ya no están en uso.
No matricules personas reales ni agregues contenido definitivo a los cursos
DEMO si vas a eliminarlos. Moodle puede conservar registros de auditoría y
usuarios eliminados: esta limpieza no equivale a una base de datos recién
instalada. Para entregar una instalación sin historial de pruebas, prepara
una instalación nueva y aplica el tema y la configuración institucional.

## Control de versiones y actualizaciones

Se copió el código versionado de la base con sus modificaciones locales;
no se copiaron `.git`, dependencias ignoradas ni archivos privados.
`BASE.json` registra la revisión de origen. Revisa cualquier archivo nuevo del
tema y añádelo al repositorio de la base antes de generar otra universidad.

Puedes iniciar un repositorio propio en esta carpeta (`git init`) para registrar
las personalizaciones. `.env` y `moodle/config.php` están excluidos de Git.
Las mejoras comunes se desarrollan en la base y se revisan antes de aplicarlas
a cada cliente; nunca reemplaces a ciegas todo el tema personalizado.

Este entorno es para desarrollo local. Para producción prepara dominio y HTTPS,
cron de Moodle, correo, copias de seguridad y despliegue de versiones probadas.
