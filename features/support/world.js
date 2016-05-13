'use strict';

var SeleniumServer = require('selenium-webdriver/remote').SeleniumServer;
var webdriver = require('selenium-webdriver');

var server = new SeleniumServer(require('selenium-server').path, {port: 4444});

server.start();

var chai = require('chai');
chai.should();

// var chaiAsPromised = require('chai-as-promised');
// chai.use(chaiAsPromised);

var driver = new webdriver.Builder()
  .usingServer(server.address())
  .withCapabilities(webdriver.Capabilities.firefox())
  .build();

driver.manage().timeouts().setScriptTimeout(60 * 1000);

class World {
  constructor() {
    this.browser = driver;
  }
}

module.exports = function() {
  this.World = World;

  this.AfterFeatures(function() {
    driver.quit();
  });
};
