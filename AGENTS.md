# Repository Guidelines

## Project Structure & Module Organization

The workspace root contains `Dockerfile` and `docker-compose.yml`; the Moodle application and its Git repository live in `moodle/`. Moodle 5.1 serves HTTP requests from `moodle/public/`.

- `moodle/public/lib/`: core libraries and shared infrastructure.
- `moodle/public/mod/`, `blocks/`, and `local/`: activity modules, blocks, and local plugins.
- `moodle/public/theme/institution/`: custom theme inheriting from Boost. Keep institution-specific changes here; preserve upstream core and Boost files.
- Component directories contain `classes/`, `templates/`, `lang/`, `pix/`, and `tests/`. JavaScript sources live in `amd/src/`; generated bundles live in `amd/build/`.

## Build, Test, and Development Commands

Run Docker commands from the workspace root:

- `docker compose up -d --build`: build PHP 8.3/Apache and start Moodle with MariaDB; browse `http://localhost:8080` after installation/configuration.
- `docker compose logs -f moodle`: inspect application container logs.
- `docker compose exec moodle php admin/cli/purge_caches.php`: refresh Moodle caches after theme or configuration changes.

Run dependency and development commands from `moodle/`:

- `composer install`: install PHP dependencies, including test frameworks.
- `nvm use && npm ci`: use the pinned Node 22 release and install locked frontend dependencies.
- `npx grunt amd`: lint and compile AMD JavaScript.
- `npx grunt scss`: lint SCSS; Moodle compiles theme SCSS through its theme system.

## Coding Style & Naming Conventions

Follow surrounding Moodle code: four-space indentation for PHP and JavaScript, PHPDoc/JSDoc documentation, and component names such as `theme_institution`. Use component namespaces for PHP classes and language files for user-facing strings. Follow `.eslintrc`, `.stylelintrc`, and the Moodle PHP_CodeSniffer ruleset in `phpcs.xml.dist`; PHP_CodeSniffer requires separate tooling. Rebuild generated JavaScript rather than editing bundles directly.

## Testing Guidelines

Use PHPUnit 11 for PHP tests (`tests/*_test.php`) and Behat for browser scenarios (`tests/behat/*.feature`). Configure isolated test database prefixes and data directories using `config-dist.php` guidance before initializing tests:

```sh
php public/admin/tool/phpunit/cli/init.php
vendor/bin/phpunit public/path/to/component/tests/example_test.php
```

Add regression coverage for behavior changes; no numeric coverage threshold is configured. For theme changes, check desktop/mobile layouts and include screenshots.

## Commit & Pull Request Guidelines

Run Git commands inside `moodle/`. Recent commits use `theme_institution: <concise description>`, often in Spanish. Keep commits focused. Local review descriptions should explain the change, link relevant issues, and record validation and visual evidence. Upstream Moodle contributions require a Tracker issue and published patch branch, rather than a GitHub pull request; see `moodle/CONTRIBUTING.md`.

## Security & Configuration

Keep credentials and runtime configuration out of commits. Docker credentials are for local development. Preserve database and moodledata volumes; configure the web server document root as `moodle/public/`.
