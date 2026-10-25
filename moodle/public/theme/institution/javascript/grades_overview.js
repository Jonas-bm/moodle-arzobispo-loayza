// This file is part of Moodle - http://moodle.org/
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

/**
 * Present the personal grade overview as accessible course accordions.
 * Existing Moodle links remain the source of truth for permissions and data.
 *
 * @copyright 2026
 * @license http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
(function() {
    const overview = document.querySelector('body.path-grade-report-overview #overview-grade');
    if (!overview || overview.dataset.institutionEnhanced === 'true') {
        return;
    }

    // Flexible tables can include auxiliary rows. A course card is created only
    // when Moodle supplied a real grade-report link in the first cell.
    const rows = Array.from(overview.querySelectorAll('tbody tr')).filter((row) =>
        row.querySelector('th:first-child a[href], td:first-child a[href]')
    );
    if (!rows.length) {
        return;
    }

    const container = document.createElement('div');
    container.className = 'institution-grade-cards';

    const makeIcon = (name) => {
        const icon = document.createElement('i');
        icon.className = `fa fa-${name}`;
        icon.setAttribute('aria-hidden', 'true');
        return icon;
    };

    const setActiveTab = (card, button) => {
        const shouldClose = button.getAttribute('aria-selected') === 'true';
        card.querySelectorAll('.institution-grade-tab').forEach((tab) => {
            const active = !shouldClose && tab === button;
            tab.classList.toggle('is-active', active);
            tab.setAttribute('aria-selected', active ? 'true' : 'false');
            tab.querySelector('.fa-chevron-down, .fa-chevron-up')?.classList.replace(
                active ? 'fa-chevron-down' : 'fa-chevron-up',
                active ? 'fa-chevron-up' : 'fa-chevron-down'
            );
        });
        card.querySelectorAll('.institution-grade-panel').forEach((panel) => {
            panel.hidden = shouldClose || panel.id !== button.getAttribute('aria-controls');
        });
    };

    rows.forEach((row, index) => {
        const cells = row.querySelectorAll('th, td');
        if (cells.length < 2) {
            return;
        }

        const sourceLink = cells[0].querySelector('a[href]');
        const courseName = (sourceLink || cells[0]).textContent.trim();
        const grade = cells[1].textContent.trim() || '-';
        const card = document.createElement('article');
        const header = document.createElement('header');
        const title = document.createElement('h4');
        const summary = document.createElement('div');
        const tabs = document.createElement('div');
        const panels = document.createElement('div');
        const courseAction = document.createElement('a');
        const cardId = `institution-grade-course-${index}`;

        card.className = 'institution-grade-card';
        title.className = 'institution-grade-card__title';
        title.textContent = courseName;
        summary.className = 'institution-grade-card__summary';
        const summaryLabel = document.createElement('span');
        const summaryGrade = document.createElement('strong');
        summaryLabel.textContent = 'Calificación final';
        summaryGrade.textContent = grade;
        summary.append(summaryLabel, summaryGrade);
        header.append(title, summary);

        courseAction.className = 'institution-grade-card__people';
        courseAction.append(makeIcon('users'), document.createTextNode(' Ver listado de compañeros'));
        if (sourceLink) {
            const sourceUrl = new URL(sourceLink.href, window.location.href);
            const courseId = sourceUrl.searchParams.get('id');
            courseAction.href = courseId ? `${M.cfg.wwwroot}/user/index.php?id=${encodeURIComponent(courseId)}` : sourceLink.href;
        }

        tabs.className = 'institution-grade-tabs';
        tabs.setAttribute('role', 'tablist');
        panels.className = 'institution-grade-panels';

        const definitions = [
            {key: 'detail', label: 'Detalle'},
            {key: 'grades', label: 'Mis notas'},
        ];

        definitions.forEach((definition, tabIndex) => {
            const button = document.createElement('button');
            const panel = document.createElement('section');
            const panelId = `${cardId}-${definition.key}`;
            button.type = 'button';
            button.className = 'institution-grade-tab';
            button.setAttribute('role', 'tab');
            button.setAttribute('aria-controls', panelId);
            button.setAttribute('aria-selected', 'false');
            button.append(document.createTextNode(definition.label + ' '), makeIcon('chevron-down'));
            panel.id = panelId;
            panel.className = `institution-grade-panel institution-grade-panel--${definition.key}`;
            if (definition.key === 'grades') {
                // Preserve the component context required by Moodle's native
                // grade-report styles (including category arrow visibility).
                panel.classList.add('grade-report-user');
            }
            panel.setAttribute('role', 'tabpanel');
            panel.hidden = true;

            if (definition.key === 'detail') {
                const detail = document.createElement('p');
                detail.textContent = `Calificación registrada: ${grade}`;
                panel.append(detail);
                if (sourceLink) {
                    const link = sourceLink.cloneNode(true);
                    link.className = 'institution-grade-course-link';
                    link.textContent = 'Ver reporte completo del curso';
                    panel.append(link);
                }
            } else {
                panel.innerHTML = '<p class="institution-grade-loading">Selecciona esta pestaña para cargar tus notas.</p>';
            }

            button.addEventListener('click', async() => {
                setActiveTab(card, button);
                if (definition.key !== 'grades' || panel.dataset.loaded === 'true' || !sourceLink) {
                    return;
                }
                panel.dataset.loaded = 'true';
                panel.innerHTML = '<p class="institution-grade-loading">Cargando notas…</p>';
                try {
                    const response = await fetch(sourceLink.href, {credentials: 'same-origin'});
                    if (!response.ok) {
                        throw new Error(`HTTP ${response.status}`);
                    }
                    const documentResult = new DOMParser().parseFromString(await response.text(), 'text/html');
                    const report = documentResult.querySelector(
                        '#user-grade, .user-grade, table.generaltable:not(#overview-grade)'
                    );
                    if (!report) {
                        throw new Error('Grade report not found');
                    }
                    panel.replaceChildren(report.cloneNode(true));
                } catch (error) {
                    const fallback = sourceLink.cloneNode(true);
                    fallback.textContent = 'Abrir el reporte completo de notas';
                    panel.innerHTML = '<p>No fue posible cargar el detalle dentro de esta página.</p>';
                    panel.append(fallback);
                }
            });
            tabs.append(button);
            panels.append(panel);
        });

        card.append(header, courseAction, tabs, panels);
        container.append(card);
    });

    overview.dataset.institutionEnhanced = 'true';
    overview.parentElement.insertBefore(container, overview);
    document.body.classList.add('institution-grade-overview-ready');
})();
