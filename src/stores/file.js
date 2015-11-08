var fs = require("fs");

var _ = require('underscore'),
    Promise = require('bluebird'),
    Reflux = require('reflux');

var Actions = require('../actions'),
    Config = require('../config'),
    Security = require('../security'),
    FileHelper = require('./helpers/file.js');

var FileStore = Reflux.createStore({
  listenables: Actions,
  init: function() {
    console.debug("Loading FileStore with the path (" + Config.get("repository:file:path") + ").");

    this.location = Config.get("repository:file:path");
    this.security_enabled = Config.get("repository:security:enabled");

    this.helper = new FileHelper(this.location, this.middleware());

    this.ready = false;
    this.password = null;
    this.entries = null;
  },
  onReady: function() {
    this.genericTrigger();
  },
  onLoad: function() {
    this.load()
      .catch(function(err) {
        console.log(err);
      })
      .finally(this.genericTrigger.bind(this, null));
  },
  onSave: function(entries) {
    this.entries = _.union(this.entries, entries || []);
    this.save()
      .catch(function(err) {
        console.log(err);
      })
      .finally(this.genericTrigger.bind(this, null));
  },
  onSet: function(entries) {
    this.entries = entries;
    this.genericTrigger();
  },
  onRegister: function(password) {
    var self = this;
    this.reset();
    this.password = password;
    this.save()
      .then(function(entries) {
        self.entries = entries;
      })
      .catch(function(err) {
        console.log(err);
      })
      .finally(this.genericTrigger.bind(this, null));
  },
  onLogin: function(password) {
    this.password = password;
    this.load()
      .catch(function(err) {
        console.log(err);
      })
      .finally(this.genericTrigger.bind(this, null));
  },
  onLogout: function() {
    this.password = null;
    this.entries = null;
    this.ready = false;
    this.genericTrigger();
  },

  save: function() {
    var entries = this.entries || [];
    return this.helper.save(JSON.stringify(entries))
      .then(function() {
        return entries
      })
      .catch(function(err) {
        console.log(err);
      });
  },
  load: function() {
    var self = this;
    return self.helper.load()
      .spread(function(location, contents) {
        if (contents) {
          self.entries = JSON.parse(contents);
          return self.entries;
        } else {
          return Promise.reject("Contents came back null.");
        }
      });
  },
  reset: function() {
    try {
      fs.renameSync(this.location, this.location + "." + new Date().getTime().toString());
    } catch (e) {
      // Doesn't exit... just like we want it.
    }
    this.entries = null;
  },
  middleware: function() {
    var self = this;
    if (this.security_enabled) {
      return {
        save: [
          function encryptContents(location, contents) {
            return Security.encrypt(contents, self.password).then(function(encrypted_contents) {
              return [location, encrypted_contents];
            });
          }
        ],
        load: [
          function decryptContents(location, contents) {
            return Security.decrypt(contents, self.password).then(function(decrypted_contents) {
              return [location, decrypted_contents];
            });
          }
        ]
      };
    } else {
      return null;
    }
  },
  isReady: function() {
    var self = this;

    // 1. Check file exists
    // 2. Check for password or security is off.
    // 3. Check for entries.
    return Promise.promisify(require("fs").stat)(self.location)
      .catch(function() {
        return false;
      })
      .then(function() {
        return !!self.password || !self.security_enabled;
      })
      .then(function() {
        return self.entries !== null;
      });
  },
  genericTrigger: function(extra) {
    var self = this;
    self.isReady().then(function(ready) {
      self.trigger(_.extend({
        ready: ready,
        entries: self.entries
      }, extra || {}));
    });
  }
});

module.exports = FileStore;
