/*
 * grunt-fontgen
 * https://github.com/agentk/grunt-fontgen
 *
 * Copyright (c) 2014 Karl Bowden
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {

    var fs = require('fs');
    var path = require('path');
    var sh = require('execSync');
    var setup = {paths:{}};

    var requiredCommands = ['fontforge', 'ttfautohint', 'ttf2eot', 'batik-ttf2svg'];

    var weight_table = {
        thin:           '100',
        extralight:     '200',
        light:          '300',
        medium:         'normal',
        normal:         'normal',
        demibold:       '600',
        semibold:       '700',
        bold:           '700',
        extrabold:      '800',
        black:          '900',
    };

    grunt.registerMultiTask('fontgen', 'Generate webfonts and css ready to use on your site', function() {

        setupEnv();

        // Merge task-specific and/or target-specific options with these defaults.
        var options = this.options({
            path_prefix: '',
            stylesheet: 'fonts.css',
        });

        var processed_fonts = {};

        // Iterate over all specified file groups.
        this.files.forEach(function(f) {

            createDestinationDirectory(f.dest);

            f.src.filter(function(filepath) {

                // Warn about, but ignore missing files
                if (!grunt.file.exists(filepath)) {
                    grunt.log.warn('Source file "' + filepath + '" not found.');
                    return false;
                }

                merge(processed_fonts, generateFontToDestination(filepath, f.dest));
            });
        });

        generateStylesheet(processed_fonts, options);
    });

    var setupEnv = function() {

        var missing = [];

        requiredCommands.forEach(function(cmd){
            setup.paths[cmd] = commandPath(cmd);
            if (!setup.paths[cmd]) { missing.push(cmd); }
        });

        if (missing.length != 0) {
            grunt.fail.fatal(
                'We are missing some required font packages.\n' +
                'That can be installed with:\n' +
                'brew install ' + missing.join(' '));
        }

        // Only needs to be done once
        setupEnv = function(){}
    }

    function merge(destination, source) {
        for (var property in source) {
            if (source.hasOwnProperty(property)) {
                destination[property] = source[property];
            }
        }
        return destination;
    }

    function commandPath(command) {
        var result = sh.exec('which ' + command);
        if (result.code == 0)
            return result.stdout.trim();
        return false;
    }

    function createDestinationDirectory(dest) {
        if (!grunt.file.exists(dest)) {
            grunt.file.mkdir(dest);
        }
    }

    function generateFontToDestination(source, dest) {
        var extension = path.extname(source);
        var basename = path.basename(source, extension);
        var target = path.join(dest, basename);
        var config_filename = source.replace(extension, '') + '.json';

        var fontconfig = {
            name: getFontName(source),
            weight: getFontWeight(source),
            style: getFontStyle(source),
        };
        if (fs.existsSync(config_filename)) {
            merge(fontconfig, grunt.file.readJSON(config_filename));
        }
        grunt.log.writeln('Generating font: ' + fontconfig.name + ': ' + source);

        var ttf = target + '.ttf';
        generateTtf(source, ttf, fontconfig);
        generateEot(ttf, target);
        generateSvg(ttf, target, fontconfig);
        generateWoff(ttf, target);

        var result = {};
        result[basename] = fontconfig;
        return result;
    }

    function generateTtf(source, dest, config) {
        var result = fontforge('Open($1);SetFontNames($3,$3,$3);Generate($2, "", 8);', source, dest, config.name);
    }

    function generateEot(source, dest) {
        // var result = fontforge('Open($1);Generate($2, "", 8);', source, dest + '_ff.eot');
        var command = setup.paths.ttf2eot + ' "' + source + '" > "' + dest + '.eot"';
        var result = sh.exec(command);
        if (result.code != 0) {
            grunt.log.error(
                'ttf2eot exited with error code: ' + result.code + '\n' +
                result.stdout.trim() + '\n' +
                'Your EOT file will probably not be in a working state');
        }
        return (result.code == 0);
    }

    function generateSvg(source, dest, config) {
        // var result = fontforge('Open($1);Generate($2, "", 8);', source, dest + '_ff.svg');
        var command = setup.paths['batik-ttf2svg'] + ' "' + source + '" -id "' + config.name + '" -o "' + dest + '.svg"';
        var result = sh.exec(command);
        if (result.code != 0) {
            grunt.log.error(
                'ttf2eot exited with error code: ' + result.code + '\n' +
                result.stdout.trim() + '\n' +
                'Your EOT file will probably not be in a working state');
        }
        return (result.code == 0);
    }

    function generateWoff(source, dest) {
        var result = fontforge('Open($1);Generate($2, "", 8);', source, dest + '.woff');
        return (result.code == 0);
    }

    function getFontName(source) {
        var result = fontforge('Open($1);Print($fontname);', source);
        if (result.code == 0) {
            return result.stdout.trim().replace(' ', '_');
        }
        return false;
    }

    function getFontWeight(source) {
        var result = fontforge('Open($1);Print($weight);', source);
        if (result.code == 0) {
            var weight = result.stdout.trim().replace(' ', '').toLowerCase();
            if (weight_table[weight])
                return weight_table[weight];
            return weight;
        }
        return false;
    }

    function getFontStyle(source) {
        var result = fontforge('Open($1);Print($italicangle);', source);
        if (result.code == 0) {
            return (result.stdout.trim() == 0) ? 'normal' : 'italic';
        }
        return false;
    }

    function fontforge() {
        var args = Array.prototype.slice.call(arguments);
        if (args.length < 1) return false;
        var script = args.shift();

        var command = setup.paths.fontforge +
            ' -lang=ff -c \'' + script + '\'';
        args.forEach(function(arg){
            command += ' \'' + arg + '\'';
        });

        var result = sh.exec(command + ' 2> /dev/null');
        if (result.code != 0) {
            grunt.log.error(
                'FontForge command failed\n' +
                'From command: ' + command + '\n' +
                'Code: ' + result.code + '\n' +
                result.stdout.trim());
        }
        return result;
    }

    function generateStylesheet(fonts, options) {
        var result = '';
        for (var filename in fonts) {
            if (fonts.hasOwnProperty(filename)) {
                var config = fonts[filename];

                result +=
                    "@font-face {\n" +
                    "    font-family: '" + config.name + "';\n" +
                    "    src: url('" + options.path_prefix + filename + ".eot');\n" +
                    "    src: url('" + options.path_prefix + filename + ".eot?#iefix') format('embedded-opentype'),\n" +
                    "         url('" + options.path_prefix + filename + ".woff') format('woff'),\n" +
                    "         url('" + options.path_prefix + filename + ".ttf') format('truetype'),\n" +
                    "         url('" + options.path_prefix + filename + ".svg#" + config.name + "') format('svg');\n" +
                    "    font-weight: " + config.weight + ";\n" +
                    "    font-style: " + config.style + ";\n" +
                    "}\n";
            }
        }

        if (result != '') {
            grunt.file.write(options.stylesheet, result);
        }
    }

};