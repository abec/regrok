var fs = require('fs'),
    lockfile = require('lockfile'),
    os = require('os'),
    path = require('path');

var _ = require('underscore'),
    Promise = require('bluebird'),
    Reflux = require('reflux'),
    Level = require('level'),
    LevelPromisify = require('level-promisify');

var Actions = require('../actions'),
    Config = require('../config'),
    Security = require('../security');

var LAST_ID_KEY = "LAST_ID",
    PASSWORD_CHECK_KEY = "PASSWORD_CHECK",
    PASSWORD_CHECK_VALUE = "PASSWORD_CHECK",
    LOCKFILE_PATH = path.join(os.tmpdir(), "fossa-level-store.lock");

var lock = Promise.promisify(lockfile.lock),
    unlock = Promise.promisify(lockfile.unlock);

var LevelDBStore = Reflux.createStore({
  listenables: Actions,
  init: function() {
    console.debug("Loading LevelDB Store with the path (" + Config.get("repository:leveldb:path") + ").");

    this.location = Config.get("repository:leveldb:path");
    this.security_enabled = Config.get("repository:security:enabled");

    this.db = null;
    this.dbpromise = null;
    this.last_id = 0;

    this.ready = false;
    this.password = null;
  },
  onReady: function() {
    this.genericTrigger();
  },
  onLoad: function() {
    this.load();
    this.genericTrigger();
  },
  onSave: function() {
    this.isReady()
    .then(this.genericTrigger.bind(this, null));
  },
  onAdd: function(entry) {
    this.add(entry)
    .then(this.isReady.bind(this, null))
    .then(this.genericTrigger.bind(this, null));
  },
  onRemove: function(entry) {
    this.remove(entry)
    .then(this.isReady.bind(this, null))
    .then(this.genericTrigger.bind(this, null));
  },
  onRegister: function(password) {
    var self = this;
    // this.reset();
    this.password = password;
    this.load();
    this.setCheckPassword()
    .then(this.isReady.bind(this, null))
    .then(this.genericTrigger.bind(this, null));
  },
  onLogin: function(password) {
    var self = this;
    self.password = password;
    self.load();
    self.checkPassword()
        .then(function(passwordIsValid) {
          if (passwordIsValid) {
            self.error = null;
            return self.isReady().then(function() {
              return self.genericTrigger();
            });
          } else {
            self.password = null;
            self.error = new Error("Password is incorrect");
            return self.genericTrigger();
          }
        })
        .catch(function(err) {
          self.error = err;
          return self.genericTrigger();
        });
  },
  onLogout: function() {
    this.password = null;
    this.ready = false;
    this.genericTrigger();
  },

  load: function() {
    if (!this.dbpromise) {
      this.db = Level(this.location);
      this.dbpromise = LevelPromisify(this.db);
    }
  },
  add: function(entry) {
    if (!this.dbpromise) return Promise.reject("Database has not been loaded");

    return this.write(entry);
  },
  remove: function(entry) {
    if (!this.dbpromise) return Promise.reject("Database has not been loaded");

    return this.dbpromise.del(entry.id || entry);
  },
  list: function() {
    if (!this.dbpromise) return Promise.reject("Database has not been loaded");

    var self = this;

    return new Promise(function(resolve, reject) {
      // @TODO(Abe): Decrypt values.
      var entries = [];

      lock(LOCKFILE_PATH, {
        wait: 100,
        retries: 100,
        stale: 60 * 1000
      })
      .then(function() {
        self.db.createReadStream()
        .on('data', function(data) {
          if (data.key == LAST_ID_KEY) {
            self.last_id = data.value;
          } else if (data.key != PASSWORD_CHECK_KEY) {
            entries.push(self.read(data).then(function(entry) {
              entry.id = data.key;
              return entry;
            }));
          }
        })
        .on('error', function(err) {
          reject(err);
        })
        .on('end', function() {
          resolve(Promise.all(entries));
        });
      });
    })
    .tap(function() {
      return unlock(LOCKFILE_PATH);
    });
  },
  checkPassword: function() {
    if (!this.dbpromise) return Promise.reject("Database has not been loaded");
    if (!this.password) return Promise.reject("No password set");

    var self = this;
    return self.dbpromise.get(PASSWORD_CHECK_KEY).then(function(value) {
      return self.decrypt(self.password, value).then(function(contents) {
        return contents == PASSWORD_CHECK_VALUE;
      }).catch(function(err) {
        // Decrypt error
        if (err.message.indexOf("bad decrypt") != -1) {
          return false;
        } else {
          return Promise.reject(err);
        }
      });
    });
  },
  setCheckPassword: function() {
    if (!this.dbpromise) return Promise.reject("Database has not been loaded");
    if (!this.password) return Promise.reject("No password set");

    var self = this;
    return self.encrypt(self.password, PASSWORD_CHECK_VALUE).then(function(contents) {
      return self.dbpromise.put(PASSWORD_CHECK_KEY, contents);
    });
  },
  read: function(data) {
    var self = this;

    // No encryption.
    if (!self.security_enabled) return Promise.resolve(
      _.extend(JSON.parse(data.value), {
        id: data.key
      }));

    // Encryption.
    return self.decrypt(self.password, data.value).then(function(decrypted_contents) {
      return _.extend(JSON.parse(decrypted_contents), {
        id: data.key
      });
    });
  },
  write: function(entry) {
    // Primary index
    // @TODO(Abe): Secondary index for dates?
    var self = this;
    entry.id = self.last_id++;

    return self.dbpromise.put(LAST_ID_KEY, self.last_id).then(function() {
      var contents = JSON.stringify(entry);
      if (!self.security_enabled) {
        // No encryption.
        return self.dbpromise.put(entry.id, contents);
      } else {
        // Encryption.
        return self.encrypt(self.password, contents).then(function(contents) {
          return self.dbpromise.put(entry.id, contents);
        });
      }
    });
  },
  decrypt: function(password, encrypted_contents) {
    return Security.decrypt(new Buffer(encrypted_contents, "base64"), password);
  },
  encrypt: function(password, decrypted_contents) {
    return Security.encrypt(decrypted_contents, password).then(function(encrypted_contents) {
      return encrypted_contents.toString("base64");
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
  isReady: function() {
    var self = this;

    if (!this.dbpromise) {
      console.debug("Database has not been loaded");
      return Promise.resolve(false);
    }

    // 1. Check DB is open
    // 2. Check for password or security is off.
    // 3. @TODO(Abe): Password checks out if in use.
    return Promise.resolve(this.db.isOpen())
      .then(function(ready) {
        self.ready = ready && (!self.security_enabled || !!self.password);
        return self.ready;
      });
  },
  genericTrigger: function(extra) {
    var self = this;

    return new Promise(function(resolve, reject) {
      if (self.ready) {
        resolve(self.list());
      } else {
        resolve(null);
      }
    })
    .then(function(entries) {
      self.trigger(_.extend({
        ready: self.ready,
        entries: entries,
        error: self.error
      }, extra || {}));
    })
    .catch(function(err) {
      console.debug(err);
      // @TODO(Abe): Error handling.
      self.trigger(_.extend({
        ready: self.ready,
        entries: null,
        error: err
      }, extra || {}));
    });
  }
});

module.exports = LevelDBStore;
