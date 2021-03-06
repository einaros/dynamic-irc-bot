var IRC = require('node-irc/IRC').IRC
  , irc = new IRC('irc.freenode.net', 6667)
  , repl = require('repl')
  , path = require('path');

irc.setDebugLevel(1);
irc.connect('washbucket', 'I am a teapot', 'foo');

var state = {};
function reload() {
  var script = './botscript.js';
  delete require.cache[path.resolve(script)];
  try { 
    require(script)(irc, state, reload); 
    return null;
  }
  catch (e) { 
    console.error(e.message, e.stack); 
    return e;
  }
}
reload();

var cons = repl.start('irc> ');
cons.context.irc = irc;
cons.context.reload = reload;
