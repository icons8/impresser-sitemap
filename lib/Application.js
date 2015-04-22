var
  fs = require('fs'),
  merge = require('./merge'),
  Server = require('./Server'),
  Generator = require('./Generator'),
  MySqlStorage = require('impresser-mysql-storage');

module.exports = Application;

function Application(options) {
  this.options = options || {};

  this._storage = null;
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

  _initStorage: function() {
    var
      options,
      storageOptions,
      storageOptionsMap;

    storageOptionsMap = {
      storageDriver: 'driver',
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

    if (typeof storageOptions.driver != 'undefined' && storageOptions.driver != 'mysql') {
      console.error('Unsupported storage driver "'+storageOptions.driver+'"');
      process.exit();
    }

    this._storage = new MySqlStorage(storageOptions);
  },

  _runServer: function() {
    new Server(this._storage, this.options).run();
  },

  _print: function() {
    new Generator(this._storage, this.options).print()
      .finally(function() {
        process.exit();
      });
  },

  run: function() {
    this._initStorage();

    if (this.options.server) {
      this._runServer();
    }
    else {
      this._print();
    }
  }

};