'use strict';

const ChildProcessAdapter = require('../child-process-adapter');
const ApplicationInfo = require('../models/application-info');

class ApplicationInfoCommand {
  constructor(childProcessAdapter) {
    this._childProcessAdapter = childProcessAdapter;
  }

  static get commands() {
    return {
      getImageInfo: () => 'sudo docker inspect bsn-node-hub'
    };
  }

  execute() {
    return this._childProcessAdapter.exec(ApplicationInfoCommand.commands.getImageInfo()).then(info => {
      var parsedInfo = JSON.parse(info)[0];

      var state = parsedInfo.State.Running ? ApplicationInfo.applicationState.running : ApplicationInfo.applicationState.stopped;
      var startedAt = parsedInfo.State.StartedAt;
      var finishedAt = parsedInfo.State.FinishedAt;
      var image = parsedInfo.Config.Image;
      var version = parsedInfo.Config.Labels.version;

      return new ApplicationInfo(state, startedAt, finishedAt, image, version);
    }).catch(error => {
      if (error.message.indexOf('No such image or container') >= 0) {
        return new ApplicationInfo(ApplicationInfo.applicationState.notInstalled, null, null, null, null);
      } else {
        throw error;
      }
    });
  }
}

module.exports = ApplicationInfoCommand;

/* istanbul ignore next */
module.exports.create = function() {
  return new ApplicationInfoCommand(ChildProcessAdapter.create());
};
