#!/usr/bin/env node
function _toConsumableArray(r) { return _arrayWithoutHoles(r) || _iterableToArray(r) || _unsupportedIterableToArray(r) || _nonIterableSpread(); }
function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _iterableToArray(r) { if ("undefined" != typeof Symbol && null != r[Symbol.iterator] || null != r["@@iterator"]) return Array.from(r); }
function _arrayWithoutHoles(r) { if (Array.isArray(r)) return _arrayLikeToArray(r); }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
var fs = require('fs');
var glob = require('glob');
var path = require('path');

/*
 * See the Makefile for how the required hash file is downloaded from Transifex.
 */

/*
 * Expected input: a directory, possibly containing subdirectories, with .json files.  Each .json
 * file is an array of translation triplets (id, description, defaultMessage).
 *
 *
 */
function gatherJson(dir) {
  var ret = [];
  var files = glob.sync("".concat(dir, "/**/*.json"));
  files.forEach(function (filename) {
    var messages = JSON.parse(fs.readFileSync(filename));
    ret.push.apply(ret, _toConsumableArray(messages));
  });
  return ret;
}

// the hash file returns ids whose periods are "escaped" (sort of), like this:
// "key": "profile\\.sociallinks\\.social\\.links"
// so our regular messageIds won't match them out of the box
function escapeDots(messageId) {
  return messageId.replace(/\./g, '\\.');
}
var jsonDir = process.argv[2];
var messageObjects = gatherJson(jsonDir);
if (messageObjects.length === 0) {
  process.exitCode = 1;
  throw new Error('Found no messages');
}
if (process.argv[3] === '--comments') {
  // prepare to handle the translator notes
  var loggingPrefix = path.basename("".concat(__filename)); // the name of this JS file
  var bashScriptsPath = process.argv[4] && process.argv[4] === '--v3-scripts-path' ? './node_modules/@edx/reactifex/bash_scripts' : './node_modules/reactifex/bash_scripts';
  var hashFile = "".concat(bashScriptsPath, "/hashmap.json");
  process.stdout.write("".concat(loggingPrefix, ": reading hash file ").concat(hashFile, "\n"));
  var messageInfo = JSON.parse(fs.readFileSync(hashFile));
  var outputFile = "".concat(bashScriptsPath, "/hashed_data.txt");
  process.stdout.write("".concat(loggingPrefix, ": writing to output file ").concat(outputFile, "\n"));
  fs.writeFileSync(outputFile, '');
  messageObjects.forEach(function (message) {
    var transifexFormatId = escapeDots(message.id);
    var info = messageInfo.find(function (mi) {
      return mi.key === transifexFormatId;
    });
    if (info) {
      fs.appendFileSync(outputFile, "".concat(info.string_hash, "|").concat(message.description, "\n"));
    } else {
      process.stdout.write("".concat(loggingPrefix, ": string ").concat(message.id, " does not yet exist on transifex!\n"));
    }
  });
} else {
  var output = {};
  messageObjects.forEach(function (message) {
    output[message.id] = message.defaultMessage;
  });
  fs.writeFileSync(process.argv[3], JSON.stringify(output, null, 2));
}
//# sourceMappingURL=transifex-utils.js.map