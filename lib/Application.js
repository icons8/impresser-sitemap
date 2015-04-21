var
  fs = require('fs'),
  merge = require('./merge'),
  Server = require('./Server'),
  Generator = require('./Generator'),
  Storage = require('impress-mysql-storage');

module.exports = Application;

function Application(options) {
  this.options = options || {};
  this._init();
}

Application.prototype = {

  _init: function() {
    var
      filtered = {},
      options = this.options;

    if (this.options.config) {
      Object.keys(options).forEach(function(key) {
        if (typeof options[key] != 'undefined') {
          filtered[key] = options[key];
        }
      });
      this.options = merge(this._getParsedConfig(this.options.config), filtered);
    }
  },

  _getParsedConfig: function(config) {
    var
      result = {};

    if (!Array.isArray(config)) {
      config = [config];
    }

    config.forEach(function(config) {
      if (typeof config != 'string') {
        _merge(config);
        return;
      }
      try {
        _merge(
          JSON.parse(
            fs.readFileSync(config)
          )
        );
      }
      catch(error) {
        console.error(error);
      }
    });

    function _merge(config) {
      if (!config || typeof config != 'object') {
        return;
      }
      merge(result, config);
    }

    return result;
  },

  addConfig: function(config) {
    merge(this.options, this._getParsedConfig(config));
    return this;
  },

  run: function() {
    var
      options,
      storage,
      storageOptions,
      storageOptionsMap;

    storageOptionsMap = {
      storageHost: 'host',
      storageUser: 'user',
      storagePassword: 'password',
      storageDatabase: 'database',
      storageTablename: 'tablename'
    };
    storageOptions = {};

    options = this.options;
    Object.keys(storageOptionsMap).forEach(function(key) {
      if (options.hasOwnProperty(key)) {
        storageOptions[storageOptionsMap[key]] = options[key];
      }
    });

    storage = new Storage(storageOptions);

    if (options.server) {
      new Server(storage, options).run();
    }
    else {
      new Generator(storage, options).print()
        .finally(function() {
          process.exit();
        });
    }
  }

};