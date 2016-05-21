'use strict';

class ApplicationInfo {
  /**
   * @param {!ApplicationInfo.applicationState} state
   * @param {?string} startedAt
   * @param {?string} finishedAt
   * @param {?string} version
   */
  constructor(state, startedAt, finishedAt, version) {
    this.state = state;
    this.startedAt = startedAt;
    this.finishedAt = finishedAt;
    this.version = version;
  }

  /**
   * @enum {number}
   */
  static get applicationState() {
    return {
      running: 0,
      stopped: 1,
      notInstalled: 2
    };
  }
}

module.exports = ApplicationInfo;
