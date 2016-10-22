const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const path = require('path');

const SystemInfoWatcher = require('./system-info-watcher');
const systemInfoWatcher = SystemInfoWatcher.create();

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
