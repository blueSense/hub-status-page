const ChildProcessAdapter = require('../../../app/child-process-adapter');
const ApplicationInfoCommand = require('../../../app/commands/application-info-command');
const ApplicationInfo = require('../../../app/models/application-info');
const fs = require('fs');

const sinon = require('sinon');
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const sinonChai = require('sinon-chai');
chai.should();
chai.use(chaiAsPromised);
chai.use(sinonChai);

describe('ApplicationInfoCommand', function() {
  beforeEach(function() {
    this.sandbox = sinon.sandbox.create();
    this.childProcessAdapterMock = this.sandbox.mock(ChildProcessAdapter.prototype);
    this.applicationInfoCommand = new ApplicationInfoCommand(this.childProcessAdapterMock.object);
  });

  afterEach(function() {
    this.sandbox.restore();
  });

  describe('#execute()', function() {
    context('application not installed', function() {
      it('should return the info indicating that the application was not installed', function() {
        var expectedInfo = new ApplicationInfo(ApplicationInfo.applicationState.notInstalled, null, null, null, null);

        this.childProcessAdapterMock.expects('exec')
          .once()
          .withArgs(ApplicationInfoCommand.commands.getImageInfo())
          .returns(Promise.reject(new Error('Command failed: sudo docker inspect bsn-node-hub\nError: No such image or container: bsn-node-hub')));

        return this.applicationInfoCommand.execute().should.be.fulfilled.then(info => {
          info.should.deep.equal(expectedInfo);
          this.childProcessAdapterMock.verify();
        });
      });
    });

    context('application installed', function() {
      context('application stopped', function() {
        it('should return the image info', function() {
          var expectedInfo = new ApplicationInfo(
            ApplicationInfo.applicationState.stopped,
            '2016-04-30T09:01:42.72437809Z',
            '2016-04-30T09:12:29.104029935Z',
            'bluesense/supernode:latest',
            '1.0.2'
          );

          this.childProcessAdapterMock.expects('exec')
            .once()
            .withArgs(ApplicationInfoCommand.commands.getImageInfo())
            .returns(Promise.resolve(fs.readFileSync('test/unit/fixtures/docker-inspect-stopped', {encoding: 'utf8'})));

          return this.applicationInfoCommand.execute().should.be.fulfilled.then(info => {
            info.should.deep.equal(expectedInfo);
            this.childProcessAdapterMock.verify();
          });
        });
      });

      context('application running', function() {
        it('should return the image info', function() {
          var expectedInfo = new ApplicationInfo(
            ApplicationInfo.applicationState.running,
            '2016-04-30T09:01:42.72437809Z',
            '2016-04-30T09:12:29.104029935Z',
            'bluesense/supernode:latest',
            '1.0.2'
          );

          this.childProcessAdapterMock.expects('exec')
            .once()
            .withArgs(ApplicationInfoCommand.commands.getImageInfo())
            .returns(Promise.resolve(fs.readFileSync('test/unit/fixtures/docker-inspect-running', {encoding: 'utf8'})));

          return this.applicationInfoCommand.execute().should.be.fulfilled.then(info => {
            info.should.deep.equal(expectedInfo);
            this.childProcessAdapterMock.verify();
          });
        });
      });
    });

    context('command throws an error other than expected one', function() {
      it('should propagate that error', function() {
        var error = new Error('Some random error');

        this.childProcessAdapterMock.expects('exec')
          .once()
          .withArgs(ApplicationInfoCommand.commands.getImageInfo())
          .returns(Promise.reject(error));

        return this.applicationInfoCommand.execute().should.be.rejected.then(error => {
          error.should.equal(error);
          this.childProcessAdapterMock.verify();
        });
      });
    });
  });
});
