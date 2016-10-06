require('../../support/bootstrap');

const ChildProcessAdapter = require('../../../app/child-process-adapter');
const NetworkInfoCommand = require('../../../app/commands/network-info-command');
const NetworkInfo = require('../../../app/models/network-info');
const Interface = require('../../../app/models/interface');
const fs = require('fs');

describe('NetworkInfoCommand', function() {
  beforeEach(function() {
    this.childProcessAdapterMock = this.sandbox.mock(ChildProcessAdapter.prototype);
    this.networkInfoCommand = new NetworkInfoCommand(this.childProcessAdapterMock.object);
  });

  describe('#execute()', function() {
    context('only lan running', function() {
      it('should indicate that the wifi is not connected', function() {
        var expectedNetworkInfo = new NetworkInfo({
          lan: new Interface('LAN', '192.168.1.100'),
          wifi: new Interface('WiFi', null)
        });

        this.childProcessAdapterMock.expects('exec')
          .once()
          .withArgs(NetworkInfoCommand.commands.getInterfaceInfo('eth0'))
          .returns(Promise.resolve(fs.readFileSync('test/unit/fixtures/ifconfig-lan-on', {encoding: 'utf8'})));

        this.childProcessAdapterMock.expects('exec')
          .once()
          .withArgs(NetworkInfoCommand.commands.getInterfaceInfo('wlan0'))
          .returns(Promise.resolve(fs.readFileSync('test/unit/fixtures/ifconfig-wifi-off', {encoding: 'utf8'})));

        return this.networkInfoCommand.execute().should.be.fulfilled.then(networkInfo => {
          networkInfo.should.deep.equal(expectedNetworkInfo);
          this.childProcessAdapterMock.verify();
        });
      });
    });

    context('no wifi interface', function () {
      it('should indicate that the wifi is not connected', function() {
        var expectedNetworkInfo = new NetworkInfo({
          lan: new Interface('LAN', '192.168.1.100'),
          wifi: new Interface('WiFi', null)
        });

        this.childProcessAdapterMock.expects('exec')
          .withArgs(NetworkInfoCommand.commands.getInterfaceInfo('eth0'))
          .returns(Promise.resolve(fs.readFileSync('test/unit/fixtures/ifconfig-lan-on', {encoding: 'utf8'})));

        this.childProcessAdapterMock.expects('exec')
          .withArgs(NetworkInfoCommand.commands.getInterfaceInfo('wlan0'))
          .returns(Promise.reject('Device "wlan0" does not exist.'));

        return this.networkInfoCommand.execute().should.be.fulfilled.then(networkInfo => {
          networkInfo.should.deep.equal(expectedNetworkInfo);
          this.childProcessAdapterMock.verify();
        });
      });
    });

    context('only wifi running', function() {
      it('should indicate that the lan interface is not connected', function() {
        var expectedNetworkInfo = new NetworkInfo({
          lan: new Interface('LAN', null),
          wifi: new Interface('WiFi', '192.168.1.51')
        });

        this.childProcessAdapterMock.expects('exec')
          .once()
          .withArgs(NetworkInfoCommand.commands.getInterfaceInfo('eth0'))
          .returns(Promise.resolve(fs.readFileSync('test/unit/fixtures/ifconfig-lan-off', {encoding: 'utf8'})));

        this.childProcessAdapterMock.expects('exec')
          .once()
          .withArgs(NetworkInfoCommand.commands.getInterfaceInfo('wlan0'))
          .returns(Promise.resolve(fs.readFileSync('test/unit/fixtures/ifconfig-wifi-on', {encoding: 'utf8'})));

        return this.networkInfoCommand.execute().should.be.fulfilled.then(networkInfo => {
          networkInfo.should.deep.equal(expectedNetworkInfo);
          this.childProcessAdapterMock.verify();
        });
      });
    });
  });
});
