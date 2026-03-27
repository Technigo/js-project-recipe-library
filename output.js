try {
    var _usingCtx = babelHelpers.usingCtx();
    var handlerSync = _usingCtx.u(openSync());
    var handlerAsync = _usingCtx.a(await openAsync());
  } catch (_) {
    _usingCtx.e = _;
  } finally {
    await _usingCtx.d();
  }
const data = await fetch(import.meta.resolve("./data.json")).then(r => r.json());
const regex = /(?:[Aa])a/
const regex = /(?:(?:^|(?<=[\n\r\u2028\u2029]))a)a/
const regex = /(?:[\s\S])./;
import { jsxDEV as _jsxDEV } from "react/jsx-dev-runtime";

const _jsxFileName = "input.jsx";
const profile = _jsxDEV("div", {
  children: [
    _jsxDEV("img", {
      src: "avatar.png",
      className: "profile",
    }, undefined, false, { fileName: _jsxFileName, lineNumber: 3, columnNumber: 5 }, this),
    _jsxDEV("h3", {
      children: [user.firstName, user.lastName].join(" "),
    }, undefined, false, { fileName: _jsxFileName, lineNumber: 4, columnNumber: 5 }, this),
  ]},
  undefined, false, { fileName: _jsxFileName, lineNumber: 2, columnNumber: 3 }, this
);