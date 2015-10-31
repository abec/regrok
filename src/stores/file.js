var fs = require("fs");

var _ = require('underscore'),
    Reflux = require('reflux');

var Actions = require('../actions'),
    Config = require('../config'),
    Security = require('../security'),
    FileHelper = require('./helpers/file.js');

var FileStore = Reflux.createStore({
  init: function() {
    this.location = Config.get("repository:file:path");
    this.security_enabled = Config.get("repository:security:enabled");
    this.password = null;
    this.entries = [];
    this.ready = false;
    this.database_ready = false;
    this.has_password = false;
    this.helper = new FileHelper(this.location, this.middleware());

    this.listenToMany(Actions);
  },
  onSetPassword: function(password) {
    this.password = password;
    this.has_password = true;
    this.status();
  },
  onIsDatabaseReady: function() {
    var self = this;
    fs.stat(self.location, function(err) {
      if (err) self.database_ready = false;
      else self.database_ready = true;

      self.status();
    });
  },
  onLoad: function() {
    var self = this;
    self.helper.load().spread(function(location, contents) {
      if (contents) {
        self.entries = JSON.parse(contents);
        self.database_ready = true;
        self.ready = true;
      }
      self.status();
    }).catch(function(err) {
      console.log(err);
      self.status();
    });
  },
  onSave: function() {
    var self = this;
    self.helper.save(JSON.stringify(self.entries)).spread(function(location, contents) {
      self.status();
    });
  },
  onAddEntry: function(entry) {
    this.entries.push(entry);
    this.status();
  },
  onRemoveEntry: function(entryId) {
    for (var i = 0; i < this.entries.length; ++i) {
      if (this.entries[i].id == entryId) {
        this.entries.splice(i, 1);
        break;
      }
    }

    this.status();
  },
  // Refactor
  onGetEntry: function(entryId) {
    for (var i = 0; i < this.entries.length; ++i) {
      if (this.entries[i].id == entryId) {
        this.status({entry: this.entries[i]});
        break;
      }
    }
  },
  onReset: function() {
    try {
      fs.renameSync(this.location, this.location + "." + new Date().getTime().toString());
    } catch (e) {
      // Doesn't exit... just like we want it.
    }
    this.entries = [];
    this.ready = false;
    this.status();
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
  status: function(extra) {
    this.trigger(_.extend({
      ready: this.ready,
      database_ready: this.database_ready,
      has_password: this.has_password,
      entries: this.entries
    }, extra));
  }


  // save: function() {
  //   var self = this;
  //   return Security.encrypt(JSON.stringify(self.entries), self.password).then(function(encrypted_contents) {
  //     fs.writeFileSync(Config.get("repository:encrypted_file:path"), encrypted_contents);
  //     fs.truncateSync(Config.get("repository:encrypted_file:path"), encrypted_contents.length);
  //     return self.entries;
  //   });
  // },
  // load: function() {
  //   var self = this;
  //   return new Promise(function(resolve, reject) {
  //     try {
  //       // Stat throws an exception if the path doesn't exist.
  //       fs.statSync(Config.get("repository:encrypted_file:path"));
  //     } catch (e) {
  //       return self.save().then(resolve, reject);
  //     }

  //     var encrypted_contents = fs.readFileSync(Config.get("repository:encrypted_file:path"));
  //     return Security.decrypt(encrypted_contents, self.password).then(function(decrypted_contents) {
  //       if (decrypted_contents) {
  //         self.entries = JSON.parse(decrypted_contents.toString());
  //         return resolve(self.entries);
  //       } else {
  //         return reject(null);
  //       }
  //     }, reject);
  //   });
  // }
});

module.exports = FileStore;
