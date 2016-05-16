module.exports = function() {
  this.Given(/^I am on the status page$/, function(callback) {
    var app = require('../../app');
    var world = this;

    // app.set('port', 30321);

    // var server = app.listen(app.get('port'), () => {
    //   console.log('Started application on port ' + server.address().port);
    //   world.browser.get('http://localhost:30321').then(() => callback());
    // });
  });

  this.When(/^the system information changes$/, function() {
    this.newInfo = 'new info';
    this.server.emit(this.newInfo);
  });

  this.Then(/^I should be able to see the system information$/, function(callback) {
    callback.pending();
  });

  this.Then(/^I should be able to see updated system information$/, function(callback) {
    callback.pending();
  });
};
