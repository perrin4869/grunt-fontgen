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
    var fontfacegen = require('fontfacegen');

    grunt.registerMultiTask('fontgen', 'Generate webfonts and css ready to use on your site', function() {

        // Merge task-specific and/or target-specific options with these defaults.
        var options = this.options({
            path_prefix: ''
        });

        // Iterate over all specified file groups.
        this.files.forEach(function(f) {

            createDestinationDirectory(f.dest);

            f.src.filter(function(filepath) {

                // Warn about, but ignore missing files
                if (!grunt.file.exists(filepath)) {
                    grunt.log.warn('Source file "' + filepath + '" not found.');
                    return false;
                }

                fontfacegen({
                    source: filepath,
                    dest: f.dest,
                    css_fontpath: options.path_prefix
                })

            });
        });
    });

    function createDestinationDirectory(dest) {
        if (!grunt.file.exists(dest)) {
            grunt.file.mkdir(dest);
        }
    }
};
