const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const path = require('path');
const childProcess = require('child_process');

const HostnameCommand = require('./commands/hostname-command');
const NetworkInfoCommand = require('./commands/network-info-command');
const ApplicationInfoCommand = require('./commands/application-info-command');
const UpdateInfoCommand = require('./commands/update-info-command');
const ChildProcessAdapter = require('./child-process-adapter');
const SystemInfoScanner = require('./system-info-scanner');
const SystemInfoWatcher = require('./system-info-watcher');

const childProcessAdapter = new ChildProcessAdapter(childProcess);
const systemInfoScanner = new SystemInfoScanner(
  new HostnameCommand(childProcessAdapter),
  new UpdateInfoCommand(childProcessAdapter),
  new ApplicationInfoCommand(childProcessAdapter),
  new NetworkInfoCommand(childProcessAdapter)
);
const systemInfoWatcher = new SystemInfoWatcher(systemInfoScanner);

app.use(express.static(path.join(__dirname, '../public')));

var systemInfo;

io.on('connection', socket => {
  socket.emit('systemInfoChanged', systemInfo);
});

systemInfoWatcher.on(SystemInfoWatcher.events.change, newSystemInfo => {
  io.emit('systemInfoChanged', newSystemInfo);
  systemInfo = newSystemInfo;
});

systemInfoWatcher.startMonitoring();

module.exports = server;
