// Karma configuration
// Generated on Sun Jan 24 2016 12:48:46 GMT-0800 (PST)
//

var singleRun = true;

module.exports = function(config) {
  config.set({

    basePath: '',

    frameworks: ['jspm', 'jasmine'],

    plugins: [
        'karma-jasmine', 'karma-jspm', 'karma-chrome-launcher',
        'karma-coverage'
    ],

    files: [],

    exclude: [],

    jspm: {
        loadFiles: [
            //'tests/unit/src/masker.spec.ts'
            'tests/unit/src/masked-input.spec.ts'
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
        '/typings': '/base/typings',
        '/tests': '/base/tests'
    },

    //preprocessors: {
        //'src/**/*.ts': ['coverage']
    //},


    reporters: ['progress', 'coverage'],

    coverageReporter: {
        type: 'html',
        dir: 'coverage',
        includeAllSources : true
    },

    port: 9876,

    colors: true,

    logLevel: config.LOG_INFO,

    autoWatch: !singleRun,

    browsers: ['Chrome'],

    singleRun: singleRun
  });
};
