/*
 * grunt-fontgen
 * https://github.com/agentk/grunt-fontgen
 *
 * Copyright 2015 Karl Bowden
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at
 * http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
 */

'use strict';

module.exports = function(grunt) {

    var fs = require('fs');
    var path = require('path');
    var fontfacegen = require('fontfacegen');

    grunt.registerMultiTask('fontgen', 'Generate webfonts and css ready to use on your site', function() {

        // Merge task-specific and/or target-specific options with these defaults.
        var options = this.options({
            path_prefix: '',
            stylesheet: 'fonts.css'
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
                    css: options.stylesheet,
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
