const proxyquire = require('proxyquire');
const sinon = require('sinon');

const SystemInfoWatcher = require('../../app/system-info-watcher');
const SystemInfo = require('../../app/models/system-info');
const NetworkInfo = require('../../app/models/network-info');
const Interface = require('../../app/models/interface');
const ApplicationInfo = require('../../app/models/application-info');

const StatusPage = require('../page_objects/status-page');

module.exports = function() {
  this.Given(/^I am on the status page$/, function(callback) {
    this.page = new StatusPage.StatusPage(this.browser);

    var world = this;

    this.systemInfoWatcherStub = sinon.createStubInstance(SystemInfoWatcher);
    this.systemInfoWatcherStub.emit.restore();
    this.systemInfoWatcherStub.on.restore();

    var server = proxyquire('../../app', {
      './app/system-info-watcher': {
        create: () => this.systemInfoWatcherStub,
        '@global': true
      }
    });

    server.listen(30321, () => {
      world.browser.get('http://localhost:30321').then(() => callback());
    });
  });

  this.When(/^the system information changes$/, function() {
    this.newInfo = new SystemInfo(
      'bsn-4c7332b9',
      new NetworkInfo({
        lan: new Interface('lan', '192.168.1.100')
      }),
      new ApplicationInfo(ApplicationInfo.applicationState.running, '', '', '', ''),
      'updating'
    );
    this.systemInfoWatcherStub.emit(SystemInfoWatcher.events.change, this.newInfo);
  });

  this.Then(/^I should be able to see the system information$/, function(callback) {
    // callback.pending();
  });

  this.Then(/^I should be able to see updated system information$/, function() {
    return this.page.getHostname().should.eventually.equal(this.newInfo.hostname);
  });
};
