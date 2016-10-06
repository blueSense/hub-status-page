require('../support/bootstrap');

const NetworkInfo = require('../../app/models/network-info');
const Interface = require('../../app/models/interface');
const ApplicationInfo = require('../../app/models/application-info');
const HostnameCommand = require('../../app/commands/hostname-command');
const NetworkInfoCommand = require('../../app/commands/network-info-command');
const ApplicationInfoCommand = require('../../app/commands/application-info-command');
const UpdateInfoCommand = require('../../app/commands/update-info-command');

describe('SystemInfo', function() {
  beforeEach(function() {
    this.sandbox.useFakeTimers();

    this.hostnameCommandMock = this.sandbox.mock(HostnameCommand.prototype);
    this.networkInfoCommandMock = this.sandbox.mock(NetworkInfoCommand.prototype);
    this.applicationInfoCommandMock = this.sandbox.mock(ApplicationInfoCommand.prototype);
    this.updateInfoCommandMock = this.sandbox.mock(UpdateInfoCommand.prototype);

    this.SystemInfoScanner = this.proxyquire('../../app/system-info-scanner', {
      './commands/hostname-command': {
        create: () => this.hostnameCommandMock.object
      },
      './commands/network-info-command': {
        create: () => this.networkInfoCommandMock.object
      },
      './commands/application-info-command': {
        create: () => this.applicationInfoCommandMock.object
      },
      './commands/update-info-command': {
        create: () => this.updateInfoCommandMock.object
      }
    });

    this.systemInfoScanner = new this.SystemInfoScanner();
  });

  describe('#execute()', function() {
    before(function() {
      this.hostname = 'bsn-4c3123871';
      this.networkInfo = new NetworkInfo({'lan': new Interface('lan', '192.168.1.100')});
      this.updateInfo = 'updating';
      this.applicationInfo = new ApplicationInfo(ApplicationInfo.applicationState.running, '', '', '', '1.0.2');
    });

    it('should run all the commands and compose the system info model', function() {
      this.hostnameCommandMock.expects('execute')
        .once()
        .returns(Promise.resolve(this.hostname));

      this.updateInfoCommandMock.expects('execute')
        .once()
        .returns(Promise.resolve(this.updateInfo));

      this.applicationInfoCommandMock.expects('execute')
        .once()
        .returns(Promise.resolve(this.applicationInfo));

      this.networkInfoCommandMock.expects('execute')
        .once()
        .returns(Promise.resolve(this.networkInfo));

      return this.systemInfoScanner.execute().should.be.fulfilled.then(systemInfo => {
        systemInfo.hostname.should.equal(this.hostname);
        systemInfo.updateStatus.should.equal(this.updateInfo);
        systemInfo.networkInfo.should.equal(this.networkInfo);
        systemInfo.appInfo.should.equal(this.applicationInfo);

        this.hostnameCommandMock.verify();
        this.updateInfoCommandMock.verify();
        this.applicationInfoCommandMock.verify();
        this.networkInfoCommandMock.verify();
      });
    });
  });
});
