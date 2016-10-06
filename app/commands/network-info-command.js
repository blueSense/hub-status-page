'use strict';

const Interface = require('../models/interface');
const NetworkInfo = require('../models/network-info');
const ChildProcessAdapter = require('../child-process-adapter');

class NetworkInfoCommand {
  constructor() {
    this._childProcessAdapter = ChildProcessAdapter.create();
  }

  static create() {
    return new NetworkInfoCommand();
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
    const interfaces = {
      eth0: 'LAN',
      wlan0: 'WiFi'
    };

    const scanInterfaces = Object.keys(interfaces)
      .reduce((prev, current) => {
        const command = NetworkInfoCommand.commands.getInterfaceInfo(current);
        return prev.then(result => this._childProcessAdapter.exec(command)
          .then(info => {
            result[current] = info;
            return result;
          })
          .catch(error => {
            if (error !== `Device "${current}" does not exist.`) {
              throw error;
            }

            return result;
          }));
      }, Promise.resolve({}));

    return scanInterfaces.then(results => {
      const interfaces = {};

      const lanIp = results.eth0.match(NetworkInfoCommand._regexps.ifconfigIp);
      interfaces.lan = new Interface('LAN', lanIp ? lanIp[1] : null);

      if (results.wlan0) {
        const wifiIp = results.wlan0.match(NetworkInfoCommand._regexps.ifconfigIp);
        interfaces.wifi = new Interface('WiFi', wifiIp ? wifiIp[1] : null);
      } else {
        interfaces.wifi = new Interface('WiFi', null);
      }

      return new NetworkInfo(interfaces);
    });
  }
}

module.exports = NetworkInfoCommand;
