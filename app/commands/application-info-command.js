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

  execute() {
    return this._childProcessAdapter.exec(ApplicationInfoCommand.commands.getImageInfo()).then(info => {
      return new ApplicationInfo(
        ApplicationInfo.applicationState.running,
        info.match(ApplicationInfoCommand._regexps.since)[1],
        null,
        null);
    }).catch(stdout => {
      if (stdout.indexOf('Loaded: not-found') >= 0) {
        return new ApplicationInfo(ApplicationInfo.applicationState.notInstalled, null, null, null);
      } else if (stdout.indexOf('Loaded: loaded') >= 0) {
        return new ApplicationInfo(
          ApplicationInfo.applicationState.stopped,
          null,
          stdout.match(ApplicationInfoCommand._regexps.since) ? stdout.match(ApplicationInfoCommand._regexps.since)[1] : null
        );
      } else {
        throw new Error(stdout);
      }
    }).then(appInfo => {
      if (appInfo.state === ApplicationInfo.applicationState.running || appInfo.state === ApplicationInfo.applicationState.stopped) {
        return this._childProcessAdapter.exec(ApplicationInfoCommand.commands.getVersion()).then(version => {
          appInfo.version = version.trim().match(ApplicationInfoCommand._regexps.version)[1];
          return appInfo;
        });
      } else {
        return appInfo;
      }
    });
  }
}

module.exports = ApplicationInfoCommand;
