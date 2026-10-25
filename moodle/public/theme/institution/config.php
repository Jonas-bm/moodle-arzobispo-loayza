<?php

defined('MOODLE_INTERNAL') || die();

$THEME->name = 'institution';

$THEME->parents = ['boost'];

$THEME->sheets = [];
$THEME->editor_sheets = [];

$THEME->javascripts_footer = ['select_enhancer', 'form_selects', 'grades_overview', 'frontpage_hero'];

$THEME->scss = function($theme) {
    return theme_institution_get_main_scss_content($theme);
};

$THEME->rendererfactory = 'theme_overridden_renderer_factory';

$THEME->enable_dock = false;

$THEME->requiredblocks = '';

$THEME->addblockposition = BLOCK_ADDBLOCK_POSITION_FLATNAV;

$THEME->iconsystem = \core\output\icon_system::FONTAWESOME;

$THEME->haseditswitch = true;

$THEME->usescourseindex = true;

$THEME->activityheaderconfig = [
    'notitle' => true,
];
