var cleverbot = require('./cleverbot')
  , vm = require('vm')
  , util = require('util')
  , express = require('express')
  , fs = require('fs')
  , request = require('request')
  , redis = require('redis')
  , client = redis.createClient();

var config = {
  masters: ['einaros'], 
  masterChan: '#bitraf2',
  urls: []
};

module.exports = function(irc, state, reloadScript) {
  console.log('Reloaded bot script');

  function reload(notify) { 
    client.end();
    process.removeAllListeners('uncaughtException');
    fs.writeFileSync('config.json', JSON.stringify(config));
    var error = reloadScript();
    if (error) irc.notice(notify, 'Error during reload: ' + error.message);
    else irc.notice(notify, 'Reloaded bot script');
  }

  // Configure
  try {
    config = JSON.parse(fs.readFileSync('config.json', 'utf8'));
  }
  catch (e) {}

  // Watch bot script .. and reload
  fs.unwatchFile(__filename);
  fs.watchFile(__filename, function (curr, prev) {
    if (curr.mtime != prev.mtime) reload(config.masters[0]);
  });

  // Uncaught exceptions
  process.on('uncaughtException', function(err) {
    console.log(err);
  });

  // Redis
  client.on('error', function() {});
  client.on('end', function() {
    console.log('Redis connection closed.');
  });
  client.on('connect', function() {
    console.log('Redis connected. Subscribing.');
    client.subscribe('ircbot');
  });
  client.on("message", function (channel, message) {
    irc.notice('einaros', message);
  });

  // Restart web server
  if (state.web) {
    try { state.web.close(); }
    catch (e) { console.error(e); }
    state.web = null;
  }
  state.web = express.createServer();
  state.web.listen(4001);
  state.web.get('/', function(req, res) {
    res.send(config.urls.join('\n'), { 'Content-Type': 'text/plain' }, 200);
    res.end();
  });

  // Re-add IRC bindings
  irc.removeAllListeners();
  irc.on('privmsg', function(from, to, message) {
    if (to[0] == '#') { // Message to a channel
      // Use cleverbot for talk
      if (message.indexOf(irc.whoami() + ':') == 0) {
        cleverbot.ask(message.substr((irc.whoami() + ':').length), function(text) {
          irc.privmsg(to, from + ': ' + text);
        });
        return;
      }
      // Save urls
      else if (/https?:/i.test(message)) {
        config.urls.push(message.match(/(https?:.*)( |\b)/i)[1]);
      }
    }
    // Execute javascript
    if (message[0] == '!') {
      var replyTo = to[0] == '#' ? to : from;
      try {
        var context = {};
        if (config.masters.indexOf(from) != -1) {
          // Build master context
          for (var member in global) {
            context[member] = global[member];
          }
          context.irc = irc;
          context.config = config;
          context.require = require;
          context.request = request;
          context.respond = function(t) {
            irc.notice(replyTo, t);
          };
          context.reload = function() {
            reload(replyTo);
          };
        }
        var res = vm.runInNewContext(message.substr(1), context);
        if (typeof res != 'undefined') irc.notice(replyTo, util.inspect(res).replace(/\n/g, ' '));
      }
      catch (e) {
        irc.notice(replyTo, 'Error: ' + e.message);
      }
    }
  });
}
