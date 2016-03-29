
var Reflux = require('reflux');

var Actions = require('../actions/settings.js'),
    Config = require('../config');

var SettingsStore = Reflux.createStore({
  listenables: Actions,
  onUpdate: function(property, value) {
    var result = Config.set(property, value) && Config.save();
    this.trigger({
      result: result
    });
  }
});

module.exports = SettingsStore;
