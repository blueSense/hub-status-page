require('../../support/bootstrap');

const ChildProcessAdapter = require('../../../app/child-process-adapter');
const ApplicationInfo = require('../../../app/models/application-info');
const fs = require('fs');

describe('ApplicationInfoCommand', function () {
  before(function() {
    this.config = {
      serviceName: 'test',
      packageName: 'test',
    };

    this.commands = {
      service: `systemctl status ${this.config.serviceName}`,
      package: `pacman -Q ${this.config.packageName}`,
    };
  });

  beforeEach(function () {
    this.childProcessAdapterMock = this.sandbox.mock(ChildProcessAdapter.prototype);

    this.configStub = this.sandbox.stub({
      get: () => {
      }
    });

    this.configStub
      .get
      .withArgs('application.serviceName')
      .returns(this.config.serviceName);

    this.configStub
      .get
      .withArgs('application.packageName')
      .returns(this.config.packageName);

    this.ApplicationInfoCommand = this.proxyquire('../../app/commands/application-info-command', {
      '../child-process-adapter': {
        create: () => this.childProcessAdapterMock.object
      },
      'config': this.configStub
    });

    this.applicationInfoCommand = new this.ApplicationInfoCommand();
  });

  describe('#execute()', function () {
    context('application not installed', function () {
      it('should return the info indicating that the application was not installed', function () {
        var expectedInfo = new ApplicationInfo(ApplicationInfo.applicationState.notInstalled, null, null, null);

        this.childProcessAdapterMock.expects('exec')
          .withArgs(this.commands.service)
          .returns(Promise.reject(new Error(fs.readFileSync('test/unit/fixtures/supernode-not-installed', {encoding: 'utf8'}))));

        return this.applicationInfoCommand.execute().should.be.fulfilled.then(info => {
          info.should.deep.equal(expectedInfo);
          this.childProcessAdapterMock.verify();
        });
      });
    });

    context('application installed', function () {
      context('application stopped', function () {
        it('should return the image info', function () {
          var expectedInfo = new ApplicationInfo(
            ApplicationInfo.applicationState.stopped,
            null,
            'Sat 2016-05-21 14:52:50 UTC',
            '1.0.3-4'
          );

          this.childProcessAdapterMock.expects('exec')
            .withArgs(this.commands.service)
            .returns(Promise.reject(new Error(fs.readFileSync('test/unit/fixtures/supernode-not-running', {encoding: 'utf8'}))));

          this.childProcessAdapterMock.expects('exec')
            .withArgs(this.commands.package)
            .returns(Promise.resolve(`${this.config.packageName} 1.0.3-4\n`));

          return this.applicationInfoCommand.execute().should.be.fulfilled.then(info => {
            info.should.deep.equal(expectedInfo);
            this.childProcessAdapterMock.verify();
          });
        });

        it('should handle the case where the application was never started by returning null for finishedAt', function () {
          var expectedInfo = new ApplicationInfo(
            ApplicationInfo.applicationState.stopped,
            null,
            null,
            '1.0.3-4'
          );

          this.childProcessAdapterMock.expects('exec')
            .withArgs(this.commands.service)
            .returns(Promise.reject(new Error(fs.readFileSync('test/unit/fixtures/supernode-not-running-never-ran', {encoding: 'utf8'}))));

          this.childProcessAdapterMock.expects('exec')
            .withArgs(this.commands.package)
            .returns(Promise.resolve(`${this.config.packageName} 1.0.3-4\n`));

          return this.applicationInfoCommand.execute().should.be.fulfilled.then(info => {
            info.should.deep.equal(expectedInfo);
            this.childProcessAdapterMock.verify();
          });
        });
      });

      context('application running', function () {
        it('should return the image info', function () {
          var expectedInfo = new ApplicationInfo(
            ApplicationInfo.applicationState.running,
            'Sat 2016-05-21 13:10:22 UTC',
            null,
            '1.0.3-4'
          );

          this.childProcessAdapterMock.expects('exec')
            .withArgs(this.commands.service)
            .returns(Promise.resolve(fs.readFileSync('test/unit/fixtures/supernode-running', {encoding: 'utf8'})));

          this.childProcessAdapterMock.expects('exec')
            .once()
            .withArgs(this.commands.package)
            .returns(Promise.resolve(`${this.config.packageName} 1.0.3-4\n`));

          return this.applicationInfoCommand.execute().should.be.fulfilled.then(info => {
            info.should.deep.equal(expectedInfo);
            this.childProcessAdapterMock.verify();
          });
        });
      });
    });

    context('command throws an error other than expected one', function () {
      it('should propagate that error', function () {
        var error = new Error('Some random error');

        this.childProcessAdapterMock.expects('exec')
          .withArgs(this.commands.service)
          .returns(Promise.reject(error));

        return this.applicationInfoCommand.execute().should.be.rejected.then(thrownError => {
          thrownError.should.deep.equal(error);
          this.childProcessAdapterMock.verify();
        });
      });
    });
  });
});
