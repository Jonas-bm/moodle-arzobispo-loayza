<?php

defined('MOODLE_INTERNAL') || die();

function theme_institution_get_main_scss_content($theme) {
    global $CFG;

    $scss = '';

    $pre = $CFG->dirroot . '/theme/institution/scss/pre.scss';
    if (is_readable($pre)) {
        $scss .= file_get_contents($pre);
    }

    $boost = $CFG->dirroot . '/theme/boost/scss/preset/default.scss';
    if (is_readable($boost)) {
        $scss .= file_get_contents($boost);
    }

    $post = $CFG->dirroot . '/theme/institution/scss/post.scss';
    if (is_readable($post)) {
        $scss .= file_get_contents($post);
    }

    return $scss;
}

/** Register accessible carousel control labels before the footer script runs. */
function theme_institution_page_init(moodle_page $page) {
    $page->requires->strings_for_js(
        ['herocarousel', 'heroimage', 'heronoticecategory', 'heronoticetitle',
            'heronoticedescription', 'heronoticelink'],
        'theme_institution'
    );
}
