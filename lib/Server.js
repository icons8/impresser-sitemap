const
  DEFAULT_SERVER_PORT = 8697;

var
  http = require('http'),
  zlib = require('zlib'),
  stream = require('stream'),
  Readable = stream.Readable,
  Generator = require('./Generator');

module.exports = Server;

function Server(storage, options) {
  this.options = options || {};

  this._port = options.serverPort || DEFAULT_SERVER_PORT;
  this._generator = new Generator(storage, options);
}

Server.prototype = {

  run: function() {
    var
      server,
      generator = this._generator;

    server = http.createServer(function(req, res) {
      var
        acceptEncoding,
        stream,
        deflated,
        gzipped,
        data;

      if (req.method != 'GET' || req.url != '/') {
        res.writeHead(404, {
          "Content-Type": 'text/plain'
        });
        res.end('Not Found');
        return;
      }

      acceptEncoding = req.headers['accept-encoding'] || '';
      deflated = /\bdeflate\b/i.test(acceptEncoding);
      gzipped = /\bgzip\b/i.test(acceptEncoding);

      generator.generate()
        .catch(function(error) {
          res.writeHead(500, {
            "Content-Type": 'text/plain'
          });
          res.end(String(error));
        })
        .then(function(content) {

          res.statusCode = 200;
          res.setHeader('Content-Type', 'text/xml; charset=utf-8');

          if (!deflated && !gzipped) {
            res.end(content);
          }
          else {
            stream = new Readable;
            stream.on('error', function(error) {
              console.error('Error: Send response data', error);
            });
            stream._read = function() {
              this.push(content);
              this.push(null);
            };
            if (gzipped) {
              res.setHeader('Content-Encoding', 'gzip');
              stream.pipe(zlib.createGzip()).pipe(res);
            }
            else {
              res.setHeader('Content-Encoding', 'deflate');
              stream.pipe(zlib.createDeflate()).pipe(res);
            }
          }

        });

    });

    server.listen(this._port);

    console.log('Server running on port', this._port);
  }

};