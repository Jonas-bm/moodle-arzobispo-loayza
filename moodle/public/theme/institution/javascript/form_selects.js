// This file is part of Moodle - http://moodle.org/
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

/**
 * Provide an accessible animated presentation for front page settings selects.
 *
 * @copyright 2026
 * @license http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
(function() {
    const selector = [
        'body#page-admin-setting-frontpagesettings #adminsettings select.form-select:not([multiple])',
        'body.path-user select:not([multiple]):not(.cal_courses_flt)',
    ].join(',');
    const controls = new Set();

    const positionMenu = (control) => {
        if (control.menu.hidden) {
            return;
        }

        const viewportGap = 12;
        const menuGap = 5;
        const minimumReadableWidth = 240;
        const rect = control.trigger.getBoundingClientRect();
        const width = Math.min(
            Math.max(rect.width, minimumReadableWidth),
            window.innerWidth - (viewportGap * 2)
        );
        const left = Math.min(
            Math.max(rect.left, viewportGap),
            window.innerWidth - width - viewportGap
        );
        const spaceBelow = window.innerHeight - rect.bottom - viewportGap - menuGap;
        const spaceAbove = rect.top - viewportGap - menuGap;
        const openAbove = spaceBelow < 180 && spaceAbove > spaceBelow;
        const availableHeight = Math.max(120, openAbove ? spaceAbove : spaceBelow);

        control.menu.style.position = 'fixed';
        control.menu.style.left = `${left}px`;
        control.menu.style.width = `${width}px`;
        control.menu.style.maxHeight = `${Math.min(352, availableHeight)}px`;
        control.menu.style.zIndex = '10000';
        control.menu.dataset.placement = openAbove ? 'top' : 'bottom';

        if (openAbove) {
            control.menu.style.top = 'auto';
            control.menu.style.bottom = `${window.innerHeight - rect.top + menuGap}px`;
        } else {
            control.menu.style.top = `${rect.bottom + menuGap}px`;
            control.menu.style.bottom = 'auto';
        }
    };

    const close = (control) => {
        const menu = control.menu;
        control.trigger.setAttribute('aria-expanded', 'false');
        menu.hidden = true;
        menu.removeAttribute('style');
        if (control.isConnected && menu.parentElement !== control) {
            control.append(menu);
        }
    };

    const closeAll = (except = null) => controls.forEach((control) => {
        if (control !== except) {
            close(control);
        }
    });

    const focusOption = (menu, direction) => {
        const options = Array.from(menu.querySelectorAll('.institution-form-select__option'));
        const current = options.indexOf(document.activeElement);
        let next = current + direction;
        if (current === -1) {
            next = direction > 0 ? 0 : options.length - 1;
        }
        options[Math.max(0, Math.min(options.length - 1, next))]?.focus();
    };

    const open = (control) => {
        closeAll(control);
        control.trigger.setAttribute('aria-expanded', 'true');
        document.body.append(control.menu);
        control.menu.hidden = false;
        positionMenu(control);
        const selected = control.menu.querySelector('.is-selected, .institution-form-select__option');
        selected?.focus({preventScroll: true});
        selected?.scrollIntoView({block: 'nearest'});
    };

    const enhance = (select) => {
        if (select.dataset.institutionFormEnhanced ||
                select.closest('.form-autocomplete, [data-filterregion="filtertypedata"]') ||
                select.getClientRects().length === 0) {
            return;
        }
        select.dataset.institutionFormEnhanced = 'true';
        const originalWidth = select.getBoundingClientRect().width;

        const control = document.createElement('div');
        const trigger = document.createElement('button');
        const label = document.createElement('span');
        const chevron = document.createElement('span');
        const menu = document.createElement('div');

        control.className = 'institution-form-select';
        if (originalWidth < 240) {
            control.classList.add('institution-form-select--compact');
        }
        trigger.type = 'button';
        trigger.className = 'institution-form-select__trigger';
        trigger.id = `${select.id}-institution-trigger`;
        trigger.setAttribute('aria-haspopup', 'listbox');
        trigger.setAttribute('aria-expanded', 'false');
        if (select.getAttribute('aria-describedby')) {
            trigger.setAttribute('aria-describedby', select.getAttribute('aria-describedby'));
        }
        trigger.disabled = select.disabled;
        label.className = 'institution-form-select__label';
        chevron.className = 'institution-form-select__chevron fa fa-chevron-down';
        chevron.setAttribute('aria-hidden', 'true');
        menu.className = 'institution-form-select__menu';
        menu.setAttribute('role', 'listbox');
        menu.id = `${select.id}-institution-menu`;
        menu.hidden = true;
        trigger.setAttribute('aria-controls', menu.id);

        trigger.append(label, chevron);
        control.append(trigger, menu);
        control.trigger = trigger;
        control.menu = menu;
        controls.add(control);

        const sync = () => {
            label.textContent = select.selectedOptions[0]?.textContent || '';
            menu.querySelectorAll('.institution-form-select__option').forEach((item) => {
                const selected = item.dataset.value === select.value;
                item.classList.toggle('is-selected', selected);
                item.setAttribute('aria-selected', String(selected));
            });
        };

        const renderOptions = () => {
            menu.replaceChildren();
            let currentGroup = null;
            Array.from(select.options).forEach((option) => {
                const optionGroup = option.closest('optgroup');
                if (optionGroup && optionGroup !== currentGroup) {
                    const heading = document.createElement('div');
                    heading.className = 'institution-form-select__group';
                    heading.textContent = optionGroup.label;
                    heading.setAttribute('role', 'presentation');
                    menu.append(heading);
                    currentGroup = optionGroup;
                } else if (!optionGroup) {
                    currentGroup = null;
                }
                const item = document.createElement('button');
                item.type = 'button';
                item.className = 'institution-form-select__option';
                item.setAttribute('role', 'option');
                item.dataset.value = option.value;
                item.textContent = option.textContent;
                item.disabled = option.disabled;
                item.addEventListener('click', () => {
                    select.value = item.dataset.value;
                    select.dispatchEvent(new Event('change', {bubbles: true}));
                    close(control);
                    trigger.focus();
                });
                menu.append(item);
            });
            sync();
            positionMenu(control);
        };

        renderOptions();

        trigger.addEventListener('click', () => {
            if (menu.hidden) {
                open(control);
            } else {
                close(control);
            }
        });
        trigger.addEventListener('keydown', (event) => {
            if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
                event.preventDefault();
                open(control);
            }
        });
        menu.addEventListener('keydown', (event) => {
            if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
                event.preventDefault();
                focusOption(menu, event.key === 'ArrowDown' ? 1 : -1);
            } else if (event.key === 'Home' || event.key === 'End') {
                event.preventDefault();
                const options = menu.querySelectorAll('.institution-form-select__option');
                options[event.key === 'Home' ? 0 : options.length - 1]?.focus();
            } else if (event.key === 'Escape') {
                close(control);
                trigger.focus();
            }
        });
        select.addEventListener('change', sync);
        new MutationObserver((mutations) => {
            trigger.disabled = select.disabled;
            if (mutations.some((mutation) => mutation.type === 'childList' || mutation.target !== select)) {
                renderOptions();
            } else {
                sync();
            }
        }).observe(select, {
            attributes: true,
            attributeFilter: ['disabled', 'selected'],
            childList: true,
            subtree: true,
        });

        select.before(control);
        select.classList.add('institution-form-select__native');
        select.tabIndex = -1;
        document.querySelector(`label[for="${CSS.escape(select.id)}"]`)?.setAttribute('for', trigger.id);
        sync();
    };

    const expandEditor = () => {
        document.querySelectorAll([
            '#admin-summary > .form-setting',
            '#admin-summary .form-htmlarea',
            '#admin-summary .form-htmlarea .htmlarea',
            '#admin-summary .tox.tox-tinymce',
        ].join(',')).forEach((element) => {
            element.style.setProperty('display', 'block');
            element.style.setProperty('width', '100%', 'important');
            element.style.setProperty('min-width', '0', 'important');
            element.style.setProperty('max-width', 'none', 'important');
        });
    };

    const enhanceSelects = (root = document) => {
        if (root instanceof Element && root.matches(selector)) {
            enhance(root);
        }
        root.querySelectorAll?.(selector).forEach(enhance);
    };

    enhanceSelects();
    new MutationObserver((mutations) => mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.target instanceof Element) {
            enhanceSelects(mutation.target);
        }
        mutation.addedNodes.forEach((node) => {
            if (node instanceof Element) {
                enhanceSelects(node);
            }
        });
    })).observe(document.body, {
        attributes: true,
        attributeFilter: ['class', 'hidden', 'style'],
        childList: true,
        subtree: true,
    });
    expandEditor();
    const editorRegion = document.querySelector('#admin-summary');
    if (editorRegion) {
        new MutationObserver(expandEditor).observe(editorRegion, {childList: true, subtree: true});
    }
    document.addEventListener('click', (event) => controls.forEach((control) => {
        if (!control.contains(event.target) && !control.menu.contains(event.target)) {
            close(control);
        }
    }));
    window.addEventListener('resize', () => controls.forEach(positionMenu));
    window.addEventListener('scroll', (event) => {
        if (event.target instanceof Element && event.target.closest('.institution-form-select__menu')) {
            return;
        }
        controls.forEach(positionMenu);
    }, true);
})();
