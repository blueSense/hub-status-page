const NetworkInfo = require('../../app/models/network-info');
const Interface = require('../../app/models/interface');
const SystemInfoScanner = require('../../app/system-info-scanner');
const ApplicationInfo = require('../../app/models/application-info');
const HostnameCommand = require('../../app/commands/hostname-command');
const NetworkInfoCommand = require('../../app/commands/network-info-command');
const ApplicationInfoCommand = require('../../app/commands/application-info-command');
const UpdateInfoCommand = require('../../app/commands/update-info-command');

const sinon = require('sinon');
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const sinonChai = require('sinon-chai');
chai.should();
chai.use(chaiAsPromised);
chai.use(sinonChai);

describe('SystemInfo', function() {
  beforeEach(function() {
    this.sandbox = sinon.sandbox.create();
    this.sandbox.useFakeTimers();

    this.hostnameCommandMock = this.sandbox.mock(HostnameCommand.prototype);
    this.networkInfoCommandMock = this.sandbox.mock(NetworkInfoCommand.prototype);
    this.applicationInfoCommandMock = this.sandbox.mock(ApplicationInfoCommand.prototype);
    this.updateInfoCommandMock = this.sandbox.mock(UpdateInfoCommand.prototype);

    this.systemInfoScanner = new SystemInfoScanner(
      this.hostnameCommandMock.object,
      this.updateInfoCommandMock.object,
      this.applicationInfoCommandMock.object,
      this.networkInfoCommandMock.object
    );
  });

  afterEach(function() {
    this.sandbox.restore();
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
