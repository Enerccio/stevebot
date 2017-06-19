'use strict';

var fs = require("fs");

module.exports = JSON.parse(fs.readFileSync("conf.json"));
