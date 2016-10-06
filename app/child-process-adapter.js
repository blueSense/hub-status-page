'use strict';

const childProcess = require('child_process');

class ChildProcessAdapter {
  constructor() {
    this._childProcess = childProcess;
  }

  static create() {
    return new ChildProcessAdapter();
  }

  exec(command, options) {
    return new Promise((resolve, reject) => {
      this._childProcess.exec(command, options, (error, stdout) => {
        if (error) {
          reject(error);
        } else {
          resolve(stdout);
        }
      });
    });
  }
}

module.exports = ChildProcessAdapter;
