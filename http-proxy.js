var http = require('http');
var httpProxy = require('http-proxy');
var proxy = httpProxy.createProxyServer({});

proxy.on('error', function(err) {
  console.error('[error] ' + err.message);
});

var server = http.createServer(function(req, res) {
  var originalUrl = req.url;
  var target;
  var targetUrl = originalUrl;

  if (req.url.indexOf('/frontend') === 0) {
    targetUrl = req.url = req.url.slice(0);
    target = 'http://localhost:8080';
  } else {
    target = 'http://localhost:3000';
  }

  console.log(
    '[http] ' +
    req.method + ' ' + addressPretty(server) + originalUrl + ' -> ' +
    target + targetUrl
  );

  proxy.web(req, res, {
    target: target,
  });
});

server.listen(process.env.PORT || 5100, function(err) {
  if (err) {
    console.error(err.message);
    process.exit(1);
  }
  console.log('Proxy server listening on ' + addressPretty(server));
});

function addressPretty(server) {
  var addr = server.address()
  return 'http://' + addr.address + ':' + addr.port;
}

