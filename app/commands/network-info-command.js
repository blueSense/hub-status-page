'use strict';

const Command = require('./command');
const Interface = require('../models/interface');
const NetworkInfo = require('../models/network-info');

class NetworkInfoCommand extends Command {
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
