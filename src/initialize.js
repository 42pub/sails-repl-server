"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const crypto = require("crypto");
const replOverHttp = require("./lib/repl");
function default_1(sails, cb) {
    return __awaiter(this, void 0, void 0, function* () {
        sails.on('lifted', function () {
            return __awaiter(this, void 0, void 0, function* () {
                const middleware = replOverHttp();
                let replPath = '/repl';
                if (process.env.NODE_ENV === 'production') {
                    let secret = process.env.REPL_SECRET ? process.env.REPL_SECRET : crypto.randomBytes(16).toString("hex");
                    replPath = `/repl-${secret}`;
                }
                sails.log.warn("repl command:", `curl -sSNT.  http://127.0.0.1${sails.config.port}:${replPath}`);
                sails.hooks.http.app.use(replPath, middleware);
                let layer = sails.hooks.http.app._router.stack.slice(-1)[0];
                sails.hooks.http.app._router.stack.splice(1, 0, layer);
            });
        });
        cb();
    });
}
exports.default = default_1;
