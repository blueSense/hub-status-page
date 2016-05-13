'use strict';

const Command = require('./command');

class HostnameCommand extends Command {
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
