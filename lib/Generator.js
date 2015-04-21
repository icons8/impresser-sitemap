var
  xml = require('xml');

module.exports = Generator;

function Generator(storage, options) {
  this.options = options || {};
  this.storage = storage;
}

Generator.prototype = {

  _generate: function() {
    return this.storage.urls()
      .then(function(urls) {
        return '<?xml version="1.0" encoding="UTF-8"?>'
          + xml({
            urlset: [
              {
                _attr: {
                  xmlns: 'http://www.sitemaps.org/schemas/sitemap/0.9'
                }
              }
            ].concat(
              urls.map(function(url) {
                return {
                  url: [{loc: url}]
                }
              })
            )
          });
      })
  },

  generate: function() {
    return this._generate()
      .catch(function(error) {
        console.log(error);
      });
  },

  print: function() {
    return this._generate()
      .then(function(data) {
        console.log(data);
      });
  }

};