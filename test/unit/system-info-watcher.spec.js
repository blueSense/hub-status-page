const SystemInfo = require('../../app/models/system-info');
const NetworkInfo = require('../../app/models/network-info');
const Interface = require('../../app/models/interface');
const SystemInfoScanner = require('../../app/system-info-scanner');
const SystemInfoWatcher = require('../../app/system-info-watcher');

const sinon = require('sinon');
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const sinonChai = require('sinon-chai');
chai.should();
chai.use(chaiAsPromised);
chai.use(sinonChai);

describe('SystemInfoWatcher', function() {
  beforeEach(function() {
    this.sandbox = sinon.sandbox.create();
    this.sandbox.useFakeTimers();

    this.systemInfoScannerMock = this.sandbox.mock(SystemInfoScanner.prototype);

    this.systemInfoWatcher = new SystemInfoWatcher(this.systemInfoScannerMock.object);
  });

  afterEach(function() {
    this.sandbox.restore();
  });

  describe('#startMonitoring()', function() {
    it('should write an error to stderr if the scanner returns an error', function(callback) {
      this.sandbox.stub(console, 'error');

      this.systemInfoScannerMock.expects('execute')
        .thrice()
        .returns(Promise.reject('error'));

      this.systemInfoWatcher.startMonitoring();
      this.sandbox.clock.tick(this.systemInfoWatcher.updateInterval * 2);
      this.sandbox.clock.restore();

      setTimeout(() => {
        console.error.should.have.been.calledThrice;
        this.systemInfoScannerMock.verify();

        callback();
      }, 0);
    });

    it('should emit an event whenever anything we are interested in changes', function(callback) {
      var spy = this.sandbox.spy();

      var initialState = new SystemInfo(
        'bsn-serial',
        new NetworkInfo([
          new Interface('LAN', '192.168.1.100'),
          new Interface('WiFi', '192.168.1.51')
        ]),
        'bluesense/supernode:1.0.0',
        'updating'
      );

      var stateAfterChange = new SystemInfo(
        'bsn-serial-changed',
        new NetworkInfo([
          new Interface('LAN', '192.168.1.100'),
          new Interface('WiFi', null)
        ]),
        'bluesense/supernode:1.0.0',
        'updating'
      );

      this.systemInfoScannerMock.expects('execute')
        .thrice()
        .onFirstCall()
        .returns(Promise.resolve(initialState))
        .onSecondCall()
        .returns(Promise.resolve(stateAfterChange))
        .onThirdCall()
        .returns(Promise.resolve(stateAfterChange));

      this.systemInfoWatcher.on(SystemInfoWatcher.events.change, spy);
      this.systemInfoWatcher.startMonitoring();
      this.sandbox.clock.tick(this.systemInfoWatcher.updateInterval * 2);
      this.sandbox.clock.restore();

      //assert after the promises had a chance to resolve
      setTimeout(() => {
        //once because the scan started and we emit
        spy.should.have.been.calledTwice;

        spy.firstCall.args[0].should.equal(initialState);
        spy.secondCall.args[0].should.equal(stateAfterChange);

        this.systemInfoScannerMock.verify();

        callback();
      }, 0);
    });
  });

  describe('#stopMonitoring()', function() {
    it('should not monitor for system changes', function() {
      this.systemInfoScannerMock.expects('execute')
        .thrice()
        .returns(Promise.resolve());

      this.systemInfoWatcher.startMonitoring();
      this.sandbox.clock.tick(this.systemInfoWatcher.updateInterval * 2);

      this.systemInfoWatcher.stopMonitoring();
      this.sandbox.clock.tick(this.systemInfoWatcher.updateInterval * 300);

      this.systemInfoScannerMock.verify();
    });
  });
});
