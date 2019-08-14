"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _utils = require("./utils");

var QUANTILES = [50, 66, 75, 80, 90, 95, 98, 99, 100];
var _default = {
  'Name': {
    transformRow: function transformRow(acc, _ref) {
      var label = _ref.label;
      if (!acc[label]) acc[label] = {};
      return acc;
    }
  },
  'Method': {
    transformRow: function transformRow(acc, _ref2) {
      var label = _ref2.label;
      var method = label.substring(0, label.indexOf(' '));
      if (!acc[label].Method) acc[label].Method = method;
      return acc;
    }
  },
  '# requests': {
    transformRow: function transformRow(acc, _ref3) {
      var label = _ref3.label;
      if (!acc[label].Requests) acc[label].Requests = 0;
      acc[label].Requests++;
      return acc;
    }
  },
  '# failures': {
    transformRow: function transformRow(acc, _ref4) {
      var label = _ref4.label,
          success = _ref4.success;
      if (!acc[label].Errors) acc[label].Errors = 0;
      acc[label].Errors += success === 'true' ? 0 : 1;
      return acc;
    }
  },
  '% failures': {
    transformRow: function transformRow(acc, _ref5) {
      var label = _ref5.label;
      if (!acc[label]['Error %']) acc[label]['Error %'] = 0;
      acc[label]['Error %'] = parseFloat((acc[label].Errors / acc[label].Requests * 100).toFixed(2));
      return acc;
    }
  },
  'Median response time': {
    transformRow: function transformRow(acc, _ref6) {
      var label = _ref6.label,
          elapsed = _ref6.elapsed;
      if (!acc[label]._times) acc[label]._times = [];

      acc[label]._times.push(parseInt(elapsed));

      return acc;
    },
    transformOutput: function transformOutput(acc) {
      for (var _i = 0, _Object$keys = Object.keys(acc); _i < _Object$keys.length; _i++) {
        var label = _Object$keys[_i];
        var _times = acc[label]._times; // Sort the times in-place

        _times.sort(function (a, b) {
          return a - b;
        });

        acc[label].Median = _times[parseInt((_times.length + 1) / 2)];
      }

      return acc;
    }
  },
  'Average response time': {
    transformRow: function transformRow(acc, _ref7) {
      var label = _ref7.label,
          elapsed = _ref7.elapsed;
      if (!acc[label].AverageReponse) acc[label].AverageReponse = 0; // Requests are already incremented above

      var currentSum = (acc[label].Requests - 1) * acc[label].AverageReponse;
      acc[label].AverageReponse = parseFloat(((currentSum + elapsed) / acc[label].Requests).toFixed(2));
      return acc;
    }
  },
  'Min response time': {
    transformRow: function transformRow(acc, _ref8) {
      var label = _ref8.label,
          elapsed = _ref8.elapsed;
      acc[label].Min = acc[label].Min === undefined ? elapsed : Math.min(acc[label].Min, elapsed);
      return acc;
    }
  },
  'Max response time': {
    transformRow: function transformRow(acc, _ref9) {
      var label = _ref9.label,
          elapsed = _ref9.elapsed;
      acc[label].Max = acc[label].Max === undefined ? elapsed : Math.max(acc[label].Max, elapsed);
      return acc;
    }
  },
  'Requests/s': {
    transformRow: function transformRow(acc, _ref10) {
      var label = _ref10.label,
          timeStamp = _ref10.timeStamp;
      if (!acc[label]._firstTS) acc[label]._firstTS = timeStamp;
      acc[label]._lastTS = timeStamp;
      return acc;
    },
    transformOutput: function transformOutput(acc) {
      for (var _i2 = 0, _Object$keys2 = Object.keys(acc); _i2 < _Object$keys2.length; _i2++) {
        var label = _Object$keys2[_i2];
        var _acc$label = acc[label],
            Requests = _acc$label.Requests,
            _firstTS = _acc$label._firstTS,
            _lastTS = _acc$label._lastTS;
        acc[label].RPS = parseFloat((Requests / ((_lastTS - _firstTS) / 1000)).toFixed(2));
      }

      return acc;
    }
  },
  'percentages': {
    transformOutput: function transformOutput(acc) {
      for (var _i3 = 0, _Object$keys3 = Object.keys(acc); _i3 < _Object$keys3.length; _i3++) {
        var label = _Object$keys3[_i3];
        var _times = acc[label]._times;

        for (var _i4 = 0, _QUANTILES = QUANTILES; _i4 < _QUANTILES.length; _i4++) {
          var percent = _QUANTILES[_i4];
          acc[label]["".concat(percent, "%")] = parseFloat((0, _utils.quantile)(_times, percent / 100).toFixed(2));
        }
      }

      return acc;
    }
  }
};
exports["default"] = _default;