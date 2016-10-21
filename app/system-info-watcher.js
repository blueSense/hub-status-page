'use strict';

const EventEmitter = require('events').EventEmitter;
const SystemInfoScanner = require('./system-info-scanner');

class SystemInfoWatcher extends EventEmitter {
  /**
   * @param systemInfoScanner
   */
  constructor() {
    super();

    this._systemInfoScanner = SystemInfoScanner.create();

    this.updateInterval = 10000;
  }

  static create() {
    return new SystemInfoWatcher();
  }

  static get events() {
    return {
      change: 'change'
    };
  }

  startMonitoring() {
    var previousState;

    function scan() {
      this._systemInfoScanner.execute()
        .then(currentState => {
          if (JSON.stringify(previousState) !== JSON.stringify(currentState)) {
            this.emit(SystemInfoWatcher.events.change, currentState);
          }

          previousState = currentState;
        })
        .catch(error => console.error(error));
    }

    scan.call(this);
    this._currentScan = setInterval(() => scan.call(this), this.updateInterval);
  }

  stopMonitoring() {
    clearInterval(this._currentScan);
  }
}

module.exports = SystemInfoWatcher;
