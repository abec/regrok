var EventEmitter = require('events').EventEmitter,
    IteratorStream = require('level-iterator-stream');

var utils = require('./utils.js');

function isFunction (f) {
  return 'function' === typeof f;
}

function isString (s) {
  return 'string' === typeof s;
}

function isObject (o) {
  return o && 'object' === typeof o;
}

var SecureLevel = module.exports = function (db, options) {
  var emitter = new EventEmitter();
  emitter.options = options;

  emitter.methods = {};

  function errback (err) { if (err) emitter.emit('error', err); }

  function mergeOpts(opts) {
    var o = {};
    if(options)
      for(var j in options)
        if(options[j] !== undefined) o[j] = options[j];
    if(opts)
      for(var k in opts)
        if(opts[k] !== undefined) o[k] = opts[k];
    return o;
  }

  emitter.put = function (key, value, opts, cb) {
    if('function' === typeof opts) cb = opts, opts = {};
    if(!cb) cb = errback;

    utils.encrypt(value, options.key)
    .then(function(encrypted_contents) {
      db.put(key, encrypted_contents, mergeOpts(opts), cb);
    });
  };

  emitter.del = db.del.bind(db);

  emitter.batch = db.batch.bind(db);

  emitter.get = function (key, opts, cb) {
    if('function' === typeof opts) cb = opts, opts = {};

    db.get(key, opts, function(err, value) {
      if (err) return cb(err, value);

      utils.decrypt(value, options.key)
      .then(function(decrypted_contents) {
        return cb(null, decrypted_contents);
      })
      .catch(cb);
    });
  };

  emitter.clone = db.clone.bind(db);

  emitter.readStream =
  emitter.createReadStream = function (opts) {
    opts = mergeOpts(opts);
    if (opts.keys === undefined) opts.keys = true;
    if (opts.values === undefined) opts.values = true;

    var codec = new Codec(opts);

    // options = extend( {keys: true, values: true}, this.options, options)

    opts = codec.encodeLtgt(opts);
    opts.keyAsBuffer = codec.keyAsBuffer(opts);
    opts.valueAsBuffer = codec.valueAsBuffer(opts);

    if ('number' !== typeof opts.limit) options.limit = -1;

    opts.decoder = codec.createStreamDecoder(options);

    var iterator = db.iterator(opts);

    var iteratorWrapper = {
      next: function() {
        return utils.decode(iterator.next(), options.key);
      }
    };

    return new IteratorStream(iteratorWrapper, opts);
  };

  emitter.valueStream =
  emitter.createValueStream = function (opts) {
    opts = opts || {};
    opts.values = true;
    opts.keys = false;
    return emitter.createReadStream(mergeOpts(opts));
  };

  emitter.keyStream =
  emitter.createKeyStream = db.createKeyStream.bind(db);

  emitter.close = db.close.bind(db);

  return emitter;
};
