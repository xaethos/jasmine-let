/*jslint node: true, indent: 2 */
"use strict";

module.exports = function (jasmine) {
  var fn, scopes, values, currentSpecId;

  scopes = {};

  function declare(name, expr) {
    var suite, scope, block;

    switch(typeof expr) {
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

    return value;
  }

  function produceValue(suite, key) {
    var value, blocks;

    while (suite != null) {
      if (blocks = scopes[suite.id]) {
        if (blocks.hasOwnProperty(key)) {
          value = blocks[key]();
          break;
        }
      }
      suite = suite.parentSuite;
    }

    return value;
  }

  function evaluateAround() {
    var suite, env;

    env = jasmine.getEnv();
    suite = env.currentSuite;

    suite.beforeEach(function () {
      var spec, blocks, values;

      Object.keys(fn).forEach(function (key) {
        delete fn[key];
      });

      spec = env.currentSpec;
      values = specValues(spec);
      console.log("before", spec)
      for (var iSuite = spec.suite; iSuite !== null; iSuite = iSuite.parentSuite) {
        console.log("looking for declarations in", iSuite)
        blocks = scopes[iSuite.id];
        if (!blocks) continue;

        Object.keys(blocks).forEach(function (key) {
          console.log("...", key)
          if (!values.hasOwnProperty(key)) {
            console.log("   not evaled yet")
            fn[key] = values[key] = blocks[key]();
          }
        });
      }
    });

    suite.afterEach(function () {
      Object.keys(fn).forEach(function (key) {
        delete fn[key];
      });
      attachMethods();
    });
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
    fn.evaluateBefore = evaluateAround;
  }

  fn = get;
  attachMethods();

  return fn;
};

