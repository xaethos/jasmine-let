
# jasmine-let

  Lazy variable evaluation for Jasmine specs, inspired by Rspec's let.

## Installation

    $ component install xaethos/jasmine-let

## Example

Get a reference to the jasmine let function.  As a Component:

```js
var jlet = require('jasmine-let')(
  jasmine, // A reference to jasmine
  window   // The object where the variables should be attached
);
```

Or if you simply link jasmine-let.js:

```js
var jlet = jasmineLet(jasmine, window);
```

That's it!  Use it in your specs.

```js
describe("A lazily evaluated variable", function () {

  jlet("fooSquare", function () { return foo * foo; });
  jlet("foo", 9);
  jlet("boom", function () { throw "better not call this"; });

  it("only gets evaluated when referenced", function () {
    expect(fooSquare).toEqual(81);
  });

  describe("in a nested describe block", function () {

    jlet("boom", function () { return "bomb defused"; });

    it("overrides definitions in outter blocks", function () {
      expect(function(){ boom; }).not.toThrow();
    });

  });
});
```

## License

  MIT.  See `LICENSE` file.

