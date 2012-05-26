var cleverbot = require('./cleverbot')
  , vm = require('vm')
  , util = require('util')
  , express = require('express')
  , fs = require('fs')
  , request = require('request')
  , redis = require('redis')
  , client = redis.createClient();

var config = {
  // this is the default config .. it will be completely overwritten if a config.json file is found
  masters: ['einaros'], 
  masterChan: '#bitraf2',
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
  /*
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
  */

  // Restart web server
  if (state.web) {
    try { state.web.close(); }
    catch (e) { console.error(e); }
    state.web = null;
  }
  state.web = express.createServer();
  state.web.listen(4001);
  state.web.get('/', function(req, res) {
    res.writeHead(200);
    fs.readdir(__dirname + '/logs', function(error, data) {
      for (var i = 0; i < data.length; ++i) {
        if (data[i][0] == '#') {
          var channelUrl = data[i].replace(/#/g, '%23');
          var channelName = data[i];
          res.write('<a href="/' + channelUrl  + '">' + channelName + '</a><br/>');
        }
      }
      res.end();
    });
  });
  state.web.get(/^\/%23/, function(req, res) {
    var url = req.url.substr(1);
    if ((/[^a-z0-9\% .\-_]/i).test(url)) {
      res.send('no way', 400);
      res.end();
    }
    else {
      var filename = url.replace(/%23/g, '#');
      fs.readFile(__dirname + '/logs/' + filename, function(error, data) {
        if (error) res.send('not found', 404);
        else {
          //res.send(data, {'Content-Type': 'text/plain; charset=utf-8'}, 200);
          var lines = data.toString().split(/\n/g);
          lines = lines
            .filter(function(line) { return line.length > 2; })
            .map(function(line) {
              var pieces = line.split(/ /, 3);
              if (pieces.length < 3) return;
              return { 
                who: pieces[2].replace(/[<>]/g, ''),
                date: pieces[0],
                time: pieces[1],
                text: line.substr(line.indexOf('>') + 2)
              }
            });
          res.render('log.jade', {
            title: filename, 
            lines: lines
          });
        }
        res.end();
      });
    }
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
      var timestamp = now.getDate() + '/' + now.getMonth() + '/' + now.getFullYear() + ' ' + now.toTimeString().substr(0, 8);
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
