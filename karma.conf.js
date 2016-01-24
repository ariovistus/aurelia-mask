// Karma configuration
// Generated on Sun Jan 24 2016 12:48:46 GMT-0800 (PST)

module.exports = function(config) {
  config.set({

    basePath: '',

    frameworks: ['jspm', 'jasmine'],

    plugins: ['karma-jasmine', 'karma-jspm', 'karma-chrome-launcher'],

    files: [],

    exclude: [],

    jspm: {
        loadFiles: [
            'tests/testit.ts'
        ],
        serveFiles: [
            '**/*.ts',
            '**/*.json'
        ],
        defaultJSExtensions: true
    },

    proxies: {
        '/jspm_packages': '/base/jspm_packages',
        '/src': '/base/src',
        '/tests': '/base/tests'
    },

    preprocessors: {
    },


    reporters: ['progress'],

    port: 9876,

    colors: true,

    logLevel: config.LOG_INFO,

    autoWatch: true,

    browsers: ['Chrome'],

    singleRun: false
  });
};
