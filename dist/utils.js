"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.quantile = exports.std = exports.mean = exports.sum = exports.asc = void 0;

// sort array ascending
var asc = function asc(arr) {
  return arr.sort(function (a, b) {
    return a - b;
  });
};

exports.asc = asc;

var sum = function sum(arr) {
  return arr.reduce(function (a, b) {
    return a + b;
  }, 0);
};

exports.sum = sum;

var mean = function mean(arr) {
  return sum(arr) / arr.length;
}; // sample standard deviation


exports.mean = mean;

var std = function std(arr) {
  var mu = mean(arr);
  var diffArr = arr.map(function (a) {
    return Math.pow(a - mu, 2);
  });
  return Math.sqrt(sum(diffArr) / (arr.length - 1));
};
/**
 * find the (q*100)th percentile for the given array
 * 0 < q < 1
 */


exports.std = std;

var quantile = function quantile(arr, q) {
  var sorted = asc(arr);
  var pos = (sorted.length - 1) * q;
  var base = Math.floor(pos);
  var rest = pos - base;

  if (sorted[base + 1] !== undefined) {
    return sorted[base] + rest * (sorted[base + 1] - sorted[base]);
  } else {
    return sorted[base];
  }
};

exports.quantile = quantile;