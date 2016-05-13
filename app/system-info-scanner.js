'use strict';

const SystemInfo = require('./models/system-info');

class SystemInfoScanner {
  /**
   * @param {HostnameCommand} hostnameCommand
   * @param {UpdateInfoCommand} updateInfoCommand
   * @param {ApplicationInfoCommand} applicationInfoCommand
   * @param {NetworkInfoCommand} networkInfoCommand
   */
  constructor(hostnameCommand, updateInfoCommand, applicationInfoCommand, networkInfoCommand) {
    this._commands = [hostnameCommand, networkInfoCommand, applicationInfoCommand, updateInfoCommand];
  }

  /**
   * @returns {Promise<SystemInfo>}
   */
  execute() {
    return Promise.all(this._commands.map(command => command.execute()))
      .then(results => new SystemInfo(results[0], results[1], results[2], results[3]));
  }
}

module.exports = SystemInfoScanner;
