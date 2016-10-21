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

  _scanInterfaces(interfaces) {
    return Object.keys(interfaces)
      .reduce((prev, current) => {
        const command = NetworkInfoCommand.commands.getInterfaceInfo(current);
        return prev.then(result => {
          return this._childProcessAdapter.exec(command)
            .then(info => {
              result[current] = info;
              return result;
            })
            .catch(error => {
              if (error.message !== `Device "${current}" does not exist.`) {
                throw error;
              }

              return result;
            });
        });
      }, Promise.resolve({}));
  }

  _extractNetworkInfo(scanResults) {
    const interfaces = {};

    const lanIp = scanResults.eth0.match(NetworkInfoCommand._regexps.ifconfigIp);
    interfaces.lan = new Interface('LAN', lanIp ? lanIp[1] : null);

    if (scanResults.wlan0) {
      const wifiIp = scanResults.wlan0.match(NetworkInfoCommand._regexps.ifconfigIp);
      interfaces.wifi = new Interface('WiFi', wifiIp ? wifiIp[1] : null);
    } else {
      interfaces.wifi = new Interface('WiFi', null);
    }

    return new NetworkInfo(interfaces);
  }

  execute() {
    const interfaces = {
      eth0: 'LAN',
      wlan0: 'WiFi'
    };

    return this._scanInterfaces(interfaces)
      .then(results => this._extractNetworkInfo(results));
  }
}

module.exports = NetworkInfoCommand;
