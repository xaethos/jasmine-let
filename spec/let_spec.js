/*jslint expr: true */

var ns = { theAnswer: 42 };
var jlet = require('jasmine-let')(jasmine, ns);

describe("jasmine-let", function() {

  describe("named property", function() {

    describe("definition", function() {
      var callCount = 0;

      jlet('foo', null);

      it("has getter", function() {
        expect(ns.hasOwnProperty('foo')).toBeTruthy();
      });

      it("has setter", function() {
        ns.foo = "some string";
        expect(ns.foo).toEqual("some string");
      });

      it("is configurable", function() {
        delete ns.foo;
        expect(ns.hasOwnProperty('foo')).toBeFalsy();
      });

      it("is enumerable", function() {
        expect(Object.keys(ns)).toContain('foo');
      });
    });

    describe("cleanup", function() {
      it("removes defined properties between specs", function() {
        expect(ns.hasOwnProperty('foo')).toBeFalsy();
      });

      it("it only removes properties defined by jasmine-let", function() {
        expect(ns.theAnswer).toBe(42);
      });
    });

  });

  describe("when expression is a primitive", function() {
    jlet('foo', 13);
    jlet('bar', "string");
    jlet('baz', true);
    jlet('cat', undefined);
    jlet('dog', null);

    it("returns that value", function() {
      expect(ns.foo).toBe(13);
      expect(ns.bar).toBe("string");
      expect(ns.baz).toBe(true);
      expect(ns.cat).toBe(void 0);
      expect(ns.dog).toBe(null);
    });
  });

  describe("when expression is a function", function() {
    var callCount = 0;

    jlet('foo', function() {
      ++callCount;
      return {};
    });

    it("returns the result of calling it", function() {
      expect(ns.foo).toEqual({});
      expect(callCount).toEqual(1);
    });

    it("calls the function only once per example and caches the result", function() {
      value = ns.foo;
      expect(value).toEqual({});
      expect(callCount).toEqual(2);

      expect(ns.foo).toBe(value);
      expect(callCount).toEqual(2);
    });
  });

  describe("when expression is an object", function() {
    var obj = { a: true, b: 2, c: "three", nested: {} };

    jlet('foo', obj);

    it("returns the same instance", function() {
      expect(ns.foo).toBe(obj);
    });
  });

  describe("suite sandboxing", function() {

    describe("a suite declared before", function() {
      jlet("foo", 1);
    });

    describe("within a describe block", function() {
      jlet("foo", 2);

      it("keeps declarations isolated", function() {
        expect(ns.foo).toEqual(2);
      });

    });

    describe("a suite declared after", function() {
      jlet("foo", 3);
    });

  });

  describe("definition overrides", function() {
    var callCount = 0;

    jlet('foo', function() {
      ++callCount;
      return "bad";
    });

    describe("when nested suite redefines a name", function() {
      jlet('foo', function() { return "good"; });

      it("uses the innermost definition", function() {
        expect(ns.foo).toEqual("good");
      });

      it("never evaluates the external definition", function() {
        ns.foo;
        expect(callCount).toEqual(0);
      });
    });
  });

  describe("definition interdependency", function () {
    var callOrder = [];

    jlet('foo', function () { callOrder.push("foo"); return 13; });
    jlet('bar', function () { callOrder.push("bar"); return ns.foo + ns.baz; });
    jlet('baz', function () { callOrder.push("baz"); return 17; });

    it("works", function () {
      expect(ns.bar).toEqual(30);
      expect(callOrder).toEqual(["bar", "foo", "baz"]);
    });
  });

  describe("options", function () {

    describe("evaluateBefore [boolean]", function () {
      var evaluated = {
        foo: false,
        bar: false,
        baz: false
      };
      var beforeEachEvaluated = false;

      jlet('foo', function () { evaluated.foo = true; }, { evaluateBefore: true });
      jlet('bar', function () { evaluated.bar = true; }, { evaluateBefore: false });
      jlet('baz', function () { evaluated.baz = true; });

      beforeEach(function () {
        beforeEachEvaluated = true;
      });

      afterEach(function () {
        beforeEachEvaluated = false;
      });

      it("evaluates a definition before the specs (default: false)", function () {
        expect(evaluated.foo).toBeTruthy();
        expect(evaluated.bar).toBeFalsy();
        expect(evaluated.baz).toBeFalsy();
      });

      describe("when outer suites have beforeEach blocks", function () {
        jlet('evaluatedafter', function () { return beforeEachEvaluated; }, { evaluateBefore: true });

        it("evaluates those blocks before the definition", function () {
          expect(ns.evaluatedafter).toBeTruthy();
        });
      });
    });

  });

});

