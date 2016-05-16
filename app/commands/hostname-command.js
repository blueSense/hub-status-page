'use strict';

const ChildProcessAdapter = require('../child-process-adapter');

class HostnameCommand {
  constructor(childProcessAdapter) {
    this._childProcessAdapter = childProcessAdapter;
  }

  static get commands() {
    return {
      getHostname: () => 'hostname'
    };
  }

  execute() {
    return this._childProcessAdapter.exec(HostnameCommand.commands.getHostname()).then(hostname => hostname.trim());
  }
}

module.exports = HostnameCommand;

/* istanbul ignore next */
module.exports.create = function() {
  return new HostnameCommand(ChildProcessAdapter.create());
};
