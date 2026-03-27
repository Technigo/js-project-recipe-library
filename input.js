using handlerSync = openSync();
await using handlerAsync = await openAsync();
import data from "./data.json" with { type: "json" };
// matches Aa and aa
const regex = /(?i:a)a/
// matches aa, a\naa, etc. but not a\na
const regex = /(?m:^a)a/
// matches \na and aa, but not \n\n
const regex = /(?s:.)./
// replace this expression to `globalThis.foo = "top"`
this.foo = "top";

() => {
  // replace
  this.foo = "top"
}
function Foo() {
    // don't replace
    this.foo = "inner";
  }
  
  class Bar {
    method() {
      // don't replace
      this.foo = "inner";
    }
  }
  class Bar {
    // replace
    [this.foo = "outer"]() {
      // don't replace
      this.foo = "inner";
    }
  }
  {
    "type": "ClassMethod", // skipped
    "key": { "type": "AssignmentExpression" }, // [this.foo = "outer"]
    "body": { "type": "BlockStatement" }, // { this.foo = "inner"; }
    "params": [], // should visit too if there are any
    "computed": true
  }
  class Bar {
    // replace
    [this.foo = "outer"] =
    // don't replace
    this.foo
  }
  class Foo {
    // replaced to `@globalThis.log`
    @(this.log) foo = 1;
  }