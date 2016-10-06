require('../../support/bootstrap');

const ChildProcessAdapter = require('../../../app/child-process-adapter');

describe('HostnameCommand', function() {
  before(function() {
    this.hostname = 'bsn-4c7332b9';
  });

  beforeEach(function() {
    this.childProcessAdapterMock = this.sandbox.mock(ChildProcessAdapter.prototype);

    this.HostnameCommand = this.proxyquire('../../app/commands/hostname-command', {
      '../child-process-adapter': {
        create: () => this.childProcessAdapterMock.object
      }
    });

    this.hostnameCommand = new this.HostnameCommand();
  });

  describe('#execute()', function() {
    it('should return a promise that resolves with a hostname', function() {
      this.childProcessAdapterMock.expects('exec')
        .once()
        .withArgs(this.HostnameCommand.commands.getHostname())
        .returns(Promise.resolve(`${this.hostname}\n`));

      return this.hostnameCommand.execute().should.be.fulfilled.then(output => {
        output.should.equal(this.hostname);
        this.childProcessAdapterMock.verify();
      });
    });
  });
});
