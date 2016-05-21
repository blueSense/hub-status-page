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
        var expectedInfo = new ApplicationInfo(ApplicationInfo.applicationState.notInstalled, null, null, null);

        this.childProcessAdapterMock.expects('exec')
          .once()
          .withArgs(ApplicationInfoCommand.commands.getImageInfo())
          .returns(Promise.reject(fs.readFileSync('test/unit/fixtures/supernode-not-installed', {encoding: 'utf8'})));

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
            null,
            'Sat 2016-05-21 14:52:50 UTC',
            '1.0.3-4'
          );

          this.childProcessAdapterMock.expects('exec')
            .once()
            .withArgs(ApplicationInfoCommand.commands.getImageInfo())
            .returns(Promise.reject(fs.readFileSync('test/unit/fixtures/supernode-not-running', {encoding: 'utf8'})));

          this.childProcessAdapterMock.expects('exec')
            .once()
            .withArgs(ApplicationInfoCommand.commands.getVersion())
            .returns(Promise.resolve('bsn-supernode 1.0.3-4\n'));

          return this.applicationInfoCommand.execute().should.be.fulfilled.then(info => {
            info.should.deep.equal(expectedInfo);
            this.childProcessAdapterMock.verify();
          });
        });

        it('should handle the case where the application was never started by returning null for finishedAt', function() {
          var expectedInfo = new ApplicationInfo(
            ApplicationInfo.applicationState.stopped,
            null,
            null,
            '1.0.3-4'
          );

          this.childProcessAdapterMock.expects('exec')
            .once()
            .withArgs(ApplicationInfoCommand.commands.getImageInfo())
            .returns(Promise.reject(fs.readFileSync('test/unit/fixtures/supernode-not-running-never-ran', {encoding: 'utf8'})));

          this.childProcessAdapterMock.expects('exec')
            .once()
            .withArgs(ApplicationInfoCommand.commands.getVersion())
            .returns(Promise.resolve('bsn-supernode 1.0.3-4\n'));

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
            'Sat 2016-05-21 13:10:22 UTC',
            null,
            '1.0.3-4'
          );

          this.childProcessAdapterMock.expects('exec')
            .once()
            .withArgs(ApplicationInfoCommand.commands.getImageInfo())
            .returns(Promise.resolve(fs.readFileSync('test/unit/fixtures/supernode-running', {encoding: 'utf8'})));

          this.childProcessAdapterMock.expects('exec')
            .once()
            .withArgs(ApplicationInfoCommand.commands.getVersion())
            .returns(Promise.resolve('bsn-supernode 1.0.3-4\n'));

          return this.applicationInfoCommand.execute().should.be.fulfilled.then(info => {
            info.should.deep.equal(expectedInfo);
            this.childProcessAdapterMock.verify();
          });
        });
      });
    });

    context('command throws an error other than expected one', function() {
      it('should propagate that error', function() {
        var error = 'Some random error';

        this.childProcessAdapterMock.expects('exec')
          .once()
          .withArgs(ApplicationInfoCommand.commands.getImageInfo())
          .returns(Promise.reject(error));

        return this.applicationInfoCommand.execute().should.be.rejected.then(thrownError => {
          thrownError.should.deep.equal(new Error(error));
          this.childProcessAdapterMock.verify();
        });
      });
    });
  });
});
