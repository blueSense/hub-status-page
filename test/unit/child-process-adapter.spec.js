const ChildProcessAdapter = require('../../app/child-process-adapter');

const childProcess = require('child_process');

const sinon = require('sinon');
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const sinonChai = require('sinon-chai');
chai.should();
chai.use(chaiAsPromised);
chai.use(sinonChai);

describe('ChildProcessAdapter', function() {
  beforeEach(function() {
    this.sandbox = sinon.sandbox.create();

    this.childProcessMock = this.sandbox.mock(childProcess);

    this.childProcessAdapter = new ChildProcessAdapter(this.childProcessMock.object);
  });

  afterEach(function() {
    this.sandbox.restore();
  });

  describe('#exec(command, options)', function() {
    before(function() {
      this.command = 'ls';
      this.options = {cwd: '/home'};
    });

    it('should return a promise which resolves when the callback is fired with stdout', function() {
      var output = '.git something something-else';

      this.childProcessMock.expects('exec')
        .once()
        .withArgs(this.command, this.options)
        .yields(undefined, output);

      return this.childProcessAdapter.exec(this.command, this.options).should.eventually.be.fulfilled.then(stdout => {
        stdout.should.equal(output);
        this.childProcessMock.verify();
      });
    });

    it('should return a promise which is rejected when the callback is fired with an error', function() {
      var error = 'The directory does not exist';

      this.childProcessMock.expects('exec')
        .once()
        .withArgs(this.command, this.options)
        .yields(error, undefined);

      return this.childProcessAdapter.exec(this.command, this.options).should.eventually.be.rejected.then(stderr => {
        stderr.should.equal(error);
        this.childProcessMock.verify();
      });
    });
  });
});
