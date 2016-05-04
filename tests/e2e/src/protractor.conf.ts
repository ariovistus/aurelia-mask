export var config = {
  sauceUser: process.env.SAUCE_USERNAME,
  sauceKey: process.env.SAUCE_ACCESS_KEY,

  // Capabilities to be passed to the webdriver instance.
  capabilities: {
      'browserName': 'chrome',
      'build': process.env.TRAVIS_BUILD_NUMBER,
      'tunnel-identifier': process.env.TRAVIS_JOB_NUMBER,
      'public': 'public'
  },
  allScriptsTimeout: 20000,

  //seleniumAddress: 'http://0.0.0.0:4444',
  specs: ['*.spec.js'],

  plugins: [{
    path: 'aurelia.protractor.js'
  }],


  // Options to be passed to Jasmine-node.
  jasmineNodeOpts: {
    showColors: true,
    defaultTimeoutInterval: 30000
  }
};
