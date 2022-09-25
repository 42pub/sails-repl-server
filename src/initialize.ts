import * as sails from "typed-sails";

const crypto = require("crypto");
import * as replOverHttp from "./lib/repl"

export default async function (sails: sails.default.Sails, cb) {

  sails.on('lifted', async function (){ 

    
    
    const middleware = replOverHttp()
    let replPath = '/repl'
    if (process.env.NODE_ENV === 'production') {
      let secret = process.env.REPL_SECRET ? process.env.REPL_SECRET : crypto.randomBytes(16).toString("hex");
      replPath = `/repl-${secret}`
    } 

    sails.hooks.http.app.use(replPath,middleware);
    let layer = sails.hooks.http.app._router.stack.slice(-1)[0]
    sails.hooks.http.app._router.stack.splice(1, 0, layer)
    
  });
  cb();
}