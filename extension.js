/* extension.js
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 2 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
 */
import { Extension } from "resource:///org/gnome/shell/extensions/extension.js";
import GLib from "gi://GLib";
import Gio from "gi://Gio";

export default class AccentColorIconThemeExtension extends Extension {
  constructor(metadata) {
    super(metadata);
    this._settings = null;
    this._accentColorChangedId = 0;
  }

  enable() {
    // Get the interface settings
    this._settings = new Gio.Settings({
      schema: "org.gnome.desktop.interface",
    });

    // Check and install missing icon themes
    this._installMissingIconThemes();

    // Connect to accent color changes
    this._accentColorChangedId = this._settings.connect(
      "changed::accent-color",
      this._onAccentColorChanged.bind(this),
    );

    // Initial theme update
    this._onAccentColorChanged();
  }

  disable() {
    // Disconnect the signal handler
    if (this._settings && this._accentColorChangedId) {
      this._settings.disconnect(this._accentColorChangedId);
      this._accentColorChangedId = 0;
    }

    // Optionally reset to default icon theme
    this._setIconTheme("Adwaita");
  }

  _installMissingIconThemes() {
    const iconThemes = [
      "MoreWaita-Blue",
      "MoreWaita-Green",
      "MoreWaita-Orange",
      "MoreWaita-Pink",
      "MoreWaita-Purple",
      "MoreWaita-Red",
      "MoreWaita-Slate",
      "MoreWaita-Teal",
      "MoreWaita-Yellow",
    ];

    const localIconsDir = GLib.get_home_dir() + "/.local/share/icons/";
    const extensionAssetsDir = this.path + "/assets/";

    // Create the local icons directory if it doesn't exist
    if (!GLib.file_test(localIconsDir, GLib.FileTest.EXISTS)) {
      GLib.mkdir(localIconsDir, 0o755);
    }

    iconThemes.forEach((theme) => {
      const themeDir = localIconsDir + theme;
      if (!GLib.file_test(themeDir, GLib.FileTest.EXISTS)) {
        // Copy the theme from assets to local icons directory
        const sourceDir = extensionAssetsDir + theme;
        this._copyDirectory(sourceDir, themeDir);
      }
    });
  }

  _copyDirectory(sourceDir, destDir) {
    const sourceFile = Gio.File.new_for_path(sourceDir);
    const destFile = Gio.File.new_for_path(destDir);

    // Create the destination directory
    destFile.make_directory_with_parents(null);

    // Enumerate the contents of the source directory
    const enumerator = sourceFile.enumerate_children("standard::*", 0, null);
    let info;
    while ((info = enumerator.next_file(null)) !== null) {
      const sourcePath = sourceDir + "/" + info.get_name();
      const destPath = destDir + "/" + info.get_name();
      const sourceGioFile = Gio.File.new_for_path(sourcePath);
      const destGioFile = Gio.File.new_for_path(destPath);

      if (info.get_file_type() === Gio.FileType.DIRECTORY) {
        // Recursively copy the directory
        this._copyDirectory(sourcePath, destPath);
      } else {
        // Copy the file
        sourceGioFile.copy(destGioFile, Gio.FileCopyFlags.NONE, null, null);
      }
    }
  }

  _onAccentColorChanged() {
    // Get the current accent color
    const accentColor = this._settings.get_string("accent-color");

    // Map accent colors to icon themes
    const iconThemeMap = {
      blue: "MoreWaita-Blue",
      teal: "MoreWaita-Teal",
      green: "MoreWaita-Green",
      yellow: "MoreWaita-Yellow",
      orange: "MoreWaita-Orange",
      red: "MoreWaita-Red",
      pink: "MoreWaita-Pink",
      purple: "MoreWaita-Purple",
      slate: "MoreWaita-Slate",
    };

    // Get the corresponding icon theme or default to base theme
    const iconTheme = iconThemeMap[accentColor] || "Adwaita";

    // Set the icon theme
    this._setIconTheme(iconTheme);
  }

  _setIconTheme(themeName) {
    // Set the icon theme
    this._settings.set_string("icon-theme", themeName);
  }
}
