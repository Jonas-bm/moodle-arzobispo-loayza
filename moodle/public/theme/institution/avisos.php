<?php
// This file is part of Moodle - http://moodle.org/
// Moodle is distributed under the GNU General Public License v3 or later.

/**
 * Announcement forums visible to the current user, without activity overview permissions.
 *
 * @package theme_institution
 * @copyright 2026
 * @license http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
require_once(__DIR__ . '/../../config.php');
require_login();

$PAGE->set_url(new moodle_url('/theme/institution/avisos.php'));
$PAGE->set_context(context_system::instance());
$PAGE->set_pagelayout('standard');
$PAGE->add_body_class('institution-announcements');
$PAGE->set_title(get_string('heronoticetitle', 'theme_institution'));
$PAGE->set_heading(get_string('heronoticetitle', 'theme_institution'));

$courses = enrol_get_my_courses('id, fullname', 'fullname ASC');
$courses[SITEID] = get_site();
$items = [];
foreach ($courses as $course) {
    $modinfo = get_fast_modinfo($course->id);
    foreach ($modinfo->get_instances_of('forum') as $cm) {
        if (!$cm->uservisible ||
                !has_capability('mod/forum:viewdiscussion', $cm->context)) {
            continue;
        }
        $forum = $DB->get_record('forum', ['id' => $cm->instance], 'id, type');
        if (!$forum || $forum->type !== 'news') {
            continue;
        }
        $items[] = html_writer::link(
            new moodle_url('/mod/forum/view.php', ['id' => $cm->id]),
            format_string($course->fullname) . ' — ' . format_string($cm->name),
            ['class' => 'list-group-item list-group-item-action py-3']
        );
    }
}

echo $OUTPUT->header();
echo $OUTPUT->heading(get_string('heronoticetitle', 'theme_institution'));
echo html_writer::tag('p', get_string('announcementsintro', 'theme_institution'));
if ($items) {
    echo html_writer::div(implode('', $items), 'list-group mb-4');
} else {
    echo $OUTPUT->notification(get_string('noannouncements', 'theme_institution'), 'info', false);
}
echo html_writer::link(
    new moodle_url('/', ['redirect' => 0]),
    get_string('backtofrontpage', 'theme_institution'),
    ['class' => 'btn btn-secondary mt-3']
);
echo $OUTPUT->footer();
