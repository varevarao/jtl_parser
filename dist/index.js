"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.transformJTL = exports.setOutputConfig = void 0;

var _csvParser = _interopRequireDefault(require("csv-parser"));

var _csvWriteStream = _interopRequireDefault(require("csv-write-stream"));

var _fs = _interopRequireDefault(require("fs"));

var _yargs = _interopRequireDefault(require("yargs"));

var _config = require("./config");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var CSV_OPTS_INPUT = {
  headers: _config.JTL_HEADERS
};
var CSV_OPTS_OUTPUT = {
  sendHeaders: true
};
var outputObj = {};
var outputConfig = _config.outputConfig;

var processRow = function processRow(row, isVerbose) {
  var acc = outputObj; // For each key in the output map, which isn't ignored

  for (var _i = 0, _Object$keys = Object.keys(outputConfig); _i < _Object$keys.length; _i++) {
    var key = _Object$keys[_i];

    if (key.startsWith('_')) {
      continue;
    }

    if ('transformRow' in outputConfig[key]) outputConfig[key].transformRow(acc, row, isVerbose);
  }
};

var processOutput = function processOutput(isVerbose) {
  var acc = outputObj; // For each key in the output map, which isn't ignored

  for (var _i2 = 0, _Object$keys2 = Object.keys(outputConfig); _i2 < _Object$keys2.length; _i2++) {
    var key = _Object$keys2[_i2];

    if (key.startsWith('_')) {
      continue;
    }

    if ('transformOutput' in outputConfig[key]) outputConfig[key].transformOutput(acc, isVerbose);
  }

  if (isVerbose) console.log('Output', JSON.stringify(acc));
};

var processComplete = function processComplete(outputPath, skipWrite) {
  if (!skipWrite) {
    console.log('Opening write stream to ', outputPath);
    var writer = (0, _csvWriteStream["default"])(CSV_OPTS_OUTPUT);
    writer.pipe(_fs["default"].createWriteStream(outputPath));

    for (var _i3 = 0, _Object$keys3 = Object.keys(outputObj); _i3 < _Object$keys3.length; _i3++) {
      var label = _Object$keys3[_i3];

      // Clean up any ignored items
      var printable = _objectSpread({}, outputObj[label]);

      for (var _i4 = 0, _Object$keys4 = Object.keys(outputObj[label]); _i4 < _Object$keys4.length; _i4++) {
        var key = _Object$keys4[_i4];
        if (key.startsWith('_')) delete printable[key];
      }

      writer.write(printable);
    }

    writer.end();
  }

  return outputObj;
};

var setOutputConfig = function setOutputConfig(config) {
  outputConfig = config;
};

exports.setOutputConfig = setOutputConfig;

var transformJTL = function transformJTL(options) {
  var filePath = options.f,
      _options$o = options.o,
      outputPath = _options$o === void 0 ? _config.DEFAULT_OUTPUT : _options$o,
      _options$v = options.v,
      isVerbose = _options$v === void 0 ? false : _options$v,
      _options$skipWrite = options.skipWrite,
      skipWrite = _options$skipWrite === void 0 ? false : _options$skipWrite;
  return new Promise(function (res, rej) {
    try {
      _fs["default"].exists(filePath, function (proceed) {
        if (proceed) {
          console.info('Creating read stream for file at ', filePath);

          _fs["default"].createReadStream(filePath).pipe((0, _csvParser["default"])(CSV_OPTS_INPUT)).on('data', function (row) {
            var timeStamp = row.timeStamp; // If we're not on the header row, process

            if (timeStamp !== _config.JTL_HEADERS[0]) {
              processRow(row, isVerbose);
            }
          }).on('end', function () {
            console.info('Completed parsing file.');
            processOutput(isVerbose); // We're done, dump the output

            res(processComplete(outputPath, skipWrite));
          });
        } else {
          rej("No supported file found at path: ".concat(filePath));
        }
      });
    } catch (err) {
      console.error('Error in transforming JTL: ', err);
      rej(err);
    }
  });
};

exports.transformJTL = transformJTL;

if (require.main === module) {
  // Called directly from cmd
  transformJTL(_yargs["default"].argv).then(function () {
    return console.info('Done.');
  });
}