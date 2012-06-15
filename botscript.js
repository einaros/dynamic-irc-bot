var cleverbot = require('./cleverbot')
  , vm = require('vm')
  , util = require('util')
  , express = require('express')
  , fs = require('fs')
  , request = require('request')
  , client = redis.createClient();

var config = {
  // this is the default config .. it will be completely overwritten if a config.json file is found
  masters: ['einaros'], 
  masterChan: '#dynobot',
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

  // Re-add IRC bindings
  irc.removeAllListeners();
  var logFiles = {};
  irc.on('privmsg', function(from, to, message) {
    if (to[0] == '#') { // Message to a channel
      // Log
      if (typeof logFiles[to] == 'undefined') {
        logFiles[to] = { 
          stream: fs.createWriteStream(__dirname + '/logs/' + to, { flags: 'a', encoding: 'utf8', mode: 0666 }),
        };
      }
      var now = new Date();
      var timestamp = now.getDate() + '/' + (now.getMonth()+1) + '/' + now.getFullYear() + ' ' + now.toTimeString().substr(0, 8);
      logFiles[to].stream.write(timestamp + ' <' + from + '> ' + message + '\n');
      
      // Weather stuff
      var weatherDescr = {1:"Skyfritt", 2:"Lettskyet", 3:"Halvskyet", 4:"Skyet", 5:"Halvskyet og regnbyger", 6:"Halvskyet og regnbyger med tordenvær", 7:"Halvskyet og sluddbyger", 8:"Halvskyet og snøbyger", 9:"Lett regn", 10:"Regn", 11:"Regn med tordenvær", 12:"Sludd", 13:"Snø", 14:"Snø med tordenvær", 15:"Tåke", 16:"Skyfritt, mørketid", 17:"Halvskyet, mørketid", 18:"Regnbyger, mørketid", 19:"Snøbyger, mørketid"};
      if(/^vær(et)?\??$/.test(message)) {
        request('http://www.vg.no/content/ajaxWeather.php?do=getLocation&id=30360', function(error, resp, body) { 
          var info = JSON.parse(body);
          irc.privmsg(to, weatherDescr[info.symbol] + ', ' + info.temperature + ' grader.'); 
        }); 
      }

      // Use cleverbot for talk
      if (message.indexOf(irc.whoami() + ':') == 0) {
        cleverbot.ask(message.substr((irc.whoami() + ':').length), function(text) {
          irc.privmsg(to, from + ': ' + text);
        });
        return;
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
