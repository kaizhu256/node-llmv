#!/usr/bin/env node
/* istanbul instrument in package all */
/* istanbul instrument in package llmv */
/*jslint
    bitwise: true,
    browser: true,
    maxerr: 8,
    maxlen: 96,
    node: true,
    nomen: true,
    regexp: true,
    stupid: true
*/
(function () {
    'use strict';
    var local;



    // run shared js-env code - pre-init
    (function () {
        // init local
        local = {};
        // init modeJs
        local.modeJs = (function () {
            try {
                return typeof navigator.userAgent === 'string' &&
                    typeof document.querySelector('body') === 'object' &&
                    typeof XMLHttpRequest.prototype.open === 'function' &&
                    'browser';
            } catch (errorCaughtBrowser) {
                return module.exports &&
                    typeof process.versions.node === 'string' &&
                    typeof require('http').createServer === 'function' &&
                    'node';
            }
        }());
        // init global
        local.global = local.modeJs === 'browser'
            ? window
            : global;
        // init lib db
        local.db = local.modeJs === 'browser'
            ? local.global.db_lite
            : require('./lib.db.js');
    }());



    // run shared js-env code - function
    (function () {
        local.assert = function (passed, message) {
        /*
         * this function will throw the error message if passed is falsey
         */
            var error;
            if (passed) {
                return;
            }
            error = message && message.message
                // if message is an error-object, then leave it as is
                ? message
                : new Error(typeof message === 'string'
                    // if message is a string, then leave it as is
                    ? message
                    // else JSON.stringify message
                    : JSON.stringify(message));
            throw error;
        };
    }());



    // run shared js-env code - post-init
    (function () {
        return;
    }());
    switch (local.modeJs) {



    // run browser js-env code - post-init
    case 'browser':
        break;



    // run node js-env code - post-init
    case 'node':
        // require modules
        local.fs = require('fs');
        local.http = require('http');
        local.path = require('path');
        local.repl = require('repl');
        local.url = require('url');

        // start repl-server
        if (!local.global.utility2_replServer1) {
            local.repl.start({ useGlobal: true });
        }

        // init exports
        module.exports.__dirname = __dirname;

        // debug local in repl
        local.global.local = local;

        // init assets
        local['/index.css'] = local.fs.readFileSync('./index.css', 'utf8');
        local['/index.html'] = local.fs.readFileSync('./index.html', 'utf8');
        local['/index.js'] = local.fs.readFileSync('./index.js', 'utf8');

        // create server
        local.server1 = local.http.createServer(function (request, response) {
            request.urlParsed = local.url.parse(request.url, true);
            switch (request.urlParsed.pathname) {
            case '/':
                response.end(local['/index.html']);
                break;
            case '/favicon.ico':
                response.end();
                break;
            case '/index.css':
            case '/index.html':
            case '/index.js':
                response.end(local[request.urlParsed.pathname]);
                break;
            default:
                response.statusCode = 404;
                response.end();
            }
        });
        local.server1.on('error', function (error) {
            if (error.code === 'EADDRINUSE' && !local.EADDRINUSE) {
                local.EADDRINUSE = error;
                local.PORT = Number(local.PORT) + 1;
                local.server1.listen(local.PORT, function () {
                    console.log('server listening on port ' + local.PORT);
                });
                return;
            }
            throw error;
        });
        // listen server
        local.PORT = process.env.PORT || 8081;
        local.server1.listen(local.PORT, function () {
            console.log('server listening on port ' + local.PORT);
        });
        break;
    }
}());
