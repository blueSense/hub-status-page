'use strict';

class SystemInfo {
  /**
   *
   * @param {!string} hostname
   * @param {!NetworkInfo} networkInfo
   * @param {!string} appInfo
   * @param {!string} updateStatus
     */
  constructor(hostname, networkInfo, appInfo, updateStatus) {
    this.hostname = hostname;
    this.networkInfo = networkInfo;
    this.appInfo = appInfo;
    this.updateStatus = updateStatus;
  }
}

module.exports = SystemInfo;
