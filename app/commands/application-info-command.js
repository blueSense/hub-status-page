'use strict';

const ChildProcessAdapter = require('../child-process-adapter');
const ApplicationInfo = require('../models/application-info');

class ApplicationInfoCommand {
  constructor() {
    this._childProcessAdapter = ChildProcessAdapter.create();
  }

  static create() {
    return new ApplicationInfoCommand();
  }

  static get commands() {
    return {
      getImageInfo: () => 'systemctl status bsn-supernode',
      getVersion: () => 'pacman -Q bsn-supernode'
    };
  }

  static get _regexps() {
    return {
      since: /since (.*?);/m,
      version: /^bsn-supernode (.*\-\d)$/
    };
  }

  _extractBasicInfo(info) {
    return new ApplicationInfo(
      ApplicationInfo.applicationState.running,
      info.match(ApplicationInfoCommand._regexps.since)[1],
      null,
      null);
  }

  _handleError(error) {
    if (error.message.indexOf('Loaded: not-found') >= 0) {
      return new ApplicationInfo(ApplicationInfo.applicationState.notInstalled, null, null, null);
    } else if (error.message.indexOf('Loaded: loaded') >= 0) {
      return new ApplicationInfo(
        ApplicationInfo.applicationState.stopped,
        null,
        error.message.match(ApplicationInfoCommand._regexps.since) ? error.message.match(ApplicationInfoCommand._regexps.since)[1] : null
      );
    } else {
      throw error;
    }
  }

  _extractVersion(appInfo) {
    if (appInfo.state === ApplicationInfo.applicationState.running || appInfo.state === ApplicationInfo.applicationState.stopped) {
      return this._childProcessAdapter.exec(ApplicationInfoCommand.commands.getVersion()).then(version => {
        appInfo.version = version.trim().match(ApplicationInfoCommand._regexps.version)[1];
        return appInfo;
      });
    } else {
      return appInfo;
    }
  }

  execute() {
    return this._childProcessAdapter
      .exec(ApplicationInfoCommand.commands.getImageInfo())
      .then(info => this._extractBasicInfo(info))
      .catch(error => this._handleError(error))
      .then(appInfo => this._extractVersion(appInfo));
  }
}

module.exports = ApplicationInfoCommand;
