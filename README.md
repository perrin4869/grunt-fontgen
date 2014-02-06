# grunt-fontgen

> Generate webfonts and css ready to use on your site

## Getting Started
This plugin requires Grunt `~0.4.2`

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

```shell
npm install grunt-fontgen --save-dev
```

Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-fontgen');
```

## The "fontgen" task

### Overview
In your project's Gruntfile, add a section named `fontgen` to the data object passed into `grunt.initConfig()`.

```js
grunt.initConfig({
  fontgen: {
    options: {
      // Task-specific options go here.
    },
    all: {
      options: {
        path_prefix: '../fonts/',
        stylesheet: '<%= dest_css %>/fonts.css',
      },
      files: [{
        src: [
          '<%= src %>/<%= font_dir %>/*.otf'
          '<%= src %>/<%= font_dir %>/*.ttf',
        ],
        dest: '<%= dest %>/<%= font_dir %>'
      }]
    }
  },
});
```

### Options

#### options.path_prefix
Type: `String`
Default value: `''`

The path to the font files relative to the css file generated.

#### options.stylesheet
Type: `String`
Default value: `'fonts.css'`

Path and name of the css file to generate with the fonts available.

### Usage Examples

#### Default Options
Only OTF and TTF source fonts are supported by default.

Fonts may also have a json file associated with custom settings for the stylesheet output.

```js
{
  "name": "MyItalicFontName",
  "weight": "900",
  "style": "Italic"
}
```
## Installation
```sh
brew install batik fontforge ttfautohint ttf2eot
npm install grunt-fontgen --save-dev
```

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).

## Release History
_(Nothing yet)_
