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
        // debug local in repl
        local.global.local = local;
    }());



    // run shared js-env code - function
    (function () {
        local.ajax = function (options, onError) {
        /*
         * this function will send an ajax-request with error-handling
         */
            var xhr, tmp;
            // init xhr
            xhr = local._debugXhr = new XMLHttpRequest();
            // init options
            local.objectSetOverride(xhr, options);
            // init headers
            xhr.headers = {};
            Object.keys(options.headers || {}).forEach(function (key) {
                xhr.headers[key.toLowerCase()] = options.headers[key];
            });
            // init method
            xhr.method = xhr.method || 'GET';
            // init event handling
            xhr.onEvent = function (event) {
                // init statusCode
                xhr.statusCode = xhr.status;
                switch (event.type) {
                case 'abort':
                case 'error':
                case 'load':
                    // do not run more than once
                    if (xhr.done) {
                        return;
                    }
                    xhr.done = true;
                    // handle abort or error event
                    if (!xhr.error &&
                            (event.type === 'abort' ||
                            event.type === 'error' ||
                            xhr.statusCode >= 400)) {
                        xhr.error = new Error(event.type);
                    }
                    onError(xhr.error, xhr);
                    // debug
                    try {
                        try {
                            tmp = xhr.responseText || '';
                            tmp = JSON.stringify(JSON.parse(tmp), null, 4);
                        } catch (ignore) {
                        }
                        document.querySelector('#outputTextarea3').value = tmp;
                    } catch (ignore) {
                    }
                    break;
                }
            };
            xhr.addEventListener('abort', xhr.onEvent);
            xhr.addEventListener('error', xhr.onEvent);
            xhr.addEventListener('load', xhr.onEvent);
            // open url
            xhr.open(xhr.method, xhr.url);
            // set request-headers
            Object.keys(xhr.headers).forEach(function (key) {
                xhr.setRequestHeader(key, xhr.headers[key]);
            });
            // send data
            xhr.send(xhr.data);
            // debug
            document.querySelector('#outputTextarea2').value = xhr.method + ' ' + xhr.url +
                '\n\n' + (xhr.data || '');
            return xhr;
        };

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

        local.isNullOrUndefined = function (arg) {
        /*
         * this function will test if the arg is null or undefined
         */
            return arg === null || arg === undefined;
        };

        local.jsonCopy = function (arg) {
        /*
         * this function will return a deep-copy of the JSON-arg
         */
            return arg === undefined
                ? undefined
                : JSON.parse(JSON.stringify(arg));
        };

        local.jsonStringifyOrdered = function (element, replacer, space) {
        /*
         * this function will JSON.stringify the element,
         * with object-keys sorted and circular-references removed
         */
            var circularList, stringify, tmp;
            stringify = function (element) {
            /*
             * this function will recursively JSON.stringify the element,
             * with object-keys sorted and circular-references removed
             */
                // if element is an object, then recurse its items with object-keys sorted
                if (element &&
                        typeof element === 'object' &&
                        typeof element.toJSON !== 'function') {
                    // ignore circular-reference
                    if (circularList.indexOf(element) >= 0) {
                        return;
                    }
                    circularList.push(element);
                    // if element is an array, then recurse its elements
                    if (Array.isArray(element)) {
                        return '[' + element.map(function (element) {
                            tmp = stringify(element);
                            return typeof tmp === 'string'
                                ? tmp
                                : 'null';
                        }).join(',') + ']';
                    }
                    return '{' + Object.keys(element)
                        // sort object-keys
                        .sort()
                        .map(function (key) {
                            tmp = stringify(element[key]);
                            return typeof tmp === 'string'
                                ? JSON.stringify(key) + ':' + tmp
                                : undefined;
                        })
                        .filter(function (element) {
                            return typeof element === 'string';
                        })
                        .join(',') + '}';
                }
                // else JSON.stringify as normal
                return JSON.stringify(element);
            };
            circularList = [];
            return JSON.stringify(element && typeof element === 'object'
                ? JSON.parse(stringify(element))
                : element, replacer, space);
        };

        local.nop = function () {
        /*
         * this function will do nothing
         */
            return;
        };

        local.objectSetDefault = function (arg, defaults, depth) {
        /*
         * this function will recursively set defaults for undefined-items in the arg
         */
            arg = arg || {};
            defaults = defaults || {};
            Object.keys(defaults).forEach(function (key) {
                var arg2, defaults2;
                arg2 = arg[key];
                defaults2 = defaults[key];
                if (defaults2 === undefined) {
                    return;
                }
                // init arg[key] to default value defaults[key]
                if (!arg2) {
                    arg[key] = defaults2;
                    return;
                }
                // if arg2 and defaults2 are both non-null and non-array objects,
                // then recurse with arg2 and defaults2
                if (depth > 1 &&
                        // arg2 is a non-null and non-array object
                        arg2 &&
                        typeof arg2 === 'object' &&
                        !Array.isArray(arg2) &&
                        // defaults2 is a non-null and non-array object
                        defaults2 &&
                        typeof defaults2 === 'object' &&
                        !Array.isArray(defaults2)) {
                    local.objectSetDefault(arg2, defaults2, depth - 1);
                }
            });
            return arg;
        };

        local.objectSetOverride = function (arg, overrides, depth) {
        /*
         * this function will recursively set overrides for items the arg
         */
            arg = arg || {};
            overrides = overrides || {};
            Object.keys(overrides).forEach(function (key) {
                var arg2, overrides2;
                arg2 = arg[key];
                overrides2 = overrides[key];
                if (overrides2 === undefined) {
                    return;
                }
                // if both arg2 and overrides2 are non-null and non-array objects,
                // then recurse with arg2 and overrides2
                if (depth > 1 &&
                        // arg2 is a non-null and non-array object
                        (arg2 &&
                        typeof arg2 === 'object' &&
                        !Array.isArray(arg2)) &&
                        // overrides2 is a non-null and non-array object
                        (overrides2 &&
                        typeof overrides2 === 'object' &&
                        !Array.isArray(overrides2))) {
                    local.objectSetOverride(arg2, overrides2, depth - 1);
                    return;
                }
                // else set arg[key] with overrides[key]
                arg[key] = arg === local.envDict
                    // if arg is envDict, then overrides falsey value with empty string
                    ? overrides2 || ''
                    : overrides2;
            });
            return arg;
        };

        local.onErrorDefault = function (error) {
        /*
         * this function will print error.stack or error.message to stderr
         */
            // if error is defined, then print error.stack
            if (error && !local.global.__coverage__) {
                console.error('\nonErrorDefault - error\n' +
                    error.message + '\n' + error.stack + '\n');
            }
        };

        local.onNext = function (options, onError) {
        /*
         * this function will wrap onError inside the recursive function options.onNext,
         * and append the current stack to any error
         */
            options.onNext = function (error, data, meta) {
                try {
                    options.modeNext = error
                        ? Infinity
                        : options.modeNext + 1;
                    onError(error, data, meta);
                } catch (errorCaught) {
                    // throw errorCaught to break infinite recursion-loop
                    if (options.errorCaught) {
                        throw options.errorCaught;
                    }
                    options.errorCaught = errorCaught;
                    options.onNext(errorCaught, data, meta);
                }
            };
            return options;
        };

        local.onParallel = function (onError, onDebug) {
        /*
         * this function will return a function that will
         * 1. run async tasks in parallel
         * 2. if counter === 0 or error occurred, then call onError with error
         */
            var self;
            onDebug = onDebug || local.nop;
            self = function (error) {
                onDebug(error, self);
                // if previously counter === 0 or error occurred, then return
                if (self.counter === 0 || self.error) {
                    return;
                }
                // handle error
                if (error) {
                    self.error = error;
                    // ensure counter will decrement to 0
                    self.counter = 1;
                }
                // decrement counter
                self.counter -= 1;
                // if counter === 0, then call onError with error
                if (self.counter === 0) {
                    onError(error);
                }
            };
            // init counter
            self.counter = 0;
            // return callback
            return self;
        };
    }());



    // run shared js-env code - post-init
    (function () {
        return;
    }());
    switch (local.modeJs) {



    // run browser js-env code - post-init
    case 'browser':
        ['error', 'log'].forEach(function (key) {
            console['_' + key] = console[key];
            console[key] = function () {
                console['_' + key].apply(console, arguments);
                document.querySelector('#outputTextarea1').value +=
                    Array.prototype.slice.call(arguments).map(function (arg) {
                        return typeof arg === 'string'
                            ? arg
                            : local.jsonStringifyOrdered(arg, null, 4);
                    }).join(' ') + '\n';
            };
        });

        local.testRun = function (event) {
            var reader, tmp;
            switch (event && event.currentTarget.id) {
            case 'apiOrderListButton1':
                local.ajax({ url: 'apiOrderList' }, local.nop);
                break;
            case 'apiOrderListCachedButton1':
                local.ajax({ url: 'apiOrderListCached' }, local.nop);
                break;
            case 'apiOrderListDriverButton1':
                local.ajax({
                    data: JSON.stringify({
                        driverId:
                            document.querySelector('#apiOrderListDriverDriverIdInput1').value
                    }),
                    method: 'POST',
                    url: 'apiOrderListDriver'
                }, local.nop);
                break;
            case 'apiOrderAcceptButton1':
                local.ajax({
                    data: JSON.stringify({
                        driverId:
                            document.querySelector('#apiOrderAcceptDriverIdInput1').value,
                        orderId:
                            document.querySelector('#apiOrderAcceptOrderIdInput1').value
                    }),
                    method: 'POST',
                    url: 'apiOrderAccept'
                }, local.nop);
                break;
            case 'dbExportButton1':
                document.querySelector('#dbExportA1').click();
                break;
            case 'dbImportButton1':
                document.querySelector('#dbImportInput1').click();
                break;
            case 'dbImportInput1':
                document.querySelector('#outputTextarea1').value = '';
                console.log('importing db-database ...');
                reader = new window.FileReader();
                tmp = document.querySelector('#dbImportInput1').files[0];
                if (!tmp) {
                    return;
                }
                reader.addEventListener('load', function () {
                    local.ajax({
                        data: reader.result,
                        method: 'POST',
                        url: '/dbImport'
                    }, function (error, xhr) {
                        // validate no error occurred
                        local.assert(!error, error);
                        console.log('... imported db-database');
                        console.log(xhr.responseText);
                    });
                });
                reader.readAsText(tmp);
                break;
            case 'dbResetButton1':
                document.querySelector('#outputTextarea1').value = '';
                console.log('resetting db-database ...');
                local.ajax({ url: '/dbReset' }, function (error) {
                    // validate no error occurred
                    local.assert(!error, error);
                    console.log('... resetted db-database');
                });
                break;
            }
        };
        // init event-handling
        ['change', 'click'].forEach(function (event) {
            Array.prototype.slice.call(
                document.querySelectorAll('.on' + event)
            ).forEach(function (element) {
                element.addEventListener(event, local.testRun);
            });
        });
        break;



    // run node js-env code - post-init
    case 'node':
        // require modules
        local.fs = require('fs');
        local.http = require('http');
        local.path = require('path');
        local.repl = require('repl');
        local.url = require('url');
        try {
            local.utility2 = require('utility2');
        } catch (errorCaught) {
            local.utility2 = local;
            local.utility2.envDict = process.env;
        }

        // start repl-server
        if (!local.global.utility2_replServer1) {
            local.repl.start({ useGlobal: true });
        }

        // init exports
        module.exports.__dirname = __dirname;

        // init assets
        local['/index.css'] = local.fs.readFileSync('./index.css', 'utf8');
        local['/index.html'] = local.fs.readFileSync('./index.html', 'utf8');
        local['/index.js'] = local.fs.readFileSync('./index.js', 'utf8');

        // create server
        local.server1 = local.http.createServer(function (request, response) {
            // debug request
            local._debugRequest = request;
            request.chunkList = [];
            request.on('data', function (chunk) {
                request.chunkList.push(chunk);
            });
            request.on('end', function () {
                request.dataText = Buffer.concat(request.chunkList).toString();
                request.dataJson = {};
                try {
                    request.dataJson = JSON.parse(request.dataText);
                } catch (ignore) {
                }
                try {
                    request.urlParsed = local.url.parse(request.url, true);
                    switch (request.urlParsed.pathname) {
                    case '/':
                        response.end(local['/index.html']);
                        break;
                    // respond with db order list
                    case '/apiOrderList':
                        local.dbTableOrder.crudFindMany({
                            query: { accepted: { $ne: true } }
                        }, function (error, dbRowList) {
                            // validate no error occurred
                            local.assert(!error, error);
                            response.end(JSON.stringify(dbRowList));
                        });
                        break;
                    // respond with cached order list
                    case '/apiOrderListCached':
                        response.end(JSON.stringify(local.apiOrderListCached));
                        break;
                    // respond with order list accepted by driver
                    case '/apiOrderListDriver':
                        local.dbTableOrder.crudFindMany({
                            query: { accepted: true, driverId: request.dataJson.driverId }
                        }, function (error, dbRowList) {
                            // validate no error occurred
                            local.assert(!error, error);
                            response.end(JSON.stringify(dbRowList));
                        });
                        break;
                    // accept order
                    case '/apiOrderAccept':
                        local.dbTableOrder.crudUpdate({
                            orderId: request.dataJson.orderId
                        }, {
                            $set: { accepted: true, driverId: request.dataJson.driverId }
                        }, {}, function (error, dbRowList) {
                            // validate no error occurred
                            local.assert(!error, error);
                            response.end(JSON.stringify(dbRowList));
                        });
                        break;
                    case '/dbExport':
                        response.end(local.db.dbExport());
                        break;
                    case '/dbImport':
                        local.db.dbImport(request.dataText);
                        response.end(request.dataText);
                        break;
                    case '/dbReset':
                        local.dbReset();
                        response.end();
                        break;
                    case '/favicon.ico':
                        response.end();
                        break;
                    case '/index.css':
                    case '/index.html':
                    case '/index.js':
                        switch (local.path.extname(request.urlParsed.pathname)) {
                        case '.css':
                            response.setHeader('Content-Type', 'text/css; charset=UTF-8');
                            break;
                        }
                        response.end(local[request.urlParsed.pathname]);
                        break;
                    default:
                        response.statusCode = 404;
                        response.end();
                    }
                } catch (errorCaught) {
                    response.statusCode = 500;
                    response.end();
                }
            });
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

        local.dbReset = function () {
        /*
         * this function will reset the db
         */
            local.db.dbClear(local.onErrorDefault);
            local.dbTableOrder = local.db.dbTableCreate({ imported: true, name: 'Order' });
            local.dbTableOrder.crudInsertMany([{
                customerId: 'customer1',
                orderId: 'order1'
            }, {
                customerId: 'customer2',
                orderId: 'order2'
            }, {
                customerId: 'customer3',
                orderId: 'order3'
            }, {
                customerId: 'customer4',
                orderId: 'order4'
            }], local.nop);
        };
        // reset db
        local.dbReset();

        // update cachedOrders every 10 seconds
        local.dbTableOrder.crudFindMany({
            query: { accepted: { $ne: true } }
        }, function (error, dbRowList) {
            // validate no error occurred
            local.assert(!error, error);
            local.apiOrderListCached = dbRowList;
        });
        setInterval(function () {
            local.dbTableOrder.crudFindMany({
                query: { accepted: { $ne: true } }
            }, function (error, dbRowList) {
                // validate no error occurred
                local.assert(!error, error);
                local.apiOrderListCached = dbRowList;
            });
        }, 10000);
        break;
    }
}());
