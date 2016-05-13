'use strict';

class NetworkInfo {
  /**
   *
   * @param {{name: string, info: Interface}} interfaces
   */
  constructor(interfaces) {
    this.interfaces = interfaces;
  }
}

module.exports = NetworkInfo;
