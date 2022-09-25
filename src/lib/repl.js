'use strict';
const repl = require('repl');
const Stream = require('stream');
var os = require('os');
var path = require('path');
var historyFile = path.join(process.cwd(), '.tmp', '.repl_history');
const defaultWelcome = `WebResto REPL server`;
const defaultPrompt = '> ';
module.exports = function ({ prompt = defaultPrompt, welcome = defaultWelcome, terminal = false, useColors = true, useGlobal = false, ignoreUndefined = true, } = {}) {
    return function replOverHTTP(req, res) {
        res.write(`${welcome}\n\n`);
        let input = req;
        // res is not writable. https://github.com/nodejs/node/issues/20946#issuecomment-391991085
        let output = new Stream.Writable({
            write: (data, encoding, done) => {
                res.write(data, encoding, done);
            }
        });
        const replServer = repl.start({
            prompt,
            input,
            output,
            terminal,
            useColors,
            useGlobal,
            ignoreUndefined
        });
        replOverHTTP.repl = replServer;
        require('repl.history')(replOverHTTP.repl, historyFile);
        // replServer.setupHistory(historyFile, (err, repl) => {
        //   console.log("1111");
        // })
        replServer.defineCommand('whoami', {
            help: 'Display client info',
            action: function () {
                const address = `${req.socket.remoteAddress}:${req.socket.remotePort}`;
                const whoami = {
                    address,
                    headers: req.headers
                };
                res.write(`${JSON.stringify(whoami, null, 2)}\n`);
                this.displayPrompt();
            }
        });
        replServer.defineCommand('info', {
            help: 'show information about object',
            action(c) {
                this.clearBufferedCommand();
                let x = eval(`${c}`);
                let methods = getMethods(x);
                res.write(`${methods}\n\n`);
                // console.log(r);
                this.displayPrompt();
            }
        });
        replServer.defineCommand('log', {
            help: 'Display server logs [experimental]',
            action: function (level) {
                if (level)
                    sails.config.log.level = level;
                res.write(`Level: ${sails.config.log.level}\n`);
                process.stdout.wr = process.stdout.write;
                process.stdout.er = process.stderr.write;
                process.stdout.write = function (mes, c) {
                    res.write(`${mes}\n`);
                    process.stdout.wr(mes, c);
                };
                process.stderr.write = function (mes, c) {
                    res.write(`${mes}\n`);
                    process.stdout.er(mes, c);
                };
                replServer.on('exit', () => {
                    process.stdout.write = process.stdout.wr;
                    process.stderr.write = process.stdout.er;
                });
            }
        });
        replServer.on('exit', () => {
            res.end();
        });
    };
};
const getMethods = (obj) => {
    let properties = new Set();
    let currentObj = obj;
    do {
        Object.getOwnPropertyNames(currentObj).map(item => properties.add(item));
    } while ((currentObj = Object.getPrototypeOf(currentObj)));
    return [...properties.keys()].filter(item => typeof obj[item] === 'function');
};
