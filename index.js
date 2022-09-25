"use strict";
module.exports = function (sails) {

  let initializeRepl = require("./src/initialize");

  return {
    defaults: require("./defaults"),
    initialize: function initialize(cb) {
      initializeRepl.default(sails, cb);
    },
  };
};
