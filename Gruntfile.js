var path = require('path'),
    webpack = require("webpack");

module.exports = function(grunt) {
  var webpackConfig = require('./webpack.config.js');
  var packageConfig = require('./package.json');
  require("matchdep").filterAll("grunt-*").forEach(grunt.loadNpmTasks);

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    webpack: {
      options: webpackConfig,
      dev: {
        devtool: "eval",
        debug: true
      },
      prod: {}
    },
    "webpack-dev-server": {
      options: {
        webpack: webpackConfig,
        contentBase: path.join(__dirname, '/public'),
        publicPath: 'http://localhost:8080/built/'
      },
      start: {
        keepAlive: true,
        webpack: {
          devtool: "eval",
          debug: true
        }
      }
    },
    spawn: {
      dev: {
        command: 'find',
        commandArgs: [path.join(__dirname, '/node_modules/electron-prebuilt/dist'), '-name', 'Electron', '-exec', '{{}}', __dirname, '\\;'],
        directory: __dirname,
        groupFiles: true,
        passThrough: false,
        dontWait: true,
        opts: {
          stdio: 'inherit',
          stderr: 'inherit',
          env: {
            DEV: true
          }
        }
      }
    },
    clean: [
      path.join(__dirname, "/dist"),
      path.join(__dirname, "/public/built"),
      path.join(__dirname, "/public/data.json"),
      path.join(__dirname, "/public/data.*.json"),
      path.join(__dirname, "/public/data.json.*"),
      path.join(__dirname, "/public/data.leveldb"),
      path.join(__dirname, "/public/data.*.leveldb"),
      path.join(__dirname, "/public/data.leveldb.*"),
    ],
    electron: {
      mac: {
        options: {
          name: 'ReGrok',
          dir: __dirname,
          out: 'dist',
          version: packageConfig['__electron-version'],
          platform: 'darwin',
          arch: 'x64'
        }
      }
    }
  });

  grunt.registerTask('default', ['spawn:dev', 'webpack-dev-server:start']);
  grunt.registerTask('dev', ['spawn:dev', 'webpack-dev-server:start']);
  grunt.registerTask('prod', ['webpack:dev', 'spawn:dev']);
  grunt.registerTask('build', ['clean', 'webpack:prod', 'electron:mac']);
};
