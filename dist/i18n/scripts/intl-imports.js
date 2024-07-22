#!/usr/bin/env node
var scriptHelpDocument = "\nNAME\n  intl-imports.js \u2014 Script to generate the src/i18n/index.js file that exports messages from all the languages for Micro-frontends.\n\nSYNOPSIS\n  intl-imports.js [DIRECTORY ...]\n\nDESCRIPTION\n  This script is intended to run after 'atlas' has pulled the files.\n  \n  This expects to run inside a Micro-frontend root directory with the following structure:\n  \n    frontend-app-learning $ tree src/i18n/\n    src/i18n/\n    \u251C\u2500\u2500 index.js\n    \u2514\u2500\u2500 messages\n        \u251C\u2500\u2500 frontend-app-example\n        \u2502   \u251C\u2500\u2500 ar.json\n        \u2502   \u251C\u2500\u2500 es_419.json\n        \u2502   \u2514\u2500\u2500 zh_CN.json\n        \u251C\u2500\u2500 frontend-component-footer\n        \u2502   \u251C\u2500\u2500 ar.json\n        \u2502   \u251C\u2500\u2500 es_419.json\n        \u2502   \u2514\u2500\u2500 zh_CN.json\n        \u2514\u2500\u2500 frontend-component-header (empty directory)\n  \n  \n  \n  With the structure above it's expected to run with the following command in Makefile:\n  \n    \n    $ node_modules/.bin/intl-imports.js frontend-component-footer frontend-component-header frontend-app-example\n  \n  \n  It will generate two type of files:\n  \n   - Main src/i18n/index.js which overrides the Micro-frontend provided with a sample output of:\n      \n      \"\"\"\n      import messagesFromFrontendComponentFooter from './messages/frontend-component-footer';\n      // Skipped import due to missing './messages/frontend-component-footer/index.js' likely due to empty translations.\n      import messagesFromFrontendAppExample from './messages/frontend-app-example';\n   \n      export default [\n        messagesFromFrontendComponentFooter,\n        messagesFromFrontendAppExample,\n      ];\n      \"\"\"\n  \n   - Each sub-directory has src/i18n/messages/frontend-component-header/index.js which is imported by the main file.:\n   \n      \"\"\"\n      import messagesOfArLanguage from './ar.json';\n      import messagesOfDeLanguage from './de.json';\n      import messagesOfEs419Language from './es_419.json';\n      export default {\n        'ar': messagesOfArLanguage,\n        'de': messagesOfDeLanguage,\n        'es-419': messagesOfEs419Language,\n      };\n     \"\"\"\n";
var fs = require('fs');
var path = require('path');
var camelCase = require('lodash.camelcase');
var loggingPrefix = path.basename("".concat(__filename)); // the name of this JS file

// Header note for generated src/i18n/index.js file
var filesCodeGeneratorNoticeHeader = "// This file is generated by the openedx/frontend-platform's \"intl-import.js\" script.\n//\n// Refer to the i18n documents in https://docs.openedx.org/en/latest/developers/references/i18n.html to update\n// the file and use the Micro-frontend i18n pattern in new repositories.\n//\n";

/**
 * Create frontend-app-example/index.js file with proper imports.
 *
 * @param directory - a directory name containing .json files from Transifex e.g. "frontend-app-example".
 * @param log - Mockable process.stdout.write
 * @param writeFileSync - Mockable fs.writeFileSync
 * @param i18nDir - Path to `src/i18n` directory
 *
 * @return object - An object containing directory name and whether its "index.js" file was successfully written.
 */
function generateSubdirectoryMessageFile(_ref) {
  var directory = _ref.directory,
    log = _ref.log,
    writeFileSync = _ref.writeFileSync,
    i18nDir = _ref.i18nDir;
  var importLines = [];
  var messagesLines = [];
  var counter = {
    nonEmptyLanguages: 0
  };
  var messagesDir = "".concat(i18nDir, "/messages"); // The directory of Micro-frontend i18n messages

  try {
    var files = fs.readdirSync("".concat(messagesDir, "/").concat(directory), {
      withFileTypes: true
    });
    files.sort(); // Sorting ensures a consistent generated `index.js` order of imports cross-platforms.

    var jsonFiles = files.filter(function (file) {
      return file.isFile() && file.name.endsWith('.json');
    });
    if (!jsonFiles.length) {
      log("".concat(loggingPrefix, ": Not creating '").concat(directory, "/index.js' because no .json translation files were found.\n"));
      return {
        directory: directory,
        isWritten: false
      };
    }
    jsonFiles.forEach(function (file) {
      var filename = file.name;
      // Gets `fr_CA` from `fr_CA.json`
      var languageCode = filename.replace(/\.json$/, '');
      // React-friendly language code fr_CA --> fr-ca
      var reactIntlLanguageCode = languageCode.toLowerCase().replace(/_/g, '-');
      // camelCase variable name
      var messagesCamelCaseVar = camelCase("messages_Of_".concat(languageCode, "_Language"));
      var filePath = "".concat(messagesDir, "/").concat(directory, "/").concat(filename);
      try {
        var entries = JSON.parse(fs.readFileSync(filePath, {
          encoding: 'utf8'
        }));
        if (!Object.keys(entries).length) {
          importLines.push("// Note: Skipped empty '".concat(filename, "' messages file."));
          return; // Skip the language
        }
      } catch (e) {
        importLines.push("// Error: unable to parse '".concat(filename, "' messages file."));
        log("".concat(loggingPrefix, ": NOTICE: Skipping '").concat(directory, "/").concat(filename, "' due to error: ").concat(e, ".\n"));
        return; // Skip the language
      }
      counter.nonEmptyLanguages += 1;
      importLines.push("import ".concat(messagesCamelCaseVar, " from './").concat(filename, "';"));
      messagesLines.splice(1, 0, "  '".concat(reactIntlLanguageCode, "': ").concat(messagesCamelCaseVar, ","));
    });
    if (counter.nonEmptyLanguages) {
      // See the help message above for sample output.
      var messagesFileContent = [filesCodeGeneratorNoticeHeader, importLines.join('\n'), '\nexport default {', messagesLines.join('\n'), '};\n'].join('\n');
      writeFileSync("".concat(messagesDir, "/").concat(directory, "/index.js"), messagesFileContent);
      return {
        directory: directory,
        isWritten: true
      };
    }
    log("".concat(loggingPrefix, ": Skipping '").concat(directory, "' because no languages were found.\n"));
  } catch (e) {
    log("".concat(loggingPrefix, ": NOTICE: Skipping '").concat(directory, "' due to error: ").concat(e, ".\n"));
  }
  return {
    directory: directory,
    isWritten: false
  };
}

/**
 * Create main `src/i18n/index.js` messages import file.
 *
 *
 * @param processedDirectories - List of directories with a boolean flag whether its "index.js" file is written
 *                               The format is "[\{ directory: "frontend-component-example", isWritten: false \}, ...]"
 * @param log - Mockable process.stdout.write
 * @param writeFileSync - Mockable fs.writeFileSync
 * @param i18nDir` - Path to `src/i18n` directory
 */
function generateMainMessagesFile(_ref2) {
  var processedDirectories = _ref2.processedDirectories,
    log = _ref2.log,
    writeFileSync = _ref2.writeFileSync,
    i18nDir = _ref2.i18nDir;
  var importLines = [];
  var exportLines = [];
  processedDirectories.forEach(function (processedDirectory) {
    var directory = processedDirectory.directory,
      isWritten = processedDirectory.isWritten;
    if (isWritten) {
      var moduleCamelCaseVariableName = camelCase("messages_from_".concat(directory));
      importLines.push("import ".concat(moduleCamelCaseVariableName, " from './messages/").concat(directory, "';"));
      exportLines.push("  ".concat(moduleCamelCaseVariableName, ","));
    } else {
      var skipMessage = "Skipped import due to missing '".concat(directory, "/index.js' likely due to empty translations.");
      importLines.push("// ".concat(skipMessage, "."));
      log("".concat(loggingPrefix, ": ").concat(skipMessage, "\n"));
    }
  });

  // See the help message above for sample output.
  var indexFileContent = [filesCodeGeneratorNoticeHeader, importLines.join('\n'), '\nexport default [', exportLines.join('\n'), '];\n'].join('\n');
  writeFileSync("".concat(i18nDir, "/index.js"), indexFileContent);
}

/*
 * Main function of the file.
 */
function main(_ref3) {
  var directories = _ref3.directories,
    log = _ref3.log,
    writeFileSync = _ref3.writeFileSync,
    pwd = _ref3.pwd;
  var i18nDir = "".concat(pwd, "/src/i18n"); // The Micro-frontend i18n root directory

  if (directories.includes('--help') || directories.includes('-h')) {
    log(scriptHelpDocument);
  } else if (!directories.length) {
    log(scriptHelpDocument);
    log("".concat(loggingPrefix, ": Error: A list of directories is required.\n"));
  } else if (!fs.existsSync(i18nDir) || !fs.lstatSync(i18nDir).isDirectory()) {
    log(scriptHelpDocument);
    log("".concat(loggingPrefix, ": Error: src/i18n directory was not found.\n"));
  } else {
    var processedDirectories = directories.map(function (directory) {
      return generateSubdirectoryMessageFile({
        directory: directory,
        log: log,
        writeFileSync: writeFileSync,
        i18nDir: i18nDir
      });
    });
    generateMainMessagesFile({
      processedDirectories: processedDirectories,
      log: log,
      writeFileSync: writeFileSync,
      i18nDir: i18nDir
    });
  }
}
if (require.main === module) {
  // Run the main() function if called from the command line.
  main({
    directories: process.argv.slice(2),
    log: function log(text) {
      return process.stdout.write(text);
    },
    writeFileSync: fs.writeFileSync,
    pwd: process.env.PWD
  });
}
module.exports.main = main; // Allow tests to use the main function.
//# sourceMappingURL=intl-imports.js.map