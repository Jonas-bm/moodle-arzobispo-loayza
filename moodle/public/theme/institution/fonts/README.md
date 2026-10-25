# Fuentes auto-alojadas — theme_institution

Sirven vía `theme/font.php` con el marcador `[[font:theme_institution|…]]`
usado en `scss/_fonts.scss`. Sin dependencias de CDNs externos.

| Archivo | Familia | Subconjunto | Licencia |
|---|---|---|---|
| `hanken-grotesk-latin.woff2` | Hanken Grotesk (variable) | latin | SIL OFL 1.1 |
| `hanken-grotesk-latin-ext.woff2` | Hanken Grotesk (variable) | latin-ext | SIL OFL 1.1 |
| `source-serif-4-latin.woff2` | Source Serif 4 (variable) | latin | SIL OFL 1.1 |
| `source-serif-4-latin-ext.woff2` | Source Serif 4 (variable) | latin-ext | SIL OFL 1.1 |
| `inter-latin.woff2` | Inter (variable) — reserva | latin | SIL OFL 1.1 |
| `inter-latin-ext.woff2` | Inter (variable) — reserva | latin-ext | SIL OFL 1.1 |

- **Hanken Grotesk** — © 2020 The Hanken Grotesk Project Authors — https://github.com/hanken-design/hanken-grotesk
- **Source Serif 4** — © Adobe (Frank Grießhammer) — https://github.com/adobe-fonts/source-serif
- **Inter** — © The Inter Project Authors — https://rsms.me/inter/
- Archivos empaquetados desde [Fontsource](https://fontsource.org/) (`hanken-grotesk:vf`, `source-serif-4:vf`, `inter:vf`).

Texto completo de la licencia en `OFL.txt` (aplica a las cuatro familias).

## Actualizar

```
curl -o hanken-grotesk-latin.woff2     "https://cdn.jsdelivr.net/fontsource/fonts/hanken-grotesk:vf@latest/latin-wght-normal.woff2"
curl -o hanken-grotesk-latin-ext.woff2 "https://cdn.jsdelivr.net/fontsource/fonts/hanken-grotesk:vf@latest/latin-ext-wght-normal.woff2"
curl -o inter-latin.woff2            "https://cdn.jsdelivr.net/fontsource/fonts/inter:vf@latest/latin-wght-normal.woff2"
curl -o inter-latin-ext.woff2        "https://cdn.jsdelivr.net/fontsource/fonts/inter:vf@latest/latin-ext-wght-normal.woff2"
curl -o source-serif-4-latin.woff2     "https://cdn.jsdelivr.net/fontsource/fonts/source-serif-4:vf@latest/latin-wght-normal.woff2"
curl -o source-serif-4-latin-ext.woff2 "https://cdn.jsdelivr.net/fontsource/fonts/source-serif-4:vf@latest/latin-ext-wght-normal.woff2"
```
Después: purgar cachés del tema.
