/*jslint indent: 2 */
/*global module */

module.exports = function (jasmine) {
  "use strict";

  var fn, scopes, values, currentSpecId;

  fn = {};
  scopes = {};

  function declare(name, expr) {
    var suite, scope, block;

    switch (typeof expr) {
    case "function":
      block = expr;
      break;
    case "object":
      block = function () { return shallowCopy(expr); };
      break;
    default:
      block = function () { return expr; };
    }

    suite = jasmine.getEnv().currentSuite;
    if (suite === null) throw new Error('let called with no suite');

    scope = scopes[suite.id] || (scopes[suite.id] = {});
    scope[name] = block;

    fn.__defineGetter__(name, function () {
      return get(name);
    });
    fn.__defineSetter__(name, function (val) {
      values = specValues(jasmine.getEnv().currentSpec);
      values[name] = val;
    });
  }

  function get(key) {
    var spec, suite, values;

    spec = jasmine.getEnv().currentSpec;
    values = specValues(spec);

    if (values.hasOwnProperty(key)) {
      return values[key];
    }
    else {
      return values[key] = produceValue(spec.suite, key);
    }
  }

  function produceValue(suite, key) {
    var value, blocks;

    while (suite) {
      if ((blocks = scopes[suite.id])) {
        if (blocks.hasOwnProperty(key)) {
          value = blocks[key]();
          break;
        }
      }
      suite = suite.parentSuite;
    }

    return value;
  }

  function specValues(spec) {
    if (currentSpecId !== spec.id) {
      currentSpecId = spec.id;
      values = {};
    }
    return values;
  }

  function shallowCopy(obj) {
    if (obj === null) return null;

    var copy = new obj.constructor();
    Object.keys(obj).forEach(function (key) {
      copy[key] = obj[key];
    });

    return copy;
  }

  function attachMethods() {
    fn.let = declare;
  }

  fn = get;
  attachMethods();

  return fn;
};

