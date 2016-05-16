'use strict';

const By = require('selenium-webdriver').By;

class StatusPage {
  constructor(browser) {
    this._browser = browser;
  }

  static get locators() {
    return {
      hostname: By.id('hostname')
    };
  }

  getHostname() {
    return this._browser.findElement(StatusPage.locators.hostname).getText();
  }
}

module.exports.StatusPage = StatusPage;
