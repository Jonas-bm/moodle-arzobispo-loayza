// This file is part of Moodle - http://moodle.org/
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

/**
 * Enhance the calendar course filter with Moodle's accessible autocomplete.
 *
 * The calendar replaces its markup when navigating between months, so the
 * enhancement is reapplied after core_calendar announces a refreshed view.
 *
 * @copyright 2026
 * @license http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
(function() {
    const selectSelector = 'select.cal_courses_flt:not([data-institution-enhanced])';

    const close = (control) => {
        const trigger = control.querySelector('.institution-calendar-select__trigger');
        const menu = control.institutionMenu || control.querySelector('.institution-calendar-select__menu');
        trigger.setAttribute('aria-expanded', 'false');
        menu.hidden = true;
        menu.removeAttribute('style');
        if (control.isConnected && menu.parentElement !== control) {
            control.append(menu);
        }
    };

    const enhance = (select) => {
        select.dataset.institutionEnhanced = 'true';

        const control = document.createElement('div');
        control.className = 'institution-calendar-select';

        const trigger = document.createElement('button');
        trigger.type = 'button';
        trigger.className = 'institution-calendar-select__trigger';
        trigger.setAttribute('aria-haspopup', 'listbox');
        trigger.setAttribute('aria-expanded', 'false');

        const label = document.createElement('span');
        label.className = 'institution-calendar-select__label';
        trigger.append(label);

        const chevron = document.createElement('span');
        chevron.className = 'institution-calendar-select__chevron';
        chevron.setAttribute('aria-hidden', 'true');
        chevron.textContent = '\u2304';
        trigger.append(chevron);

        const menu = document.createElement('div');
        menu.className = 'institution-calendar-select__menu';
        menu.setAttribute('role', 'listbox');
        menu.hidden = true;
        control.institutionMenu = menu;

        Array.from(select.options).forEach((option) => {
            const item = document.createElement('button');
            item.type = 'button';
            item.className = 'institution-calendar-select__option';
            item.setAttribute('role', 'option');
            item.dataset.value = option.value;
            item.textContent = option.text;

            if (option.selected) {
                item.classList.add('is-selected');
                item.setAttribute('aria-selected', 'true');
                label.textContent = option.text;
            } else {
                item.setAttribute('aria-selected', 'false');
            }

            item.addEventListener('click', () => {
                if (select.value !== item.dataset.value) {
                    select.value = item.dataset.value;
                    select.dispatchEvent(new Event('change', {bubbles: true}));
                }
                close(control);
                trigger.focus();
            });
            menu.append(item);
        });

        trigger.addEventListener('click', () => {
            const willOpen = menu.hidden;
            document.querySelectorAll('.institution-calendar-select').forEach(close);
            trigger.setAttribute('aria-expanded', String(willOpen));
            if (willOpen) {
                const rect = trigger.getBoundingClientRect();
                document.body.append(menu);
                menu.style.position = 'fixed';
                menu.style.top = `${rect.bottom + 4}px`;
                menu.style.left = `${rect.left}px`;
                menu.style.width = `${rect.width}px`;
                menu.style.zIndex = '10000';
                menu.hidden = false;
                menu.querySelector('.is-selected, .institution-calendar-select__option')?.focus();
            } else {
                close(control);
            }
        });

        control.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') {
                close(control);
                trigger.focus();
            }
        });

        select.before(control);
        control.append(trigger, menu);
        select.classList.add('institution-calendar-select__native');
    };

    const enhanceCalendarFilters = () => document.querySelectorAll(selectSelector).forEach(enhance);

    document.addEventListener('click', (event) => {
        document.querySelectorAll('.institution-calendar-select').forEach((control) => {
            const menu = control.institutionMenu;
            if (!control.contains(event.target) && !menu?.contains(event.target)) {
                close(control);
            }
        });
    });

    window.addEventListener('resize', () => {
        document.querySelectorAll('.institution-calendar-select').forEach(close);
    });

    window.addEventListener('scroll', () => {
        document.querySelectorAll('.institution-calendar-select').forEach(close);
    }, true);

    enhanceCalendarFilters();
    document.body.addEventListener('calendar-events:view_updated', enhanceCalendarFilters);
})();
