
/**
 * Usage: decrypt(encrypt(contents, password), password);
 * Storage Format:
 * 1. N random bytes for IV (defined in config).
 * 2. Encrypted contents.
 * Key Derivation:
 * 1. SHA256 password.
 * @type {[type]}
 */

var Crypto = require('crypto');

var Config = require('../config');

/**
 * Create a master key.
 * @param  {string} password to create key from.
 * @return {Promise} that resolves to master key.
 */
function createKey(password) {
  if (!password) password = "";
  return new Promise(function(resolve, reject) {
    var hash = Crypto.createHash('sha256');
    hash.write(password);
    hash.end();
    resolve(hash.read());
  });
}

/**
 * Encrypts the contents using the password.
 * @param  {string|buffer} contents to encrypt.
 * @param  {string|buffer} key.
 * @return {Promise} resolves to the encrypted contents.
 */
function encrypt(contents, key) {
  return new Promise(function(resolve, reject) {
    var iv = Crypto.randomBytes(Config.get("repository:security:iv_size"));

    var cipher = Crypto.createCipheriv(Config.get("repository:security:cipher"), key, iv),
        data = [iv];
    cipher.on('data', function(chunk) {
      data.push(chunk);
    });
    cipher.on('end', function() {
      return resolve(Buffer.concat(data));
    });

    cipher.write(contents);
    return cipher.end();
  });
}

/**
 * Decrypts the contents using the password.
 * @param  {string|buffer} full_encrypted_contents to decrypt.
 * @param  {string|buffer} key
 * @return {Promise} resolves to the encrypted contents.
 */
function decrypt(full_encrypted_contents, key) {
  return new Promise(function(resolve, reject) {
    var iv = full_encrypted_contents.slice(0, Config.get("repository:security:iv_size"));
    var encrypted_contents = full_encrypted_contents.slice(Config.get("repository:security:iv_size"));

    var cipher = Crypto.createDecipheriv(Config.get("repository:security:cipher"), key, iv),
        data = [];
    cipher.on('data', function(chunk) {
      data.push(chunk);
    });
    cipher.on('end', function() {
      return resolve(Buffer.concat(data));
    });

    try {
      cipher.write(encrypted_contents);
      return cipher.end();
    } catch(err) {
      return reject(err);
    }
  });
}

module.exports = {
  createKey: createKey,
  encrypt: encrypt,
  decrypt: decrypt
};
