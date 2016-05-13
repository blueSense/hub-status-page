const ChildProcessAdapter = require('../../../app/child-process-adapter');
const HostnameCommand = require('../../../app/commands/hostname-command');

const sinon = require('sinon');
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const sinonChai = require('sinon-chai');
chai.should();
chai.use(chaiAsPromised);
chai.use(sinonChai);

describe('HostnameCommand', function() {
  before(function() {
    this.hostname = 'bsn-4c7332b9';
  });

  beforeEach(function() {
    this.sandbox = sinon.sandbox.create();
    this.childProcessAdapterMock = this.sandbox.mock(ChildProcessAdapter.prototype);
    this.hostnameCommand = new HostnameCommand(this.childProcessAdapterMock.object);
  });

  afterEach(function() {
    this.sandbox.restore();
  });

  describe('#execute()', function() {
    it('should return a promise that resolves with a hostname', function() {
      this.childProcessAdapterMock.expects('exec')
        .once()
        .withArgs(HostnameCommand.commands.getHostname())
        .returns(Promise.resolve(`${this.hostname}\n`));

      return this.hostnameCommand.execute().should.eventually.be.fulfilled.then(output => {
        output.should.equal(this.hostname);
        this.childProcessAdapterMock.verify();
      });
    });
  });
});
