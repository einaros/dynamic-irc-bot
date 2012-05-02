var http = require('http');
var ev = require('events');
var qs = require('querystring');

Object.defineProperty(Object.prototype, "extend", {
    enumerable: false,
    value: function(from) {
        var props = Object.getOwnPropertyNames(from);
        var dest = this;
        props.forEach(function(name) {
            var destination = Object.getOwnPropertyDescriptor(from, name);
            Object.defineProperty(dest, name, destination);
        });
        return this;
    }
});

var Cleverbot = function(botname) {
    /**
     * contains the instance of the client
     * @var OmegleClient    instance of the client
     */
    var self = this;

    /**
     * contains the checksum algorithms used by cleverbot to legitimate requests
     * @var object  crypto instance
     */
    var crypto = require('./cleverbot.crypto.js');

    /**
     * contains the http client used by this cleverbot instance
     * @var HttpClient  the http client used
     */
    var httpclient = http.createClient(80, 'cleverbot.com');

    /**
     * the headers to be sent with the ask request
     * @var object  object with header properties
     */
    var headers = {
        'User-Agent' : 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/534.30 (KHTML, like Gecko) Chrome/12.0.742.112 Safari/534.30',
        'Content-Type' : 'application/x-www-form-urlencoded',
        'Host' : 'cleverbot.com',
        'Cache-Control' : 'no-cache',
    };

    /**
     * bot name
     * @var string  the name of the bot
     */
    var botname = botname || "Michelle";

    /**
     * contains up to six messages used by cleverbot to reflect the chat history
     * @var array   chat messages, oldest to newest
     */
    var msglog = [];

    /**
     * contains the current cleverbot session
     * @var string  session id
     */
    var sessionid = null;

    /**
     * whether there is a pending request to cleverbot or not.
     * @var boolean pending
     */
  var pending = false;
    this.pending = function() { return pending; };

    /**
     * contains the current http request
     * @var HttpRequest the pending http request
     */
    var askrequest = null;

    /**
     * aborts the current http request to cleverbot
     * @return void
     */
    this.reset = function() {
        msglog = [];
        sessionid = null;
        if (this.pending()) {
            askrequest.abort();
            pending = false;
        }
    }

    /**
     * modifies the chat history by appending the message
     * DISABLED: does not seem to be working with empty msgs
     * @param   msg the message to be added
     * @return void
     */
    this.addtohistory = function(msg){ },

    /**
     * sends a message to be answered to cleverbot
     * @param   msg the message to be answered
     * @emit    answer(answer, sentiment) the answer for the message
     */
    this.ask = function(msg, cb) {
        var query = {
            stimulus : msg ? msg : '{pass}',
            start: 'y',
            sessionid: sessionid || '',
            icognoid: 'wsf',
            icognocheck: '',
            fno: '',
            prevref: '',
            emotionaloutput: '',
            emotionalhistory: '',
            asbotname: botname,
            ttsvoice: '',
            typing: '',
            lineref: '',
            sub: msg ? 'Say' : 'Pass',
            islearning: 1,
            cleanslate: false,
        };

        // add the message history to the request body
        msglog = msglog.slice(-7);
        reversedmsglog = msglog.slice(0, msglog.length).reverse();
        for (var i in reversedmsglog) {
            var num = parseInt(i)+2;
            query['vText'+num] = reversedmsglog[i];
        }

        // calculate the checksum
        query.icognocheck = crypto.checksum('stimulus=' + qs.escape(query.stimulus)
            + '&start=y&sessionid=' + query.sessionid);
        query = qs.stringify(query);

        // send the http request
        askrequest = httpclient.request('POST', '/webservicemin', headers.extend({
            'Content-Length' : query.length,
        }));
        askrequest.end(query);
        pending = true;
        askrequest.on('response', function (response) {
            var payload = '';
            response.setEncoding('utf8');

            response.on('data', function (chunk) {
                payload += chunk;
            });

            response.on('end', function() {
                if (payload.replace(/^\s*([\S\s]*)\b\s*$/, '$1') == "DENIED")
                    throw new Exception("request failed.");

                var reply = payload.split("\r");
                sessionid = sessionid || reply[1];

                var sentiment = reply[0].match(/\{(e|r),(\w+),(\d\.\d)\}/g);
                var answer = reply[0].replace(/^\{.+\}/, '');

                msglog.push(msg);
                msglog.push(answer);
                pending = false;
                cb(answer, sentiment);
            });
        });
    }
};

Cleverbot.prototype = new ev.EventEmitter();
module.exports = new Cleverbot();
module.exports.emit('ready');
