var socket = io.connect();

var vm = new Vue({
  el: "#system-info",
  data: {
    systemInfo: {}
  },
  filters: {
    formatDate: function(date) {
      return moment(date).format('MMMM Do YYYY, h:mm:ss a');
    }
  }
});

socket.on('systemInfoChanged', function(systemInfo) {
  vm.systemInfo = systemInfo;
});
