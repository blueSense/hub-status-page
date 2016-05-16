'use strict';

var SeleniumServer = require('selenium-webdriver/remote').SeleniumServer;
var webdriver = require('selenium-webdriver');

var server = new SeleniumServer(require('selenium-server').path, {port: 4444});

server.start();

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
chai.should();

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
  this.setDefaultTimeout(60 * 1000);
  this.World = World;

  this.AfterFeatures(function() {
    driver.quit();
  });
};
