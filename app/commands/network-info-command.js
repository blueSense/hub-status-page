'use strict';

const Interface = require('../models/interface');
const NetworkInfo = require('../models/network-info');
const ChildProcessAdapter = require('../child-process-adapter');

class NetworkInfoCommand {
  constructor(childProcessAdapter) {
    this._childProcessAdapter = childProcessAdapter;
  }

  static get commands() {
    return {
      getInterfaceInfo: iface => `ip addr show ${iface}`
    };
  }

  static get _regexps() {
    return {
      ifconfigIp: /inet (([0-9\.]+){4})/
    };
  }

  execute() {
    return Promise.all([
      this._childProcessAdapter.exec(NetworkInfoCommand.commands.getInterfaceInfo('eth0')),
      this._childProcessAdapter.exec(NetworkInfoCommand.commands.getInterfaceInfo('wlan0'))
    ]).then(results => {
      var lanIp = results[0].match(NetworkInfoCommand._regexps.ifconfigIp);
      var wifiIp = results[1].match(NetworkInfoCommand._regexps.ifconfigIp);

      return new NetworkInfo({
        lan: new Interface('LAN', lanIp ? lanIp[1] : null),
        wifi: new Interface('WiFi', wifiIp ? wifiIp[1] : null)
      });
    });
  }
}

module.exports = NetworkInfoCommand;

/* istanbul ignore next */
module.exports.create = function() {
  return new NetworkInfoCommand(ChildProcessAdapter.create());
};
