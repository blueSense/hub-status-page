'use strict';

const ChildProcessAdapter = require('../child-process-adapter');

class HostnameCommand {
  constructor() {
    this._childProcessAdapter = ChildProcessAdapter.create();
  }

  static create() {
    return new HostnameCommand();
  }

  static get commands() {
    return {
      getHostname: () => 'hostname'
    };
  }

  execute() {
    return this._childProcessAdapter.exec(HostnameCommand.commands.getHostname())
      .then(hostname => hostname.trim());
  }
}

module.exports = HostnameCommand;
