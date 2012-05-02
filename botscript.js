var cleverbot = require('./cleverbot');
var vm = require('vm');
var util = require('util');
var express = require('express');

module.exports = function(irc, state) {
  console.log('Reloading bot script');
  if (state.web) {
    console.log('Closing express instance');
    try { state.web.close(); }
    catch (e) { console.error(e); }
    state.web = null;
  }
  console.log('Starting express instance');
  state.web = express.createServer();
  state.web.listen(4001);
  if (!state.urls) state.urls = [];
  state.web.get('/', function(req, res) {
    res.send(state.urls.join('\n'), { 'Content-Type': 'text/plain' }, 200);
    res.end();
  });

  irc.removeAllListeners();
  irc.on('privmsg', function(from, to, message) {
    if (to[0] == '#' && message.indexOf(irc.whoami() + ':') == 0) {
      cleverbot.ask(message.substr(10), function(text) {
        irc.privmsg(to, from + ': ' + text);
      });
    }
    else if (to[0] == '#' && /https?:/i.test(message)) {
      state.urls.push(message.match(/(https?:.*)( |\b)/i)[1]);
    }
    else if (to[0] == '#' && message[0] == '!') {
      try {
        irc.privmsg(to, util.inspect(vm.runInNewContext(message.substr(1))));
      }
      catch (e) {}
    }
  });
}
