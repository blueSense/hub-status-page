'use strict';

const ChildProcessAdapter = require('../child-process-adapter');
const config = require('config');

class UpdateInfoCommand {
  constructor() {
    this._childProcessAdapter = ChildProcessAdapter.create();
  }

  static create() {
    return new UpdateInfoCommand();
  }

  // TODO: need to reflect switch to puppet
  static get updateLogPath() {
    return '/var/log/node-hub/daemon.log';
  }

  static get commands() {
    return {
      getUpdateProcess: () => `ps aux | grep pacman -S --needed --noconfirm ${config.get('application.packageName')} | grep -v grep || true`,
      getLastUpdateTime: () => `tac ${UpdateInfoCommand.updateLogPath} | grep -m1 'Syncing package: bsn-supernode' | sed -E "s/(.*)Syncing.*/\\1/"`
    };
  }

  execute() {
    const tasks = [
      this._childProcessAdapter.exec(UpdateInfoCommand.commands.getUpdateProcess()),
      this._childProcessAdapter.exec(UpdateInfoCommand.commands.getLastUpdateTime())
    ];

    return Promise.all(tasks)
      .then(results => results[0] === '' ? results[1].trim() : 'updating');
  }
}

module.exports = UpdateInfoCommand;
