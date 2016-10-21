'use strict';

const SystemInfo = require('./models/system-info');

const HostnameCommand = require('./commands/hostname-command');
const UpdateInfoCommand = require('./commands/update-info-command');
const ApplicationInfoCommand = require('./commands/application-info-command');
const NetworkInfoCommand = require('./commands/network-info-command');

class SystemInfoScanner {
  constructor() {
    this._commands = {
      hostnameCommand: HostnameCommand.create(),
      updateInfoCommand: UpdateInfoCommand.create(),
      applicationInfoCommand: ApplicationInfoCommand.create(),
      networkInfoCommand: NetworkInfoCommand.create()
    };
  }

  static create() {
    return new SystemInfoScanner();
  }

  /**
   * @returns {Promise<SystemInfo>}
   */
  execute() {
    const tasks = [
      this._commands.hostnameCommand.execute(),
      this._commands.networkInfoCommand.execute(),
      this._commands.applicationInfoCommand.execute(),
      this._commands.updateInfoCommand.execute()
    ];

    return Promise.all(tasks)
      .then(results => new SystemInfo(results[0], results[1], results[2], results[3]))
      .catch(error => console.error(`An error occurred while scanning the system: ${error}`));
  }
}

module.exports = SystemInfoScanner;
