'use strict';

const SystemInfo = require('./models/system-info');

const HostnameCommand = require('./commands/hostname-command');
const UpdateInfoCommand = require('./commands/update-info-command');
const ApplicationInfoCommand = require('./commands/application-info-command');
const NetworkInfoCommand = require('./commands/network-info-command');

class SystemInfoScanner {
  constructor(commands) {
    this._commands = commands;
  }

  /**
   * @returns {Promise<SystemInfo>}
   */
  execute() {
    return Promise.all([
      this._commands.hostnameCommand.execute(),
      this._commands.networkInfoCommand.execute(),
      this._commands.applicationInfoCommand.execute(),
      this._commands.updateInfoCommand.execute()
    ]).then(results => new SystemInfo(results[0], results[1], results[2], results[3]));
  }
}

module.exports = SystemInfoScanner;

/* istanbul ignore next */
module.exports.create = function() {
  return new SystemInfoScanner({
    hostnameCommand: HostnameCommand.create(),
    updateInfoCommand: UpdateInfoCommand.create(),
    applicationInfoCommand: ApplicationInfoCommand.create(),
    networkInfoCommand: NetworkInfoCommand.create()
  });
};
