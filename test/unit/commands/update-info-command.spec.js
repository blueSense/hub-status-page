require('../../support/bootstrap');

const ChildProcessAdapter = require('../../../app/child-process-adapter');
const UpdateInfoCommand = require('../../../app/commands/update-info-command');

describe('UpdateInfoCommand', function() {
  before(function() {
    this.hostname = 'bsn-4c7332b9';
  });

  beforeEach(function() {
    this.childProcessAdapterMock = this.sandbox.mock(ChildProcessAdapter.prototype);
    this.updateInfoCommand = new UpdateInfoCommand(this.childProcessAdapterMock.object);
  });

  describe('#execute()', function() {
    before(function() {
      this.lastUpdateTime = '2016-04-30 09:12:19,383';
    });

    beforeEach(function() {
      this.childProcessAdapterMock.expects('exec')
        .once()
        .withArgs(UpdateInfoCommand.commands.getLastUpdateTime())
        .returns(Promise.resolve(`${this.lastUpdateTime}\n`));
    });

    context('update running', function() {
      it('should set the update status to "updating"', function() {
        this.childProcessAdapterMock.expects('exec')
          .once()
          .withArgs(UpdateInfoCommand.commands.getUpdateProcess())
          .returns(Promise.resolve('bsn      21057 36.0  0.9  11416  8560 pts/0    T    23:39   0:00 /usr/bin/pacman -S --needed --noconfirm bsn-supernode'));

        return this.updateInfoCommand.execute().should.be.fulfilled.then(updateStatus => {
          updateStatus.should.equal('updating');
          this.childProcessAdapterMock.verify();
        });
      });
    });

    context('no update running', function() {
      it('should set the update status to the date of the last update as seen in the log files', function() {
        this.childProcessAdapterMock.expects('exec')
          .once()
          .withArgs(UpdateInfoCommand.commands.getUpdateProcess())
          .returns(Promise.resolve(''));

        return this.updateInfoCommand.execute().should.be.fulfilled.then(updateStatus => {
          updateStatus.should.equal(this.lastUpdateTime);
          this.childProcessAdapterMock.verify();
        });
      });
    });
  });
});
