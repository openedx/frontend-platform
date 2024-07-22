#!/usr/bin/env node
function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }
function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter); }
function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }
function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }
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