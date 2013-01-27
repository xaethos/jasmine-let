/*jslint indent: 2 */
/*global module */

module.exports = function (jasmine, namespace) {
  "use strict";

  var env, scopes, propertyNames;

  env = jasmine.getEnv();
  scopes = {};
  propertyNames = [];

  function declare(name, expr) {
    var suite, scope, block;

    if (typeof expr === "function") {
      block = expr;
    } else {
      block = function () { return expr; };
    }

    suite = env.currentSuite;

    scope = scopes[suite.id] || (scopes[suite.id] = {});
    scope[name] = block;
  }

  function makeGetter(name, values, fn) {
    return function () {
      if (values.hasOwnProperty(name)) {
        return values[name];
      }
      return values[name] = fn();
    };
  }

  function makeSetter(name, values) {
    return function (val) { values[name] = val; };
  }

  function defineProperties() {
    var spec, suite, declarations, values;

    spec = env.currentSpec;
    values = {};

    function defineProperty(name) {
      if (propertyNames.indexOf(name) >= 0) { return; }

      propertyNames.push(name);
      Object.defineProperty(namespace, name, {
        enumerable: true,
        configurable: true,
        get: makeGetter(name, values, declarations[name]),
        set: makeSetter(name, values)
      });
    }

    for (suite = spec.suite; suite; suite = suite.parentSuite) {
      declarations = scopes[suite.id];
      if (!declarations) continue;

      Object.keys(declarations).forEach(defineProperty);
    }
  }

  function deleteProperties() {
    var name;

    while ((name = propertyNames.pop(name))) {
      delete namespace[name];
    }
  }

  env.beforeEach(defineProperties);
  env.afterEach(deleteProperties);

  return declare;
};

