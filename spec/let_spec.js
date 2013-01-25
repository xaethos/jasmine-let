var j = require('jasmine-let')(jasmine);

describe("jasmine-let", function() {

  describe("function", function() {

    describe("when #let has been called with a primitive", function() {
      j.let('foo', 13);
      j.let('bar', "string");
      j.let('baz', true);
      j.let('cat', undefined);
      j.let('dog', null);

      it("returns that value", function() {
        expect(j('foo')).toBe(13);
        expect(j('bar')).toBe("string");
        expect(j('baz')).toBe(true);
        expect(j('cat')).toBe(void 0);
        expect(j('dog')).toBe(null);
      });

    });

    describe("when #let has been called with a function", function() {
      var callCount = 0;
      j.let('foo', function() {
        ++callCount;
        return {};
      });

      it("returns the result of calling it", function() {
        expect(j('foo')).toEqual({});
        expect(callCount).toEqual(1);
      });

      it("calls the function only once per example and caches the result", function() {
        value = j('foo');
        expect(value).toEqual({});
        expect(callCount).toEqual(2);

        expect(j('foo')).toBe(value);
        expect(callCount).toEqual(2);
      });

    });

    describe("when #let has been called with an object", function() {
      var obj = { a: true, b: 2, c: "three", nested: {} }
      j.let('foo', obj);

      it("returns a shallow clone", function() {
        expect(j('foo')).toEqual(obj);
        expect(j('foo')).not.toBe(obj);
        expect(j('foo').nested).toBe(obj.nested);
      });

    });

  });

  describe("suite sandboxing", function() {

    describe("a suite declared before", function() {
      j.let("foo", 1);
    });

    describe("within a describe block", function() {
      j.let("foo", 2);

      it("keeps variables isolated", function() {
        expect(j('foo')).toEqual(2);
      });

    });

    describe("a suite declared after", function() {
      j.let("foo", 3);
    });

  });

  describe("`let` overrides", function() {
    var callCount = 0;
    j.let('foo', function() {
      ++callCount;
      return "bad";
    })

    describe("when nested `describe` redeclares a name", function() {
      j.let('foo', function() { return "good"; });

      it("uses the innermost definition", function() {
        expect(j('foo')).toEqual("good");
      });
      it("never evaluates the external let", function() {
        j('foo');
        expect(callCount).toEqual(0);
      });
    });
  });

  describe("properties", function() {
    var callCount = 0;

    j.let('foo', function() {
      ++callCount;
      return "lorem ipsum";
    })

    it("let defines getters", function() {
      expect(callCount).toEqual(0);
      expect(j.foo).toEqual("lorem ipsum");
      expect(callCount).toEqual(1);

      j.foo
      expect(callCount).toEqual(1);
    });

    it("let defines setters", function() {
      j.foo = "some string"
      expect(j.foo).toEqual("some string");
    });
  });

});

