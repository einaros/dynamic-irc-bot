var cleverbot = require('./cleverbot')
  , vm = require('vm')
  , util = require('util')
  , express = require('express')
  , master = 'einaros';


module.exports = function(irc, state, reload) {
  console.log('Reloading bot script');

  // Restart web server
  if (state.web) {
    try { state.web.close(); }
    catch (e) { console.error(e); }
    state.web = null;
  }
  state.web = express.createServer();
  state.web.listen(4001);
  if (!state.urls) state.urls = [];
  state.web.get('/', function(req, res) {
    res.send(state.urls.join('\n'), { 'Content-Type': 'text/plain' }, 200);
    res.end();
  });

  // Re-add IRC bindings
  irc.removeAllListeners();
  irc.on('privmsg', function(from, to, message) {
    if (to[0] == '#') { // Message to a channel
      // Use cleverbot for talk
      if (message.indexOf(irc.whoami() + ':') == 0) {
        cleverbot.ask(message.substr(10), function(text) {
          irc.privmsg(to, from + ': ' + text);
        });
      }
      // Save urls
      else if (/https?:/i.test(message)) {
        state.urls.push(message.match(/(https?:.*)( |\b)/i)[1]);
      }
      // Execute javascript
      else if (message[0] == '!') {
        try {
          var context = {};
          if (from == master) {
            context = {
              irc: irc,
              reload: reload
            }
          }
          irc.privmsg(to, util.inspect(vm.runInNewContext(message.substr(1), context)));
        }
        catch (e) {
          irc.privmsg(to, 'Error: ' + e.message);
        }
      }
    }
  });
}
