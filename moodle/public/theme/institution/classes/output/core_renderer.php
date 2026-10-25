<?php
// This file is part of Moodle - http://moodle.org/
// Moodle is distributed under the GNU General Public License v3 or later.

namespace theme_institution\output;

defined('MOODLE_INTERNAL') || die();

/**
 * Supply the institutional logo when no site logo has been configured.
 *
 * @package theme_institution
 * @copyright 2026
 * @license http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
class core_renderer extends \theme_boost\output\core_renderer {
    /**
     * Return the configured main logo, or the logo shipped with the theme.
     *
     * @param int|null $maxwidth Maximum image width.
     * @param int|null $maxheight Maximum image height.
     * @return \moodle_url
     */
    public function get_logo_url($maxwidth = null, $maxheight = 200) {
        return parent::get_logo_url($maxwidth, $maxheight)
            ?: $this->image_url('logo-institucion', 'theme_institution');
    }

    /**
     * Prefer the configured compact logo, then the main logo, then the default.
     *
     * @param int|null $maxwidth Maximum image width.
     * @param int|null $maxheight Maximum image height.
     * @return \moodle_url
     */
    public function get_compact_logo_url($maxwidth = 300, $maxheight = 300) {
        return parent::get_compact_logo_url($maxwidth, $maxheight)
            ?: $this->get_logo_url($maxwidth, $maxheight);
    }
}
