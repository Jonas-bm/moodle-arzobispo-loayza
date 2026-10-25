// This file is part of Moodle - http://moodle.org/
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

/**
 * Landing sections for the site front page, available with or without a
 * logged-in session. Purely presentational and institution-agnostic: every link
 * points to existing Moodle destinations and no data or permission changes.
 *
 * @copyright 2026
 * @license http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
(function() {
    'use strict';

    // Moodle imprime M.str después de los scripts del tema en el footer.
    var initLanding = function() {

        var body = document.body;
        var wwwroot = (window.M && M.cfg && M.cfg.wwwroot) ? M.cfg.wwwroot : '';

        // El logo siempre lleva a la portada, incluso si el inicio del usuario
        // está configurado como Área personal o Mis cursos.
        var navbarBrand = document.querySelector('.navbar a.navbar-brand');
        if (navbarBrand) {
            navbarBrand.href = wwwroot + '/?redirect=0';
        }

        var isFrontpage = body.id === 'page-site-index' ||
            body.classList.contains('pagelayout-frontpage');
        if (!isFrontpage) {
            return;
        }

        var main = document.querySelector('#region-main');
        if (!main || main.dataset.institutionHero === 'true') {
            return;
        }
        main.dataset.institutionHero = 'true';
        body.classList.add('has-institution-hero');

        var isGuest = body.classList.contains('notloggedin');
        var coursesUrl = wwwroot + (isGuest ? '/login/index.php' : '/my/courses.php');
        var coursesLabel = isGuest ? 'Acceder a mis cursos' : 'Ir a mis cursos';

        var brandEl = document.querySelector('.navbar .navbar-brand, header .site-name, .navbar .site-name');
        var brandLogo = brandEl && brandEl.querySelector('img');
        var siteName = (brandLogo && brandLogo.alt) || (brandEl && brandEl.textContent.trim()) || 'Arzobispo Loaysa';
        var nameContainer = document.createElement('span');
        nameContainer.textContent = siteName;
        siteName = nameContainer.innerHTML;
        var year = new Date().getFullYear();

        var e = function(html) {
            var t = document.createElement('template');
            t.innerHTML = html.trim();
            return t.content.firstChild;
        };
        var list = function(arr, fn) { return arr.map(fn).join(''); };

        // --- HERO (carrusel a pantalla completa) --------------------------
        var hero = e(
            '<section class="institution-hero" aria-label="' + M.util.get_string('herocarousel', 'theme_institution') + '">' +
                '<div class="institution-hero__slides" aria-hidden="true">' +
                    list([1, 2, 3], function(number) {
                        return '<img class="institution-hero__slide' + (number === 1 ? ' is-active' : '') +
                            '" src="' + wwwroot + '/theme/institution/pix/hero/img' + number + 'm.webp"' +
                            ' alt="" width="1916" height="821" decoding="async"' +
                            (number === 1 ? ' fetchpriority="high"' : ' loading="eager"') + '>';
                    }) +
                '</div>' +
                '<div class="institution-hero__inner">' +
                    '<div class="institution-hero__content">' +
                        '<h1 class="institution-hero__title">Tu campus,<br>siempre contigo.</h1>' +
                        '<p class="institution-hero__lead">Accede a tus cursos, materiales de estudio, ' +
                            'calificaciones y avisos desde un solo lugar, en cualquier momento y ' +
                            'desde cualquier dispositivo.</p>' +
                        '<div class="institution-hero__actions">' +
                            '<a class="institution-btn institution-btn--primary" href="' + coursesUrl + '">' +
                                '<i class="fa-solid fa-arrow-right-to-bracket" aria-hidden="true"></i> ' + coursesLabel + '</a>' +
                        '</div>' +
                    '</div>' +
                    '<aside class="institution-hero-notice" aria-labelledby="institution-notice-title">' +
                        '<div class="institution-hero-notice__head">' +
                            '<span class="institution-hero-notice__icon">' +
                                '<i class="fa-solid fa-bullhorn" aria-hidden="true"></i></span>' +
                            '<span class="institution-hero-notice__eyebrow">' +
                                M.util.get_string('heronoticecategory', 'theme_institution') + '</span>' +
                        '</div>' +
                        '<h2 id="institution-notice-title">' +
                            M.util.get_string('heronoticetitle', 'theme_institution') + '</h2>' +
                        '<p class="institution-hero-notice__description">' +
                            M.util.get_string('heronoticedescription', 'theme_institution') + '</p>' +
                        '<a class="institution-hero-notice__link" href="' + wwwroot + '/theme/institution/avisos.php">' +
                            M.util.get_string('heronoticelink', 'theme_institution') +
                            '<i class="fa-solid fa-arrow-right" aria-hidden="true"></i></a>' +
                    '</aside>' +
                '</div>' +
                '<div class="institution-hero__controls">' +
                    list([1, 2, 3], function(number) {
                        return '<button type="button" class="institution-hero__dot" aria-label="' +
                            M.util.get_string('heroimage', 'theme_institution', number) +
                            '" aria-pressed="' + (number === 1) + '"><span></span></button>';
                    }) +
                '</div>' +
            '</section>'
        );

        // Las herramientas de portada se integran en el hero solo en esta vista.
        var frontpageNavigation = document.querySelector('#page .secondary-navigation');
        if (frontpageNavigation) {
            hero.classList.add('institution-hero--with-navigation');
            hero.insertBefore(frontpageNavigation, hero.firstChild);
        }

        var slides = hero.querySelectorAll('.institution-hero__slide');
        var dots = hero.querySelectorAll('.institution-hero__dot');
        var activeSlide = 0;
        var timer;
        var readySlides = new Set();
        var showSlide = function(index) {
            if (!readySlides.has(index)) {
                return;
            }
            activeSlide = index;
            slides.forEach(function(slide, i) {
                slide.classList.toggle('is-active', i === index);
                dots[i].setAttribute('aria-pressed', String(i === index));
            });
        };
        // Preparar las imágenes antes del fundido para evitar cuadros vacíos o tirones.
        slides.forEach(function(slide, index) {
            var prepare = function() {
                var decoded = slide.decode ? slide.decode() : Promise.resolve();
                decoded.then(function() {
                    if (slide.naturalWidth) {
                        readySlides.add(index);
                        if (!readySlides.has(activeSlide)) {
                            showSlide(index);
                        }
                    }
                }).catch(function() {
                    // Una imagen fallida no bloquea el resto del carrusel.
                });
            };
            slide.addEventListener('load', prepare);
            if (slide.complete && slide.naturalWidth) {
                prepare();
            }
        });
        var schedule = function() {
            window.clearInterval(timer);
            if (!document.hidden) {
                timer = window.setInterval(function() {
                    // Saltar imágenes que aún no cargan o fallaron; continuar con las disponibles.
                    for (var offset = 1; offset < slides.length; offset++) {
                        var next = (activeSlide + offset) % slides.length;
                        if (readySlides.has(next)) {
                            showSlide(next);
                            break;
                        }
                    }
                }, 8000);
            }
        };
        dots.forEach(function(dot, index) {
            dot.addEventListener('click', function() {
                showSlide(index);
                schedule();
            });
        });
        document.addEventListener('visibilitychange', schedule);
        window.addEventListener('pageshow', schedule);
        schedule();

        // --- Bloque de secciones -----------------------------------------------
        var card = function(it) {
            return '<article class="institution-card">' +
                '<span class="institution-card__icon"><i class="fa-solid ' + it[0] + '" aria-hidden="true"></i></span>' +
                '<h3 class="institution-card__title">' + it[1] + '</h3>' +
                '<p class="institution-card__text">' + it[2] + '</p>' +
                '<ul class="institution-card__list">' +
                    list(it[3], function(p) { return '<li>' + p + '</li>'; }) +
                '</ul>' +
            '</article>';
        };

        var featureItems = [
            ['fa-book-open', 'Todos tus cursos',
                'Cada asignatura reúne sus contenidos, actividades y espacios de trabajo en un mismo lugar, ' +
                'organizados por temas para que siempre sepas dónde continuar.',
                ['Apuntes, lecturas y vídeos', 'Tareas, cuestionarios y entregas', 'Foros de dudas de cada tema']],
            ['fa-calendar-check', 'Calendario y avisos',
                'Todas las fechas importantes del curso en un solo calendario, con avisos que te llegan a tiempo ' +
                'para que no se te escape ninguna entrega.',
                ['Fechas de entrega y exámenes', 'Eventos y sesiones en directo', 'Novedades del profesorado']],
            ['fa-chart-line', 'Calificaciones y progreso',
                'Consulta en cualquier momento tus notas y tu avance en cada asignatura, con el detalle de ' +
                'cada actividad evaluada y los comentarios de tu docente.',
                ['Nota de cada actividad', 'Media y progreso del curso', 'Retroalimentación personalizada']],
            ['fa-comments', 'Comunicación',
                'Mantente en contacto con tu profesorado y tus compañeros sin salir de la plataforma, ' +
                'desde cualquier curso y en cualquier dispositivo.',
                ['Mensajería privada', 'Foros por asignatura', 'Notificaciones configurables']]
        ];
        var features = e(
            '<section class="institution-section institution-section--white institution-section--learning">' +
                '<div class="institution-section__head">' +
                    '<h2>Todo lo que necesitas para aprender</h2>' +
                    '<p>Una plataforma pensada para acompañarte durante todo el curso, desde el primer día ' +
                        'hasta la evaluación final.</p>' +
                '</div>' +
                '<div class="institution-grid institution-grid--4">' +
                    list(featureItems, card) +
                '</div>' +
            '</section>'
        );

        var resourceItems = [
            ['fa-book-bookmark', 'Biblioteca y materiales',
                'Encuentra en cada curso los apuntes, lecturas y recursos que tu profesorado pone a tu ' +
                'disposición, disponibles para consultar o descargar cuando los necesites.',
                ['Documentos y presentaciones', 'Enlaces y material de apoyo', 'Contenido siempre accesible']],
            ['fa-calendar-days', 'Calendario académico',
                'Un único calendario con las fechas clave de todas tus asignaturas: entregas, exámenes, ' +
                'actividades y eventos institucionales.',
                ['Vista mensual y por curso', 'Recordatorios automáticos', 'Sincronizable con tu agenda']],
            ['fa-bullhorn', 'Avisos y noticias',
                'Recibe los comunicados de tus cursos y de tu institución en el momento en que se publican, ' +
                'para estar siempre al día de lo que ocurre.',
                ['Anuncios del profesorado', 'Comunicados institucionales', 'Aviso por correo y en la app']]
        ];
        var resources = e(
            '<section class="institution-section institution-section--canvas institution-section--resources">' +
                '<div class="institution-section__head">' +
                    '<h2>Recursos para ti</h2>' +
                    '<p>Acceso rápido a las herramientas que usas cada día para organizar tu estudio.</p>' +
                '</div>' +
                '<div class="institution-grid institution-grid--3">' +
                    list(resourceItems, card) +
                '</div>' +
            '</section>'
        );

        var statItems = [
            ['24/7', 'Acceso cuando lo necesites'],
            ['100%', 'En línea, sin instalaciones'],
            ['Multi', 'Móvil, tablet y ordenador']
        ];
        var stats = e(
            '<section class="institution-band">' +
                '<img class="institution-band__background" src="' + wwwroot +
                    '/theme/institution/pix/hero/img3m.webp" alt="" aria-hidden="true"' +
                    ' width="1916" height="821" loading="lazy" decoding="async">' +
                '<div class="institution-band__inner">' +
                    '<h2 class="institution-band__title">Pensado para toda la comunidad</h2>' +
                    '<div class="institution-band__grid">' +
                        list(statItems, function(it) {
                            return '<div class="institution-stat">' +
                                '<span class="institution-stat__value">' + it[0] + '</span>' +
                                '<span class="institution-stat__label">' + it[1] + '</span>' +
                            '</div>';
                        }) +
                    '</div>' +
                '</div>' +
            '</section>'
        );

        var stepItems = [
            ['1', 'Accede con tu cuenta', 'Usa el usuario y la contraseña que te facilitó tu institución.'],
            ['2', 'Encuentra tus cursos', 'Al entrar verás las asignaturas en las que estás matriculado.'],
            ['3', 'Aprende a tu ritmo', 'Consulta materiales, entrega tareas y sigue tu progreso cuando quieras.']
        ];
        var steps = e(
            '<section class="institution-section institution-section--white institution-section--steps">' +
                '<div class="institution-section__head">' +
                    '<h2>Empezar es muy fácil</h2>' +
                    '<p>En tres pasos estarás dentro de tus cursos.</p>' +
                '</div>' +
                '<ol class="institution-grid institution-grid--3 institution-steps">' +
                    list(stepItems, function(it) {
                        return '<li class="institution-step">' +
                            '<span class="institution-step__num">' + it[0] + '</span>' +
                            '<div><h3>' + it[1] + '</h3><p>' + it[2] + '</p></div>' +
                        '</li>';
                    }) +
                '</ol>' +
            '</section>'
        );

        var faqItems = [
            ['¿Cómo accedo a la plataforma?',
                'Pulsa «Acceder a mis cursos» e introduce el usuario y la contraseña que te facilitó tu institución. ' +
                'Si es tu primer acceso, es posible que se te pida cambiar la contraseña.'],
            ['Olvidé mi contraseña, ¿qué hago?',
                'En la página de acceso usa el enlace «¿Olvidaste tu contraseña?». Recibirás un correo con instrucciones ' +
                'para establecer una nueva.'],
            ['¿Dónde veo mis cursos y mis calificaciones?',
                'Al iniciar sesión encontrarás tus cursos en el panel principal. Dentro de cada curso, en el menú, ' +
                'está el apartado «Calificaciones» con tus notas y tu progreso.'],
            ['¿Cómo contacto con mi docente?',
                'Desde cada curso puedes escribir un mensaje privado a tu profesorado o participar en los foros de la asignatura.'],
            ['No aparece un curso en el que debería estar matriculado',
                'La matrícula la gestiona tu institución. Ponte en contacto con la secretaría o con el equipo de soporte ' +
                'para que revisen tu inscripción.'],
            ['¿Puedo usar la plataforma desde el móvil?',
                'Sí. Funciona en el navegador de cualquier móvil o tablet, sin necesidad de instalar nada.'],
            ['¿Cómo entrego una tarea?',
                'Abre la actividad de entrega dentro del curso, adjunta tu archivo o escribe tu respuesta y confirma el ' +
                'envío antes de la fecha límite.'],
            ['¿Están seguros mis datos?',
                'El acceso es personal y cifrado. Solo tú y el personal autorizado de tu institución pueden consultar ' +
                'tu información académica.']
        ];
        var faq = e(
            '<section class="institution-section institution-section--canvas" id="institution-faq">' +
                '<div class="institution-faq-layout">' +
                    '<div class="institution-faq__aside">' +
                        '<h2>Preguntas frecuentes</h2>' +
                        '<p>Resolvemos las dudas más habituales sobre el acceso y el uso de la ' +
                            'plataforma. Si necesitas ayuda con tu cuenta o tu matrícula, ponte en ' +
                            'contacto con el equipo de soporte de tu institución.</p>' +
                    '</div>' +
                    '<div class="institution-faq">' +
                        list(faqItems, function(it) {
                            return '<details class="institution-faq__item">' +
                                '<summary>' + it[0] +
                                    '<i class="fa-solid fa-chevron-down" aria-hidden="true"></i></summary>' +
                                '<div class="institution-faq__body"><p>' + it[1] + '</p></div>' +
                            '</details>';
                        }) +
                    '</div>' +
                '</div>' +
            '</section>'
        );

        // --- FOOTER -----------------------------------------------------------
        // TODO institución: sustituir los href="#" por las URLs reales.
        var socials = [
            ['fa-facebook-f', 'Facebook'],
            ['fa-instagram', 'Instagram'],
            ['fa-x-twitter', 'X'],
            ['fa-youtube', 'YouTube']
        ];
        var footer = e(
            '<footer class="institution-footer">' +
                '<div class="institution-footer__inner">' +
                    '<div class="institution-footer__brand">' +
                        '<span class="institution-footer__logo"><i class="fa-solid fa-graduation-cap" aria-hidden="true"></i>' +
                            '<span>' + siteName + '</span></span>' +
                        '<p class="institution-footer__tagline">Tu campus digital: aprende desde cualquier lugar, ' +
                            'en cualquier momento.</p>' +
                        '<ul class="institution-footer__social">' +
                            list(socials, function(s) {
                                return '<li><a href="#" aria-label="' + s[1] + '">' +
                                    '<i class="fa-brands ' + s[0] + '" aria-hidden="true"></i></a></li>';
                            }) +
                        '</ul>' +
                    '</div>' +
                    '<nav class="institution-footer__col" aria-label="Plataforma">' +
                        '<h2>Plataforma</h2>' +
                        '<ul>' +
                            '<li><a href="' + wwwroot + '/?redirect=0">Inicio</a></li>' +
                            '<li><a href="' + coursesUrl + '">' + coursesLabel + '</a></li>' +
                        '</ul>' +
                    '</nav>' +
                    '<nav class="institution-footer__col" aria-label="Recursos">' +
                        '<h2>Recursos</h2>' +
                        '<ul>' +
                            '<li><a href="#institution-faq">Preguntas frecuentes</a></li>' +
                            '<li><a href="#institution-faq">Ayuda y soporte</a></li>' +
                        '</ul>' +
                    '</nav>' +
                '</div>' +
                '<div class="institution-footer__bar">' +
                    '<span>&copy; ' + year + ' ' + siteName + '. Todos los derechos reservados.</span>' +
                '</div>' +
            '</footer>'
        );

        // Reutilizar el logo oficial configurado en la cabecera.
        if (brandLogo) {
            var footerLogo = brandLogo.cloneNode(false);
            footerLogo.className = 'institution-footer__brand-image';
            footerLogo.removeAttribute('width');
            footerLogo.removeAttribute('height');
            footerLogo.loading = 'lazy';
            var footerLetters = footerLogo.cloneNode(false);
            footerLetters.classList.add('institution-footer__brand-image--letters');
            footerLetters.alt = '';
            footerLetters.setAttribute('aria-hidden', 'true');
            var footerBrand = footer.querySelector('.institution-footer__logo');
            footerBrand.classList.add('institution-footer__logo--inverse');
            footerBrand.replaceChildren(footerLogo, footerLetters);
        }

        // Insertar las secciones de contenido al principio de #region-main.
        [faq, steps, stats, resources, features, hero].forEach(function(node) {
            main.insertBefore(node, main.firstChild);
        });

        // El footer va al final de #page-wrapper (fuera de #page) para ocupar todo
        // el ancho y quedar pegado al fondo en páginas cortas (flex en _landing.scss).
        var pageWrapper = document.querySelector('#page-wrapper') || main;
        pageWrapper.appendChild(footer);

        // Entradas por sección, una sola vez y escalonadas dentro de cada grupo.
        var motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
        if ('IntersectionObserver' in window && !motionPreference.matches) {
            var revealGroups = [features, resources, stats, steps, faq];
            var revealSelector = '.institution-section__head, .institution-card, .institution-step, ' +
                '.institution-band__title, .institution-stat, .institution-faq__aside, ' +
                '.institution-faq__item, .institution-footer__brand, .institution-footer__col, ' +
                '.institution-footer__bar';
            var revealGroup = function(group, animate) {
                group.querySelectorAll('.institution-reveal-pending').forEach(function(element) {
                    entranceObserver.unobserve(element);
                    element.classList.remove('institution-reveal-pending');
                    if (animate) {
                        element.classList.add('institution-enter');
                    }
                });

            };
            var entranceObserver = new IntersectionObserver(function(entries) {
                entries.forEach(function(entry) {
                    if (entry.isIntersecting) {
                        entry.target.classList.remove('institution-reveal-pending');
                        entry.target.classList.add('institution-enter');
                        entranceObserver.unobserve(entry.target);
                    }
                });
            }, {threshold: 0, rootMargin: '0px 0px -' + Math.round(window.innerHeight * .25) + 'px 0px'});
            revealGroups.forEach(function(group, groupIndex) {
                // Mantener visible el contenido ya visto o restaurado por el navegador.
                group.querySelectorAll(revealSelector).forEach(function(element, index) {
                    var bounds = element.getBoundingClientRect();
                    if (bounds.top < window.innerHeight * .75) {
                        return;
                    }
                    var center = bounds.left + bounds.width / 2;
                    var direction = Math.abs(center - window.innerWidth / 2) < 24 ?
                        (groupIndex % 2 === 0 ? -1 : 1) : (center < window.innerWidth / 2 ? -1 : 1);
                    element.style.setProperty('--institution-reveal-direction', direction);
                    element.style.setProperty('--institution-reveal-delay', Math.min(index, 5) * 140 + 'ms');
                    element.classList.add('institution-reveal-pending');
                    entranceObserver.observe(element);
                    element.addEventListener('animationend', function(event) {
                        if (event.target === element && event.animationName === 'institution-enter') {
                            element.classList.remove('institution-enter');
                            element.style.removeProperty('--institution-reveal-delay');
                            element.style.removeProperty('--institution-reveal-direction');
                        }
                    });
                });
                group.addEventListener('focusin', function() { revealGroup(group, false); });

            });
            motionPreference.addEventListener('change', function(event) {
                if (event.matches) {
                    revealGroups.forEach(function(group) {
                        revealGroup(group, false);
                        group.querySelectorAll('.institution-enter').forEach(function(element) {
                            element.classList.remove('institution-enter');
                        });
                    });
                    entranceObserver.disconnect();
                }
            });
        }

    };
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initLanding, {once: true});
    } else {
        initLanding();
    }
})();
