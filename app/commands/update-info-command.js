'use strict';

const ChildProcessAdapter = require('../child-process-adapter');

class UpdateInfoCommand {
  constructor() {
    this._childProcessAdapter = ChildProcessAdapter.create();
  }

  static create() {
    return new UpdateInfoCommand();
  }

  static get updateLogPath() {
    return '/var/log/node-hub/daemon.log';
  }

  static get commands() {
    return {
      getUpdateProcess: () => 'ps aux | grep pacman -S --needed --noconfirm bsn-supernode | grep -v grep || true',
      getLastUpdateTime: () => `tac ${UpdateInfoCommand.updateLogPath} | grep -m1 'Syncing package: bsn-supernode' | sed -E "s/(.*)Syncing.*/\\1/"`
    };
  }

  execute() {
    return Promise.all([
      this._childProcessAdapter.exec(UpdateInfoCommand.commands.getUpdateProcess()),
      this._childProcessAdapter.exec(UpdateInfoCommand.commands.getLastUpdateTime())
    ]).then(results => results[0] === '' ? results[1].trim() : 'updating');
  }
}

module.exports = UpdateInfoCommand;
