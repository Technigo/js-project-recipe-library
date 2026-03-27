( () => {
    var e, t, r = {
        6064: (e, t, r) => {
            e.exports = r(3619).Observable
        }
        ,
        3619: (e, t) => {
            "use strict";
            t.Observable = void 0;
            const r = e => Boolean(Symbol[e])
              , n = e => r(e) ? Symbol[e] : "@@" + e
              , o = n("iterator")
              , i = n("observable")
              , s = n("species");
            function a(e, t) {
                let r = e[t];
                if (null != r) {
                    if ("function" != typeof r)
                        throw new TypeError(r + " is not a function");
                    return r
                }
            }
            function c(e) {
                let t = e.constructor;
                return void 0 !== t && (t = t[s],
                null === t && (t = void 0)),
                void 0 !== t ? t : b
            }
            function u(e) {
                u.log ? u.log(e) : setTimeout(( () => {
                    throw e
                }
                ))
            }
            function l(e) {
                Promise.resolve().then(( () => {
                    try {
                        e()
                    } catch (e) {
                        u(e)
                    }
                }
                ))
            }
            function f(e) {
                let t = e._cleanup;
                if (void 0 !== t && (e._cleanup = void 0,
                t))
                    try {
                        if ("function" == typeof t)
                            t();
                        else {
                            let e = a(t, "unsubscribe");
                            e && e.call(t)
                        }
                    } catch (e) {
                        u(e)
                    }
            }
            function p(e) {
                e._observer = void 0,
                e._queue = void 0,
                e._state = "closed"
            }
            function d(e, t, r) {
                e._state = "running";
                let n = e._observer;
                try {
                    let o = a(n, t);
                    switch (t) {
                    case "next":
                        o && o.call(n, r);
                        break;
                    case "error":
                        if (p(e),
                        !o)
                            throw r;
                        o.call(n, r);
                        break;
                    case "complete":
                        p(e),
                        o && o.call(n)
                    }
                } catch (e) {
                    u(e)
                }
                "closed" === e._state ? f(e) : "running" === e._state && (e._state = "ready")
            }
            function y(e, t, r) {
                if ("closed" !== e._state) {
                    if ("buffering" !== e._state)
                        return "ready" !== e._state ? (e._state = "buffering",
                        e._queue = [{
                            type: t,
                            value: r
                        }],
                        void l(( () => function(e) {
                            let t = e._queue;
                            if (t) {
                                e._queue = void 0,
                                e._state = "ready";
                                for (let r = 0; r < t.length && (d(e, t[r].type, t[r].value),
                                "closed" !== e._state); ++r)
                                    ;
                            }
                        }(e)))) : void d(e, t, r);
                    e._queue.push({
                        type: t,
                        value: r
                    })
                }
            }
            class g {
                constructor(e, t) {
                    this._cleanup = void 0,
                    this._observer = e,
                    this._queue = void 0,
                    this._state = "initializing";
                    let r = this
                      , n = {
                        get closed() {
                            return "closed" === r._state
                        },
                        next(e) {
                            y(r, "next", e)
                        },
                        error(e) {
                            y(r, "error", e)
                        },
                        complete() {
                            y(r, "complete")
                        }
                    };
                    try {
                        this._cleanup = t.call(void 0, n)
                    } catch (e) {
                        n.error(e)
                    }
                    "initializing" === this._state && (this._state = "ready")
                }
                get closed() {
                    return "closed" === this._state
                }
                unsubscribe() {
                    "closed" !== this._state && (p(this),
                    f(this))
                }
            }
            class b {
                constructor(e) {
                    if (!(this instanceof b))
                        throw new TypeError("Observable cannot be called as a function");
                    if ("function" != typeof e)
                        throw new TypeError("Observable initializer must be a function");
                    this._subscriber = e
                }
                subscribe(e) {
                    return "object" == typeof e && null !== e || (e = {
                        next: e,
                        error: arguments[1],
                        complete: arguments[2]
                    }),
                    new g(e,this._subscriber)
                }
                forEach(e) {
                    return new Promise(( (t, r) => {
                        if ("function" != typeof e)
                            return void r(new TypeError(e + " is not a function"));
                        function n() {
                            o.unsubscribe(),
                            t()
                        }
                        let o = this.subscribe({
                            next(t) {
                                try {
                                    e(t, n)
                                } catch (e) {
                                    r(e),
                                    o.unsubscribe()
                                }
                            },
                            error: r,
                            complete: t
                        })
                    }
                    ))
                }
                map(e) {
                    if ("function" != typeof e)
                        throw new TypeError(e + " is not a function");
                    return new (c(this))((t => this.subscribe({
                        next(r) {
                            try {
                                r = e(r)
                            } catch (e) {
                                return t.error(e)
                            }
                            t.next(r)
                        },
                        error(e) {
                            t.error(e)
                        },
                        complete() {
                            t.complete()
                        }
                    })))
                }
                filter(e) {
                    if ("function" != typeof e)
                        throw new TypeError(e + " is not a function");
                    return new (c(this))((t => this.subscribe({
                        next(r) {
                            try {
                                if (!e(r))
                                    return
                            } catch (e) {
                                return t.error(e)
                            }
                            t.next(r)
                        },
                        error(e) {
                            t.error(e)
                        },
                        complete() {
                            t.complete()
                        }
                    })))
                }
                reduce(e) {
                    if ("function" != typeof e)
                        throw new TypeError(e + " is not a function");
                    let t = c(this)
                      , r = arguments.length > 1
                      , n = !1
                      , o = arguments[1];
                    return new t((t => this.subscribe({
                        next(i) {
                            let s = !n;
                            if (n = !0,
                            !s || r)
                                try {
                                    o = e(o, i)
                                } catch (e) {
                                    return t.error(e)
                                }
                            else
                                o = i
                        },
                        error(e) {
                            t.error(e)
                        },
                        complete() {
                            if (!n && !r)
                                return t.error(new TypeError("Cannot reduce an empty sequence"));
                            t.next(o),
                            t.complete()
                        }
                    })))
                }
                async all() {
                    let e = [];
                    return await this.forEach((t => e.push(t))),
                    e
                }
                concat(...e) {
                    let t = c(this);
                    return new t((r => {
                        let n, o = 0;
                        return function i(s) {
                            n = s.subscribe({
                                next(e) {
                                    r.next(e)
                                },
                                error(e) {
                                    r.error(e)
                                },
                                complete() {
                                    o === e.length ? (n = void 0,
                                    r.complete()) : i(t.from(e[o++]))
                                }
                            })
                        }(this),
                        () => {
                            n && (n.unsubscribe(),
                            n = void 0)
                        }
                    }
                    ))
                }
                flatMap(e) {
                    if ("function" != typeof e)
                        throw new TypeError(e + " is not a function");
                    let t = c(this);
                    return new t((r => {
                        let n = []
                          , o = this.subscribe({
                            next(o) {
                                if (e)
                                    try {
                                        o = e(o)
                                    } catch (e) {
                                        return r.error(e)
                                    }
                                let s = t.from(o).subscribe({
                                    next(e) {
                                        r.next(e)
                                    },
                                    error(e) {
                                        r.error(e)
                                    },
                                    complete() {
                                        let e = n.indexOf(s);
                                        e >= 0 && n.splice(e, 1),
                                        i()
                                    }
                                });
                                n.push(s)
                            },
                            error(e) {
                                r.error(e)
                            },
                            complete() {
                                i()
                            }
                        });
                        function i() {
                            o.closed && 0 === n.length && r.complete()
                        }
                        return () => {
                            n.forEach((e => e.unsubscribe())),
                            o.unsubscribe()
                        }
                    }
                    ))
                }
                [i]() {
                    return this
                }
                static from(e) {
                    let t = "function" == typeof this ? this : b;
                    if (null == e)
                        throw new TypeError(e + " is not an object");
                    let n = a(e, i);
                    if (n) {
                        let r = n.call(e);
                        if (Object(r) !== r)
                            throw new TypeError(r + " is not an object");
                        return function(e) {
                            return e instanceof b
                        }(r) && r.constructor === t ? r : new t((e => r.subscribe(e)))
                    }
                    if (r("iterator") && (n = a(e, o),
                    n))
                        return new t((t => {
                            l(( () => {
                                if (!t.closed) {
                                    for (let r of n.call(e))
                                        if (t.next(r),
                                        t.closed)
                                            return;
                                    t.complete()
                                }
                            }
                            ))
                        }
                        ));
                    if (Array.isArray(e))
                        return new t((t => {
                            l(( () => {
                                if (!t.closed) {
                                    for (let r = 0; r < e.length; ++r)
                                        if (t.next(e[r]),
                                        t.closed)
                                            return;
                                    t.complete()
                                }
                            }
                            ))
                        }
                        ));
                    throw new TypeError(e + " is not observable")
                }
                static of(...e) {
                    return new ("function" == typeof this ? this : b)((t => {
                        l(( () => {
                            if (!t.closed) {
                                for (let r = 0; r < e.length; ++r)
                                    if (t.next(e[r]),
                                    t.closed)
                                        return;
                                t.complete()
                            }
                        }
                        ))
                    }
                    ))
                }
                static get[s]() {
                    return this
                }
            }
            t.Observable = b,
            Object.defineProperty(b, Symbol("extensions"), {
                value: {
                    symbol: i,
                    hostReportError: u
                },
                configurable: !0
            })
        }
    }, n = {};
    function o(e) {
        var t = n[e];
        if (void 0 !== t)
            return t.exports;
        var i = n[e] = {
            exports: {}
        };
        return r[e](i, i.exports, o),
        i.exports
    }
    o.n = e => {
        var t = e && e.__esModule ? () => e.default : () => e;
        return o.d(t, {
            a: t
        }),
        t
    }
    ,
    t = Object.getPrototypeOf ? e => Object.getPrototypeOf(e) : e => e.__proto__,
    o.t = function(r, n) {
        if (1 & n && (r = this(r)),
        8 & n)
            return r;
        if ("object" == typeof r && r) {
            if (4 & n && r.__esModule)
                return r;
            if (16 & n && "function" == typeof r.then)
                return r
        }
        var i = Object.create(null);
        o.r(i);
        var s = {};
        e = e || [null, t({}), t([]), t(t)];
        for (var a = 2 & n && r; "object" == typeof a && !~e.indexOf(a); a = t(a))
            Object.getOwnPropertyNames(a).forEach((e => s[e] = () => r[e]));
        return s.default = () => r,
        o.d(i, s),
        i
    }
    ,
    o.d = (e, t) => {
        for (var r in t)
            o.o(t, r) && !o.o(e, r) && Object.defineProperty(e, r, {
                enumerable: !0,
                get: t[r]
            })
    }
    ,
    o.o = (e, t) => Object.prototype.hasOwnProperty.call(e, t),
    o.r = e => {
        "undefined" != typeof Symbol && Symbol.toStringTag && Object.defineProperty(e, Symbol.toStringTag, {
            value: "Module"
        }),
        Object.defineProperty(e, "__esModule", {
            value: !0
        })
    }
    ,
    ( () => {
        "use strict";
        const e = {
            rE: "4.19.11"
        };
        var t = o.t(e, 2);
        var r = function(e, t) {
            return r = Object.setPrototypeOf || {
                __proto__: []
            }instanceof Array && function(e, t) {
                e.__proto__ = t
            }
            || function(e, t) {
                for (var r in t)
                    Object.prototype.hasOwnProperty.call(t, r) && (e[r] = t[r])
            }
            ,
            r(e, t)
        };
        function n(e, t) {
            if ("function" != typeof t && null !== t)
                throw new TypeError("Class extends value " + String(t) + " is not a constructor or null");
            function n() {
                this.constructor = e
            }
            r(e, t),
            e.prototype = null === t ? Object.create(t) : (n.prototype = t.prototype,
            new n)
        }
        Object.create;
        Object.create;
        "function" == typeof SuppressedError && SuppressedError;
        var i = "Invariant Violation"
          , s = Object.setPrototypeOf
          , a = void 0 === s ? function(e, t) {
            return e.__proto__ = t,
            e
        }
        : s
          , c = function(e) {
            function t(r) {
                void 0 === r && (r = i);
                var n = e.call(this, "number" == typeof r ? i + ": " + r + " (see https://github.com/apollographql/invariant-packages)" : r) || this;
                return n.framesToPop = 1,
                n.name = i,
                a(n, t.prototype),
                n
            }
            return n(t, e),
            t
        }(Error);
        function u(e, t) {
            if (!e)
                throw new c(t)
        }
        var l = ["debug", "log", "warn", "error", "silent"]
          , f = l.indexOf("log");
        function p(e) {
            return function() {
                if (l.indexOf(e) >= f)
                    return (console[e] || console.log).apply(console, arguments)
            }
        }
        !function(e) {
            e.debug = p("debug"),
            e.log = p("log"),
            e.warn = p("warn"),
            e.error = p("error")
        }(u || (u = {}));
        var d = "3.11.10";
        function y(e) {
            try {
                return e()
            } catch (e) {}
        }
        const g = y((function() {
            return globalThis
        }
        )) || y((function() {
            return window
        }
        )) || y((function() {
            return self
        }
        )) || y((function() {
            return global
        }
        )) || y((function() {
            return y.constructor("return this")()
        }
        ));
        var b = new Map;
        function h(e, t) {
            void 0 === t && (t = 0);
            var r, n, o = (r = "stringifyForDisplay",
            n = b.get(r) || 1,
            b.set(r, n + 1),
            "".concat(r, ":").concat(n, ":").concat(Math.random().toString(36).slice(2)));
            return JSON.stringify(e, (function(e, t) {
                return void 0 === t ? o : t
            }
            ), t).split(JSON.stringify(o)).join("<undefined>")
        }
        function m(e) {
            return function(t) {
                for (var r = [], n = 1; n < arguments.length; n++)
                    r[n - 1] = arguments[n];
                if ("number" == typeof t) {
                    var o = t;
                    (t = _(o)) || (t = O(o, r),
                    r = [])
                }
                e.apply(void 0, [t].concat(r))
            }
        }
        Object.assign((function(e, t) {
            for (var r = [], n = 2; n < arguments.length; n++)
                r[n - 2] = arguments[n];
            e || u(e, _(t, r) || O(t, r))
        }
        ), {
            debug: m(u.debug),
            log: m(u.log),
            warn: m(u.warn),
            error: m(u.error)
        });
        var v = Symbol.for("ApolloErrorMessageHandler_" + d);
        function w(e) {
            if ("string" == typeof e)
                return e;
            try {
                return h(e, 2).slice(0, 1e3)
            } catch (e) {
                return "<non-serializable>"
            }
        }
        function _(e, t) {
            if (void 0 === t && (t = []),
            e)
                return g[v] && g[v](e, t.map(w))
        }
        function O(e, t) {
            if (void 0 === t && (t = []),
            e)
                return "An error occurred! For more details, see the full error text at https://go.apollo.dev/c/err#".concat(encodeURIComponent(JSON.stringify({
                    version: d,
                    message: e,
                    args: t.map(w)
                })))
        }
        globalThis.__DEV__;
        function E(e) {
            return {
                clientErrors: e.clientErrors?.map((e => e.message)) ?? [],
                name: "ApolloError",
                networkError: e.networkError ? L(e.networkError) : void 0,
                message: e.message,
                graphQLErrors: e.graphQLErrors,
                protocolErrors: e.protocolErrors?.map((e => e.message)) ?? []
            }
        }
        function S(e) {
            const {options: t} = e
              , r = {
                ...(n = t,
                o = ["context", "pollInterval", "partialRefetch", "canonizeResults", "returnPartialData", "refetchWritePolicy", "notifyOnNetworkStatusChange", "fetchPolicy", "errorPolicy"],
                o.reduce(( (e, t) => t in n ? {
                    ...e,
                    [t]: n[t]
                } : e), {})),
                nextFetchPolicy: "function" == typeof t.nextFetchPolicy ? "<function>" : t.nextFetchPolicy
            };
            var n, o;
            return null == r.nextFetchPolicy && delete r.nextFetchPolicy,
            r.context && (r.context = JSON.parse(JSON.stringify(r.context, ( (e, t) => "function" == typeof t ? "<function>" : t)))),
            r
        }
        function L(e) {
            return "object" != typeof e ? {
                message: String(e),
                name: typeof e
            } : {
                message: e.message,
                name: e.name,
                stack: e.stack
            }
        }
        function x(e) {
            return e ? function(e) {
                return "ApolloError" === e.name
            }(e) ? E(e) : L(e) : null
        }
        function P(e) {
            return "object" == typeof e && null !== e && "source"in e && "apollo-client-devtools" === e.source
        }
        function T(e, t={}) {
            const {jsonSerialize: r} = t
              , n = new Set;
            return {
                addListener(t) {
                    function r({data: e}) {
                        if (n.has(e.id))
                            return n.delete(e.id);
                        t(e)
                    }
                    return e.addEventListener("message", r),
                    () => {
                        e.removeEventListener("message", r)
                    }
                },
                postMessage(t) {
                    n.add(t.id),
                    setTimeout(( () => n.delete(t.id)), 10),
                    e.postMessage(r ? JSON.parse(JSON.stringify(t)) : t, "*")
                }
            }
        }
        function j() {
            const e = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
            return new Array(10).fill(null).map(( () => e[Math.floor(62 * Math.random())])).join("")
        }
        function k(e) {
            let t = null;
            const r = new Map;
            function n(e) {
                if (!function(e) {
                    return P(e) && "actor" === e.type
                }(e))
                    return;
                const t = r.get(e.message.type);
                if (t)
                    for (const r of t)
                        r(e.message)
            }
            return {
                on: (o, i, s={}) => {
                    let a = r.get(o);
                    a || (a = new Set,
                    r.set(o, a)),
                    a.add(i),
                    t || (t = e.addListener(n));
                    const c = () => {
                        a.delete(i),
                        0 === a.size && r.delete(o),
                        0 === r.size && t && (t(),
                        t = null)
                    }
                    ;
                    return s.signal && s.signal.addEventListener("abort", c, {
                        once: !0
                    }),
                    c
                }
                ,
                send: t => {
                    e.postMessage({
                        id: j(),
                        source: "apollo-client-devtools",
                        type: "actor",
                        message: t
                    })
                }
            }
        }
        const M = [EvalError, RangeError, ReferenceError, SyntaxError, TypeError, URIError].reduce(( (e, t) => e.set(t.name, t)), new Map);
        var A = o(6064)
          , C = o.n(A);
        const {rE: q} = t
          , D = Symbol.for("apollo.devtools")
          , I = function(e) {
            return k(T(e))
        }(window)
          , N = T(window, {
            jsonSerialize: !0
        })
          , R = function(e) {
            const t = new Map;
            let r = null;
            function n(e) {
                (function(e) {
                    return P(e) && "rpcRequest" === e.type
                }
                )(e) && t.get(e.name)?.(e)
            }
            return function(o, i, s={}) {
                if (t.has(o))
                    throw new Error("Only one rpc handler can be registered per type");
                t.set(o, (async ({id: t, params: r}) => {
                    try {
                        const n = await Promise.resolve(i(...r));
                        e.postMessage({
                            source: "apollo-client-devtools",
                            type: "rpcResponse",
                            id: j(),
                            sourceId: t,
                            result: n
                        })
                    } catch (r) {
                        e.postMessage({
                            source: "apollo-client-devtools",
                            type: "rpcResponse",
                            id: j(),
                            sourceId: t,
                            error: (n = r,
                            n instanceof Error ? {
                                name: n.name,
                                message: n.message,
                                stack: n.stack
                            } : {
                                message: String(n)
                            })
                        })
                    }
                    var n
                }
                )),
                r || (r = e.addListener(n));
                const a = () => {
                    t.delete(o),
                    0 === t.size && r && (r(),
                    r = null)
                }
                ;
                return s.signal && s.signal.addEventListener("abort", a, {
                    once: !0
                }),
                a
            }
        }(N)
          , Q = (z = N,
        {
            timeout: 3e4,
            withTimeout(e) {
                return {
                    ...this,
                    timeout: e
                }
            },
            request(e, ...t) {
                return new Promise(( (r, n) => {
                    const o = j()
                      , i = setTimeout(( () => {
                        s(),
                        n(new Error("RPC_MESSAGE_TIMEOUT"))
                    }
                    ), this.timeout)
                      , s = z.addListener((e => {
                        (function(e) {
                            return P(e) && "rpcResponse" === e.type
                        }
                        )(e) && e.sourceId === o && ("error"in e ? n(function({name: e, message: t, stack: r}) {
                            const n = new (e ? M.get(e) ?? Error : Error)(t);
                            return e && n.name !== e && (n.name = e),
                            r && (n.stack = r),
                            n
                        }(e.error)) : r(e.result),
                        clearTimeout(i),
                        s())
                    }
                    ));
                    z.postMessage({
                        source: "apollo-client-devtools",
                        type: "rpcRequest",
                        id: o,
                        name: e,
                        params: t
                    })
                }
                ))
            }
        });
        var z;
        function J(e) {
            const t = e;
            return t?.queryManager.getObservableQueries ? function(e) {
                const t = [];
                return e && e.forEach(( (e, r) => {
                    const n = e
                      , {document: o, variables: i} = n.queryInfo
                      , s = n.queryInfo.getDiff();
                    if (!o)
                        return;
                    if ("IntrospectionQuery" === (o.definitions.filter((function(e) {
                        return "OperationDefinition" === e.kind && !!e.name
                    }
                    )).map((function(e) {
                        return e.name.value
                    }
                    ))[0] || null))
                        return;
                    const {pollingInfo: a} = n
                      , {networkStatus: c, error: u} = n.getCurrentResult(!1);
                    t.push({
                        id: r,
                        document: o,
                        variables: i,
                        cachedData: s.result,
                        options: S(e),
                        networkStatus: c,
                        error: u ? E(u) : void 0,
                        pollInterval: a && Math.floor(a.interval)
                    })
                }
                )),
                t
            }(t.queryManager.getObservableQueries("active")) : function(e) {
                let t = [];
                return e && (t = [...e.entries()].map(( ([e,{document: t, variables: r, diff: n, networkStatus: o}]) => ({
                    id: e,
                    document: t,
                    variables: r,
                    cachedData: n?.result,
                    networkStatus: o ?? 1
                })))),
                t
            }(t?.queryManager.queries)
        }
        function F(e) {
            const t = e;
            return function(e) {
                const t = Object.keys(e);
                return 0 === t.length ? [] : t.map((t => {
                    const {mutation: r, variables: n, loading: o, error: i} = e[t];
                    return {
                        document: r,
                        variables: n,
                        loading: o,
                        error: x(i)
                    }
                }
                ))
            }((t?.queryManager.mutationStore?.getStore ? t.queryManager.mutationStore?.getStore() : t?.queryManager.mutationStore) ?? {})
        }
        const G = new Map
          , H = {
            get ApolloClient() {
                return $("window.__APOLLO_DEVTOOLS_GLOBAL_HOOK__.ApolloClient"),
                W
            },
            version: q,
            getQueries: () => ($("window.__APOLLO_DEVTOOLS_GLOBAL_HOOK__.getQueries()"),
            J(H.ApolloClient)),
            getMutations: () => ($("window.__APOLLO_DEVTOOLS_GLOBAL_HOOK__.getMutations()"),
            F(H.ApolloClient)),
            getCache: () => ($("window.__APOLLO_DEVTOOLS_GLOBAL_HOOK__.getCache()"),
            H.ApolloClient?.cache.extract(!0) ?? {})
        };
        function V(e) {
            return {
                id: G.get(e),
                name: "devtoolsConfig"in e ? e.devtoolsConfig.name : void 0,
                version: e.version,
                queryCount: J(e).length,
                mutationCount: F(e).length
            }
        }
        function B(e) {
            const [t] = [...G.entries()].find(( ([,t]) => t === e)) ?? [];
            return t
        }
        function K(e) {
            if (!G.has(e)) {
                const t = j();
                G.set(e, t),
                function(e) {
                    const t = e.stop;
                    e.stop = () => {
                        const r = G.get(e);
                        G.delete(e),
                        window.__APOLLO_CLIENT__ === e && (window.__APOLLO_CLIENT__ = void 0),
                        I.send({
                            type: "clientTerminated",
                            clientId: r
                        }),
                        t.call(e)
                    }
                }(e),
                I.send({
                    type: "registerClient",
                    payload: V(e)
                })
            }
            !function(e, t) {
                e.request("getErrorCodes", t).catch(( () => {}
                )).then((e => {
                    if (!e)
                        return;
                    const r = Symbol.for("ApolloErrorMessageHandler_" + t)
                      , n = globalThis;
                    function o(e, t) {
                        if ("number" == typeof e) {
                            const t = n[r][e];
                            if (!e || !t?.message)
                                return;
                            e = t.message
                        }
                        return t.reduce(( (e, t) => e.replace(/%[sdfo]/, String(t))), String(e))
                    }
                    n[r] || (n[r] = o);
                    const i = n[r];
                    (i === o || Object.keys(i).some((e => /^\d+$/.test(e)))) && Object.assign(i, e, {
                        ...i
                    })
                }
                ))
            }(Q, e.version)
        }
        Object.defineProperty(window, "__APOLLO_DEVTOOLS_GLOBAL_HOOK__", {
            get: () => H,
            configurable: !0
        }),
        R("getClients", ( () => [...G.keys()].map(V))),
        R("getClient", (e => {
            const t = B(e);
            return t ? V(t) : null
        }
        )),
        R("getQueries", (e => J(B(e)))),
        R("getMutations", (e => F(B(e)))),
        R("getCache", (e => B(e)?.cache.extract(!0) ?? {})),
        function(e, t, r={}) {
            e.on("explorerRequest", (n => {
                const {clientId: o, operation: i, operationName: s, fetchPolicy: a, variables: c} = n.payload
                  , u = t(o);
                if (!u)
                    throw new Error("Could not find selected client");
                const l = JSON.parse(JSON.stringify(i))
                  , f = l.definitions.reduce(( (e, t) => (("OperationDefinition" === t.kind && t.name?.value === s || "OperationDefinition" !== t.kind) && e.push(t),
                e)), []);
                l.definitions = f;
                const p = function(e) {
                    let t;
                    for (const r of e.definitions) {
                        if ("OperationDefinition" === r.kind) {
                            const e = r.operation;
                            if ("query" === e || "mutation" === e || "subscription" === e)
                                return r
                        }
                        "FragmentDefinition" !== r.kind || t || (t = r)
                    }
                    if (t)
                        return t;
                    throw new Error("Expected a parsed GraphQL query with a query, mutation, subscription, or a fragment.")
                }(l)
                  , d = "OperationDefinition" === p.kind && "mutation" === p.operation ? new (C())((e => {
                    u.mutate({
                        mutation: l,
                        variables: c
                    }).then((t => {
                        e.next(t)
                    }
                    ))
                }
                )) : u.watchQuery({
                    query: l,
                    variables: c,
                    fetchPolicy: a
                })
                  , y = d?.subscribe((t => {
                    e.send({
                        type: "explorerResponse",
                        payload: {
                            operationName: s,
                            response: t
                        }
                    })
                }
                ), (t => {
                    e.send({
                        type: "explorerResponse",
                        payload: {
                            operationName: s,
                            response: {
                                errors: t.graphQLErrors.length ? t.graphQLErrors : t.networkError && "result"in t.networkError ? "string" == typeof t.networkError?.result ? t.networkError?.result : t.networkError?.result.errors ?? [] : [],
                                error: t,
                                data: null,
                                loading: !1,
                                networkStatus: 8
                            }
                        }
                    })
                }
                ));
                "OperationDefinition" === p.kind && "subscription" === p.operation && (e.on("explorerSubscriptionTermination", ( () => {
                    y?.unsubscribe()
                }
                ), r),
                r.signal && r.signal.addEventListener("abort", ( () => {
                    y?.unsubscribe()
                }
                ), {
                    once: !0
                }))
            }
            ), r)
        }(I, B);
        const U = window[D];
        window[D] = {
            push: K
        },
        Array.isArray(U) && U.forEach(K);
        let W = window.__APOLLO_CLIENT__;
        function $(e) {
            console.warn(`[Apollo Client Devtools]: '${e}' is deprecated and will be removed in a future version.`)
        }
        Object.defineProperty(window, "__APOLLO_CLIENT__", {
            get: () => W,
            set(e) {
                e && setTimeout(( () => K(e))),
                W = e
            },
            configurable: !0
        }),
        W && K(W)
    }
    )()
}
)();
