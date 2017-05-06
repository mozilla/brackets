! function(t, e) {
    "function" == typeof define && define.amd ? define([], e) : t.Bramble = e()
}(this, function() {
    var t, e, n;
    return function(r) {
            function i(t, e) {
                return b.call(t, e)
            }

            function o(t, e) {
                var n, r, i, o, a, s, u, c, f, l, h, d = e && e.split("/"),
                    p = E.map,
                    m = p && p["*"] || {};
                if (t && "." === t.charAt(0))
                    if (e) {
                        for (t = t.split("/"), a = t.length - 1, E.nodeIdCompat && _.test(t[a]) && (t[a] = t[a].replace(_, "")), t = d.slice(0, d.length - 1).concat(t), f = 0; f < t.length; f += 1)
                            if (h = t[f], "." === h) t.splice(f, 1), f -= 1;
                            else if (".." === h) {
                            if (1 === f && (".." === t[2] || ".." === t[0])) break;
                            f > 0 && (t.splice(f - 1, 2), f -= 2)
                        }
                        t = t.join("/")
                    } else 0 === t.indexOf("./") && (t = t.substring(2));
                if ((d || m) && p) {
                    for (n = t.split("/"), f = n.length; f > 0; f -= 1) {
                        if (r = n.slice(0, f).join("/"), d)
                            for (l = d.length; l > 0; l -= 1)
                                if (i = p[d.slice(0, l).join("/")], i && (i = i[r])) {
                                    o = i, s = f;
                                    break
                                }
                        if (o) break;
                        !u && m && m[r] && (u = m[r], c = f)
                    }!o && u && (o = u, s = c), o && (n.splice(0, s, o), t = n.join("/"))
                }
                return t
            }

            function a(t, e) {
                return function() {
                    var n = w.call(arguments, 0);
                    return "string" != typeof n[0] && 1 === n.length && n.push(null), d.apply(r, n.concat([t, e]))
                }
            }

            function s(t) {
                return function(e) {
                    return o(e, t)
                }
            }

            function u(t) {
                return function(e) {
                    g[t] = e
                }
            }

            function c(t) {
                if (i(v, t)) {
                    var e = v[t];
                    delete v[t], y[t] = !0, h.apply(r, e)
                }
                if (!i(g, t) && !i(y, t)) throw new Error("No " + t);
                return g[t]
            }

            function f(t) {
                var e, n = t ? t.indexOf("!") : -1;
                return n > -1 && (e = t.substring(0, n), t = t.substring(n + 1, t.length)), [e, t]
            }

            function l(t) {
                return function() {
                    return E && E.config && E.config[t] || {}
                }
            }
            var h, d, p, m, g = {},
                v = {},
                E = {},
                y = {},
                b = Object.prototype.hasOwnProperty,
                w = [].slice,
                _ = /\.js$/;
            p = function(t, e) {
                var n, r = f(t),
                    i = r[0];
                return t = r[1], i && (i = o(i, e), n = c(i)), i ? t = n && n.normalize ? n.normalize(t, s(e)) : o(t, e) : (t = o(t, e), r = f(t), i = r[0], t = r[1], i && (n = c(i))), {
                    f: i ? i + "!" + t : t,
                    n: t,
                    pr: i,
                    p: n
                }
            }, m = {
                require: function(t) {
                    return a(t)
                },
                exports: function(t) {
                    var e = g[t];
                    return "undefined" != typeof e ? e : g[t] = {}
                },
                module: function(t) {
                    return {
                        id: t,
                        uri: "",
                        exports: g[t],
                        config: l(t)
                    }
                }
            }, h = function(t, e, n, o) {
                var s, f, l, h, d, E, b = [],
                    w = typeof n;
                if (o = o || t, "undefined" === w || "function" === w) {
                    for (e = !e.length && n.length ? ["require", "exports", "module"] : e, d = 0; d < e.length; d += 1)
                        if (h = p(e[d], o), f = h.f, "require" === f) b[d] = m.require(t);
                        else if ("exports" === f) b[d] = m.exports(t), E = !0;
                    else if ("module" === f) s = b[d] = m.module(t);
                    else if (i(g, f) || i(v, f) || i(y, f)) b[d] = c(f);
                    else {
                        if (!h.p) throw new Error(t + " missing " + f);
                        h.p.load(h.n, a(o, !0), u(f), {}), b[d] = g[f]
                    }
                    l = n ? n.apply(g[t], b) : void 0, t && (s && s.exports !== r && s.exports !== g[t] ? g[t] = s.exports : l === r && E || (g[t] = l))
                } else t && (g[t] = n)
            }, t = e = d = function(t, e, n, i, o) {
                if ("string" == typeof t) return m[t] ? m[t](e) : c(p(t, e).f);
                if (!t.splice) {
                    if (E = t, E.deps && d(E.deps, E.callback), !e) return;
                    e.splice ? (t = e, e = n, n = null) : t = r
                }
                return e = e || function() {}, "function" == typeof n && (n = i, i = o), i ? h(r, t, e, n) : setTimeout(function() {
                    h(r, t, e, n)
                }, 4), d
            }, d.config = function(t) {
                return d(t)
            }, t._defined = g, n = function(t, e, n) {
                if ("string" != typeof t) throw new Error("See almond README: incorrect module build, no module name");
                e.splice || (n = e, e = []), i(g, t) || i(v, t) || (v[t] = [t, e, n])
            }, n.amd = {
                jQuery: !0
            }
        }(), n("thirdparty/almond", function() {}), ! function(t) {
            if ("object" == typeof exports && "undefined" != typeof module) module.exports = t();
            else if ("function" == typeof n && n.amd) n("thirdparty/filer/dist/filer.min", [], t);
            else {
                var e;
                e = "undefined" != typeof window ? window : "undefined" != typeof global ? global : "undefined" != typeof self ? self : this, e.Filer = t()
            }
        }(function() {
            var t;
            return function n(t, r, i) {
                function o(s, u) {
                    if (!r[s]) {
                        if (!t[s]) {
                            var c = "function" == typeof e && e;
                            if (!u && c) return c(s, !0);
                            if (a) return a(s, !0);
                            var f = new Error("Cannot find module '" + s + "'");
                            throw f.code = "MODULE_NOT_FOUND", f
                        }
                        var l = r[s] = {
                            exports: {}
                        };
                        t[s][0].call(l.exports, function(e) {
                            var n = t[s][1][e];
                            return o(n ? n : e)
                        }, l, l.exports, n, t, r, i)
                    }
                    return r[s].exports
                }
                for (var a = "function" == typeof e && e, s = 0; s < i.length; s++) o(i[s]);
                return o
            }({
                1: [function(e, n, r) {
                    ! function() {
                        var e = {};
                        "undefined" != typeof process && process.nextTick ? (e.nextTick = process.nextTick, "undefined" != typeof setImmediate ? e.setImmediate = function(t) {
                            setImmediate(t)
                        } : e.setImmediate = e.nextTick) : "function" == typeof setImmediate ? (e.nextTick = function(t) {
                            setImmediate(t)
                        }, e.setImmediate = e.nextTick) : (e.nextTick = function(t) {
                            setTimeout(t, 0)
                        }, e.setImmediate = e.nextTick), e.eachSeries = function(t, e, n) {
                            if (n = n || function() {}, !t.length) return n();
                            var r = 0,
                                i = function() {
                                    e(t[r], function(e) {
                                        e ? (n(e), n = function() {}) : (r += 1, r >= t.length ? n() : i())
                                    })
                                };
                            i()
                        }, e.forEachSeries = e.eachSeries, "undefined" != typeof t && t.amd ? t([], function() {
                            return e
                        }) : "undefined" != typeof n && n.exports ? n.exports = e : root.async = e
                    }()
                }, {}],
                2: [function(t, e, n) {
                    function r(t, e) {
                        for (var n = e.length - 1; n >= 0; n--) e[n] === t && e.splice(n, 1);
                        return e
                    }
                    var i = function() {};
                    i.createInterface = function(t) {
                        var e = {};
                        return e.on = function(e, n) {
                            "undefined" == typeof this[t] && (this[t] = {}), this[t].hasOwnProperty(e) || (this[t][e] = []), this[t][e].push(n)
                        }, e.off = function(e, n) {
                            "undefined" != typeof this[t] && this[t].hasOwnProperty(e) && r(n, this[t][e])
                        }, e.trigger = function(e) {
                            if ("undefined" != typeof this[t] && this[t].hasOwnProperty(e))
                                for (var n = Array.prototype.slice.call(arguments, 1), r = 0; r < this[t][e].length; r++) this[t][e][r].apply(this[t][e][r], n)
                        }, e.removeAllListeners = function(e) {
                            if ("undefined" != typeof this[t]) {
                                var n = this;
                                n[t][e].forEach(function(t) {
                                    n.off(e, t)
                                })
                            }
                        }, e
                    };
                    var o = i.createInterface("_handlers");
                    i.prototype._on = o.on, i.prototype._off = o.off, i.prototype._trigger = o.trigger;
                    var a = i.createInterface("handlers");
                    i.prototype.on = function() {
                        a.on.apply(this, arguments), Array.prototype.unshift.call(arguments, "on"), this._trigger.apply(this, arguments)
                    }, i.prototype.off = a.off, i.prototype.trigger = a.trigger, i.prototype.removeAllListeners = a.removeAllListeners, e.exports = i
                }, {}],
                3: [function(t, e, n) {
                    (function(n) {
                        function r(t, e) {
                            var n = 0;
                            return function() {
                                var r = Date.now();
                                r - n > t && (n = r, e.apply(this, arguments))
                            }
                        }

                        function i(t, e) {
                            if ("undefined" != typeof t && t || (t = {}), "object" == typeof e)
                                for (var n in e) e.hasOwnProperty(n) && (t[n] = e[n]);
                            return t
                        }

                        function o() {
                            var t = this,
                                e = Date.now();
                            this.origin = s(), this.lastMessage = e, this.receivedIDs = {}, this.previousValues = {};
                            var r = function() {
                                t._onStorageEvent.apply(t, arguments)
                            };
                            "undefined" != typeof document && (document.attachEvent ? document.attachEvent("onstorage", r) : n.addEventListener("storage", r, !1))
                        }
                        var a = t("./eventemitter.js"),
                            s = t("../src/shared.js").guid,
                            u = function(t) {
                                return "undefined" == typeof t || "undefined" == typeof t.localStorage ? {
                                    getItem: function() {},
                                    setItem: function() {},
                                    removeItem: function() {}
                                } : t.localStorage
                            }(n);
                        o.prototype._transaction = function(t) {
                            function e() {
                                if (!a) {
                                    var f = Date.now(),
                                        h = 0 | u.getItem(l);
                                    if (h && r > f - h) return s || (o._on("storage", e), s = !0), void(c = setTimeout(e, i));
                                    a = !0, u.setItem(l, f), t(), n()
                                }
                            }

                            function n() {
                                s && o._off("storage", e), c && clearTimeout(c), u.removeItem(l)
                            }
                            var r = 1e3,
                                i = 20,
                                o = this,
                                a = !1,
                                s = !1,
                                c = null;
                            e()
                        }, o.prototype._cleanup_emit = r(100, function() {
                            var t = this;
                            t._transaction(function() {
                                var t, e = Date.now(),
                                    n = e - h,
                                    r = 0;
                                try {
                                    t = JSON.parse(u.getItem(c) || "[]")
                                } catch (i) {
                                    t = []
                                }
                                for (var o = t.length - 1; o >= 0; o--) t[o].timestamp < n && (t.splice(o, 1), r++);
                                r > 0 && u.setItem(c, JSON.stringify(t))
                            })
                        }), o.prototype._cleanup_once = r(100, function() {
                            var t = this;
                            t._transaction(function() {
                                var e, n, r = (Date.now(), 0);
                                try {
                                    n = JSON.parse(u.getItem(f) || "{}")
                                } catch (i) {
                                    n = {}
                                }
                                for (e in n) t._once_expired(e, n) && (delete n[e], r++);
                                r > 0 && u.setItem(f, JSON.stringify(n))
                            })
                        }), o.prototype._once_expired = function(t, e) {
                            if (!e) return !0;
                            if (!e.hasOwnProperty(t)) return !0;
                            if ("object" != typeof e[t]) return !0;
                            var n = e[t].ttl || d,
                                r = Date.now(),
                                i = e[t].timestamp;
                            return r - n > i
                        }, o.prototype._localStorageChanged = function(t, e) {
                            if (t && t.key) return t.key === e;
                            var n = u.getItem(e);
                            return n === this.previousValues[e] ? !1 : (this.previousValues[e] = n, !0)
                        }, o.prototype._onStorageEvent = function(t) {
                            t = t || n.event;
                            var e = this;
                            this._localStorageChanged(t, c) && this._transaction(function() {
                                var t, n = Date.now(),
                                    r = u.getItem(c);
                                try {
                                    t = JSON.parse(r || "[]")
                                } catch (i) {
                                    t = []
                                }
                                for (var o = 0; o < t.length; o++)
                                    if (t[o].origin !== e.origin && !(t[o].timestamp < e.lastMessage)) {
                                        if (t[o].id) {
                                            if (e.receivedIDs.hasOwnProperty(t[o].id)) continue;
                                            e.receivedIDs[t[o].id] = !0
                                        }
                                        e.trigger(t[o].name, t[o].payload)
                                    }
                                e.lastMessage = n
                            }), this._trigger("storage", t)
                        }, o.prototype._emit = function(t, e, n) {
                            if (n = "string" == typeof n || "number" == typeof n ? String(n) : null, n && n.length) {
                                if (this.receivedIDs.hasOwnProperty(n)) return;
                                this.receivedIDs[n] = !0
                            }
                            var r = {
                                    id: n,
                                    name: t,
                                    origin: this.origin,
                                    timestamp: Date.now(),
                                    payload: e
                                },
                                i = this;
                            this._transaction(function() {
                                var n = u.getItem(c) || "[]",
                                    o = "[]" === n ? "" : ",";
                                n = [n.substring(0, n.length - 1), o, JSON.stringify(r), "]"].join(""), u.setItem(c, n), i.trigger(t, e), setTimeout(function() {
                                    i._cleanup_emit()
                                }, 50)
                            })
                        }, o.prototype.emit = function(t, e) {
                            this._emit.apply(this, arguments), this._trigger("emit", t, e)
                        }, o.prototype.once = function(t, e, n) {
                            if (o.supported) {
                                var r = this;
                                this._transaction(function() {
                                    var i;
                                    try {
                                        i = JSON.parse(u.getItem(f) || "{}")
                                    } catch (o) {
                                        i = {}
                                    }
                                    r._once_expired(t, i) && (i[t] = {}, i[t].timestamp = Date.now(), "number" == typeof n && (i[t].ttl = 1e3 * n), u.setItem(f, JSON.stringify(i)), e(), setTimeout(function() {
                                        r._cleanup_once()
                                    }, 50))
                                })
                            }
                        }, i(o.prototype, a.prototype), o.supported = "undefined" != typeof u;
                        var c = "intercom",
                            f = "intercom_once",
                            l = "intercom_lock",
                            h = 5e4,
                            d = 36e5;
                        o.destroy = function() {
                            u.removeItem(l), u.removeItem(c), u.removeItem(f)
                        }, o.getInstance = function() {
                            var t;
                            return function() {
                                return t || (t = new o), t
                            }
                        }(), e.exports = o
                    }).call(this, "undefined" != typeof global ? global : "undefined" != typeof self ? self : "undefined" != typeof window ? window : {})
                }, {
                    "../src/shared.js": 30,
                    "./eventemitter.js": 2
                }],
                4: [function(t, e, n) {
                    function r(t, e) {
                        return g.call(t, e)
                    }

                    function i(t) {
                        return null == t ? 0 : t.length === +t.length ? t.length : y(t).length
                    }

                    function o(t) {
                        return t
                    }

                    function a(t, e, n) {
                        var r, i;
                        if (null != t)
                            if (h && t.forEach === h) t.forEach(e, n);
                            else if (t.length === +t.length) {
                            for (r = 0, i = t.length; i > r; r++)
                                if (e.call(n, t[r], r, t) === E) return
                        } else {
                            var o = o(t);
                            for (r = 0, i = o.length; i > r; r++)
                                if (e.call(n, t[o[r]], o[r], t) === E) return
                        }
                    }

                    function s(t, e, n) {
                        e || (e = o);
                        var r = !1;
                        return null == t ? r : p && t.some === p ? t.some(e, n) : (a(t, function(t, i, o) {
                            return r || (r = e.call(n, t, i, o)) ? E : void 0
                        }), !!r)
                    }

                    function u(t, e) {
                        return null == t ? !1 : d && t.indexOf === d ? -1 != t.indexOf(e) : s(t, function(t) {
                            return t === e
                        })
                    }

                    function c(t) {
                        this.value = t
                    }

                    function f(t) {
                        return t && "object" == typeof t && !Array.isArray(t) && g.call(t, "__wrapped__") ? t : new c(t)
                    }
                    var l = Array.prototype,
                        h = l.forEach,
                        d = l.indexOf,
                        p = l.some,
                        m = Object.prototype,
                        g = m.hasOwnProperty,
                        v = Object.keys,
                        E = {},
                        y = v || function(t) {
                            if (t !== Object(t)) throw new TypeError("Invalid object");
                            var e = [];
                            for (var n in t) r(t, n) && e.push(n);
                            return e
                        };
                    c.prototype.has = function(t) {
                        return r(this.value, t)
                    }, c.prototype.contains = function(t) {
                        return u(this.value, t)
                    }, c.prototype.size = function() {
                        return i(this.value)
                    }, e.exports = f
                }, {}],
                5: [function(t, e, n) {
                    ! function(t) {
                        "use strict";
                        n.encode = function(e) {
                            var n, r = new Uint8Array(e),
                                i = r.length,
                                o = "";
                            for (n = 0; i > n; n += 3) o += t[r[n] >> 2], o += t[(3 & r[n]) << 4 | r[n + 1] >> 4], o += t[(15 & r[n + 1]) << 2 | r[n + 2] >> 6], o += t[63 & r[n + 2]];
                            return i % 3 === 2 ? o = o.substring(0, o.length - 1) + "=" : i % 3 === 1 && (o = o.substring(0, o.length - 2) + "=="), o
                        }, n.decode = function(e) {
                            var n, r, i, o, a, s = .75 * e.length,
                                u = e.length,
                                c = 0;
                            "=" === e[e.length - 1] && (s--, "=" === e[e.length - 2] && s--);
                            var f = new ArrayBuffer(s),
                                l = new Uint8Array(f);
                            for (n = 0; u > n; n += 4) r = t.indexOf(e[n]), i = t.indexOf(e[n + 1]), o = t.indexOf(e[n + 2]), a = t.indexOf(e[n + 3]), l[c++] = r << 2 | i >> 4, l[c++] = (15 & i) << 4 | o >> 2, l[c++] = (3 & o) << 6 | 63 & a;
                            return f
                        }
                    }("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/")
                }, {}],
                6: [function(t, e, n) {
                    function r(t) {
                        return this instanceof r ? (this.length = 0, this.parent = void 0, "number" == typeof t ? i(this, t) : "string" == typeof t ? o(this, t, arguments.length > 1 ? arguments[1] : "utf8") : a(this, t)) : arguments.length > 1 ? new r(t, arguments[1]) : new r(t)
                    }

                    function i(t, e) {
                        if (t = h(t, 0 > e ? 0 : 0 | d(e)), !r.TYPED_ARRAY_SUPPORT)
                            for (var n = 0; e > n; n++) t[n] = 0;
                        return t
                    }

                    function o(t, e, n) {
                        ("string" != typeof n || "" === n) && (n = "utf8");
                        var r = 0 | m(e, n);
                        return t = h(t, r), t.write(e, n), t
                    }

                    function a(t, e) {
                        if (r.isBuffer(e)) return s(t, e);
                        if (q(e)) return u(t, e);
                        if (null == e) throw new TypeError("must start with number, buffer, array or string");
                        return "undefined" != typeof ArrayBuffer && e.buffer instanceof ArrayBuffer ? c(t, e) : e.length ? f(t, e) : l(t, e)
                    }

                    function s(t, e) {
                        var n = 0 | d(e.length);
                        return t = h(t, n), e.copy(t, 0, 0, n), t
                    }

                    function u(t, e) {
                        var n = 0 | d(e.length);
                        t = h(t, n);
                        for (var r = 0; n > r; r += 1) t[r] = 255 & e[r];
                        return t
                    }

                    function c(t, e) {
                        var n = 0 | d(e.length);
                        t = h(t, n);
                        for (var r = 0; n > r; r += 1) t[r] = 255 & e[r];
                        return t
                    }

                    function f(t, e) {
                        var n = 0 | d(e.length);
                        t = h(t, n);
                        for (var r = 0; n > r; r += 1) t[r] = 255 & e[r];
                        return t
                    }

                    function l(t, e) {
                        var n, r = 0;
                        "Buffer" === e.type && q(e.data) && (n = e.data, r = 0 | d(n.length)), t = h(t, r);
                        for (var i = 0; r > i; i += 1) t[i] = 255 & n[i];
                        return t
                    }

                    function h(t, e) {
                        r.TYPED_ARRAY_SUPPORT ? t = r._augment(new Uint8Array(e)) : (t.length = e, t._isBuffer = !0);
                        var n = 0 !== e && e <= r.poolSize >>> 1;
                        return n && (t.parent = Q), t
                    }

                    function d(t) {
                        if (t >= H) throw new RangeError("Attempt to allocate Buffer larger than maximum size: 0x" + H.toString(16) + " bytes");
                        return 0 | t
                    }

                    function p(t, e) {
                        if (!(this instanceof p)) return new p(t, e);
                        var n = new r(t, e);
                        return delete n.parent, n
                    }

                    function m(t, e) {
                        if ("string" != typeof t && (t = String(t)), 0 === t.length) return 0;
                        switch (e || "utf8") {
                            case "ascii":
                            case "binary":
                            case "raw":
                                return t.length;
                            case "ucs2":
                            case "ucs-2":
                            case "utf16le":
                            case "utf-16le":
                                return 2 * t.length;
                            case "hex":
                                return t.length >>> 1;
                            case "utf8":
                            case "utf-8":
                                return F(t).length;
                            case "base64":
                                return W(t).length;
                            default:
                                return t.length
                        }
                    }

                    function g(t, e, n, r) {
                        n = Number(n) || 0;
                        var i = t.length - n;
                        r ? (r = Number(r), r > i && (r = i)) : r = i;
                        var o = e.length;
                        if (o % 2 !== 0) throw new Error("Invalid hex string");
                        r > o / 2 && (r = o / 2);
                        for (var a = 0; r > a; a++) {
                            var s = parseInt(e.substr(2 * a, 2), 16);
                            if (isNaN(s)) throw new Error("Invalid hex string");
                            t[n + a] = s
                        }
                        return a
                    }

                    function v(t, e, n, r) {
                        return V(F(e, t.length - n), t, n, r)
                    }

                    function E(t, e, n, r) {
                        return V(k(e), t, n, r)
                    }

                    function y(t, e, n, r) {
                        return E(t, e, n, r)
                    }

                    function b(t, e, n, r) {
                        return V(W(e), t, n, r)
                    }

                    function w(t, e, n, r) {
                        return V(U(e, t.length - n), t, n, r)
                    }

                    function _(t, e, n) {
                        return 0 === e && n === t.length ? z.fromByteArray(t) : z.fromByteArray(t.slice(e, n))
                    }

                    function O(t, e, n) {
                        var r = "",
                            i = "";
                        n = Math.min(t.length, n);
                        for (var o = e; n > o; o++) t[o] <= 127 ? (r += Y(i) + String.fromCharCode(t[o]), i = "") : i += "%" + t[o].toString(16);
                        return r + Y(i)
                    }

                    function R(t, e, n) {
                        var r = "";
                        n = Math.min(t.length, n);
                        for (var i = e; n > i; i++) r += String.fromCharCode(127 & t[i]);
                        return r
                    }

                    function I(t, e, n) {
                        var r = "";
                        n = Math.min(t.length, n);
                        for (var i = e; n > i; i++) r += String.fromCharCode(t[i]);
                        return r
                    }

                    function A(t, e, n) {
                        var r = t.length;
                        (!e || 0 > e) && (e = 0), (!n || 0 > n || n > r) && (n = r);
                        for (var i = "", o = e; n > o; o++) i += M(t[o]);
                        return i
                    }

                    function S(t, e, n) {
                        for (var r = t.slice(e, n), i = "", o = 0; o < r.length; o += 2) i += String.fromCharCode(r[o] + 256 * r[o + 1]);
                        return i
                    }

                    function T(t, e, n) {
                        if (t % 1 !== 0 || 0 > t) throw new RangeError("offset is not uint");
                        if (t + e > n) throw new RangeError("Trying to access beyond buffer length")
                    }

                    function x(t, e, n, i, o, a) {
                        if (!r.isBuffer(t)) throw new TypeError("buffer must be a Buffer instance");
                        if (e > o || a > e) throw new RangeError("value is out of bounds");
                        if (n + i > t.length) throw new RangeError("index out of range")
                    }

                    function L(t, e, n, r) {
                        0 > e && (e = 65535 + e + 1);
                        for (var i = 0, o = Math.min(t.length - n, 2); o > i; i++) t[n + i] = (e & 255 << 8 * (r ? i : 1 - i)) >>> 8 * (r ? i : 1 - i)
                    }

                    function j(t, e, n, r) {
                        0 > e && (e = 4294967295 + e + 1);
                        for (var i = 0, o = Math.min(t.length - n, 4); o > i; i++) t[n + i] = e >>> 8 * (r ? i : 3 - i) & 255
                    }

                    function D(t, e, n, r, i, o) {
                        if (e > i || o > e) throw new RangeError("value is out of bounds");
                        if (n + r > t.length) throw new RangeError("index out of range");
                        if (0 > n) throw new RangeError("index out of range")
                    }

                    function C(t, e, n, r, i) {
                        return i || D(t, e, n, 4, 3.4028234663852886e38, -3.4028234663852886e38), X.write(t, e, n, r, 23, 4), n + 4
                    }

                    function N(t, e, n, r, i) {
                        return i || D(t, e, n, 8, 1.7976931348623157e308, -1.7976931348623157e308), X.write(t, e, n, r, 52, 8), n + 8
                    }

                    function P(t) {
                        if (t = B(t).replace($, ""), t.length < 2) return "";
                        for (; t.length % 4 !== 0;) t += "=";
                        return t
                    }

                    function B(t) {
                        return t.trim ? t.trim() : t.replace(/^\s+|\s+$/g, "")
                    }

                    function M(t) {
                        return 16 > t ? "0" + t.toString(16) : t.toString(16)
                    }

                    function F(t, e) {
                        e = e || 1 / 0;
                        for (var n, r = t.length, i = null, o = [], a = 0; r > a; a++) {
                            if (n = t.charCodeAt(a), n > 55295 && 57344 > n) {
                                if (!i) {
                                    if (n > 56319) {
                                        (e -= 3) > -1 && o.push(239, 191, 189);
                                        continue
                                    }
                                    if (a + 1 === r) {
                                        (e -= 3) > -1 && o.push(239, 191, 189);
                                        continue
                                    }
                                    i = n;
                                    continue
                                }
                                if (56320 > n) {
                                    (e -= 3) > -1 && o.push(239, 191, 189), i = n;
                                    continue
                                }
                                n = i - 55296 << 10 | n - 56320 | 65536, i = null
                            } else i && ((e -= 3) > -1 && o.push(239, 191, 189), i = null);
                            if (128 > n) {
                                if ((e -= 1) < 0) break;
                                o.push(n)
                            } else if (2048 > n) {
                                if ((e -= 2) < 0) break;
                                o.push(n >> 6 | 192, 63 & n | 128)
                            } else if (65536 > n) {
                                if ((e -= 3) < 0) break;
                                o.push(n >> 12 | 224, n >> 6 & 63 | 128, 63 & n | 128)
                            } else {
                                if (!(2097152 > n)) throw new Error("Invalid code point");
                                if ((e -= 4) < 0) break;
                                o.push(n >> 18 | 240, n >> 12 & 63 | 128, n >> 6 & 63 | 128, 63 & n | 128)
                            }
                        }
                        return o
                    }

                    function k(t) {
                        for (var e = [], n = 0; n < t.length; n++) e.push(255 & t.charCodeAt(n));
                        return e
                    }

                    function U(t, e) {
                        for (var n, r, i, o = [], a = 0; a < t.length && !((e -= 2) < 0); a++) n = t.charCodeAt(a), r = n >> 8, i = n % 256, o.push(i), o.push(r);
                        return o
                    }

                    function W(t) {
                        return z.toByteArray(P(t))
                    }

                    function V(t, e, n, r) {
                        for (var i = 0; r > i && !(i + n >= e.length || i >= t.length); i++) e[i + n] = t[i];
                        return i
                    }

                    function Y(t) {
                        try {
                            return decodeURIComponent(t)
                        } catch (e) {
                            return String.fromCharCode(65533)
                        }
                    }
                    var z = t("base64-js"),
                        X = t("ieee754"),
                        q = t("is-array");
                    n.Buffer = r, n.SlowBuffer = p, n.INSPECT_MAX_BYTES = 50, r.poolSize = 8192;
                    var H = 1073741823,
                        Q = {};
                    r.TYPED_ARRAY_SUPPORT = function() {
                        try {
                            var t = new ArrayBuffer(0),
                                e = new Uint8Array(t);
                            return e.foo = function() {
                                return 42
                            }, 42 === e.foo() && "function" == typeof e.subarray && 0 === new Uint8Array(1).subarray(1, 1).byteLength
                        } catch (n) {
                            return !1
                        }
                    }(), r.isBuffer = function(t) {
                        return !(null == t || !t._isBuffer)
                    }, r.compare = function(t, e) {
                        if (!r.isBuffer(t) || !r.isBuffer(e)) throw new TypeError("Arguments must be Buffers");
                        if (t === e) return 0;
                        for (var n = t.length, i = e.length, o = 0, a = Math.min(n, i); a > o && t[o] === e[o];) ++o;
                        return o !== a && (n = t[o], i = e[o]), i > n ? -1 : n > i ? 1 : 0
                    }, r.isEncoding = function(t) {
                        switch (String(t).toLowerCase()) {
                            case "hex":
                            case "utf8":
                            case "utf-8":
                            case "ascii":
                            case "binary":
                            case "base64":
                            case "raw":
                            case "ucs2":
                            case "ucs-2":
                            case "utf16le":
                            case "utf-16le":
                                return !0;
                            default:
                                return !1
                        }
                    }, r.concat = function(t, e) {
                        if (!q(t)) throw new TypeError("list argument must be an Array of Buffers.");
                        if (0 === t.length) return new r(0);
                        if (1 === t.length) return t[0];
                        var n;
                        if (void 0 === e)
                            for (e = 0, n = 0; n < t.length; n++) e += t[n].length;
                        var i = new r(e),
                            o = 0;
                        for (n = 0; n < t.length; n++) {
                            var a = t[n];
                            a.copy(i, o), o += a.length
                        }
                        return i
                    }, r.byteLength = m, r.prototype.length = void 0, r.prototype.parent = void 0, r.prototype.toString = function(t, e, n) {
                        var r = !1;
                        if (e = 0 | e, n = void 0 === n || n === 1 / 0 ? this.length : 0 | n, t || (t = "utf8"), 0 > e && (e = 0), n > this.length && (n = this.length), e >= n) return "";
                        for (;;) switch (t) {
                            case "hex":
                                return A(this, e, n);
                            case "utf8":
                            case "utf-8":
                                return O(this, e, n);
                            case "ascii":
                                return R(this, e, n);
                            case "binary":
                                return I(this, e, n);
                            case "base64":
                                return _(this, e, n);
                            case "ucs2":
                            case "ucs-2":
                            case "utf16le":
                            case "utf-16le":
                                return S(this, e, n);
                            default:
                                if (r) throw new TypeError("Unknown encoding: " + t);
                                t = (t + "").toLowerCase(), r = !0
                        }
                    }, r.prototype.equals = function(t) {
                        if (!r.isBuffer(t)) throw new TypeError("Argument must be a Buffer");
                        return this === t ? !0 : 0 === r.compare(this, t)
                    }, r.prototype.inspect = function() {
                        var t = "",
                            e = n.INSPECT_MAX_BYTES;
                        return this.length > 0 && (t = this.toString("hex", 0, e).match(/.{2}/g).join(" "), this.length > e && (t += " ... ")), "<Buffer " + t + ">"
                    }, r.prototype.compare = function(t) {
                        if (!r.isBuffer(t)) throw new TypeError("Argument must be a Buffer");
                        return this === t ? 0 : r.compare(this, t)
                    }, r.prototype.indexOf = function(t, e) {
                        function n(t, e, n) {
                            for (var r = -1, i = 0; n + i < t.length; i++)
                                if (t[n + i] === e[-1 === r ? 0 : i - r]) {
                                    if (-1 === r && (r = i), i - r + 1 === e.length) return n + r
                                } else r = -1;
                            return -1
                        }
                        if (e > 2147483647 ? e = 2147483647 : -2147483648 > e && (e = -2147483648), e >>= 0, 0 === this.length) return -1;
                        if (e >= this.length) return -1;
                        if (0 > e && (e = Math.max(this.length + e, 0)), "string" == typeof t) return 0 === t.length ? -1 : String.prototype.indexOf.call(this, t, e);
                        if (r.isBuffer(t)) return n(this, t, e);
                        if ("number" == typeof t) return r.TYPED_ARRAY_SUPPORT && "function" === Uint8Array.prototype.indexOf ? Uint8Array.prototype.indexOf.call(this, t, e) : n(this, [t], e);
                        throw new TypeError("val must be string, number or Buffer")
                    }, r.prototype.get = function(t) {
                        return console.log(".get() is deprecated. Access using array indexes instead."), this.readUInt8(t)
                    }, r.prototype.set = function(t, e) {
                        return console.log(".set() is deprecated. Access using array indexes instead."), this.writeUInt8(t, e)
                    }, r.prototype.write = function(t, e, n, r) {
                        if (void 0 === e) r = "utf8", n = this.length, e = 0;
                        else if (void 0 === n && "string" == typeof e) r = e, n = this.length, e = 0;
                        else if (isFinite(e)) e = 0 | e, isFinite(n) ? (n = 0 | n, void 0 === r && (r = "utf8")) : (r = n, n = void 0);
                        else {
                            var i = r;
                            r = e, e = 0 | n, n = i
                        }
                        var o = this.length - e;
                        if ((void 0 === n || n > o) && (n = o), t.length > 0 && (0 > n || 0 > e) || e > this.length) throw new RangeError("attempt to write outside buffer bounds");
                        r || (r = "utf8");
                        for (var a = !1;;) switch (r) {
                            case "hex":
                                return g(this, t, e, n);
                            case "utf8":
                            case "utf-8":
                                return v(this, t, e, n);
                            case "ascii":
                                return E(this, t, e, n);
                            case "binary":
                                return y(this, t, e, n);
                            case "base64":
                                return b(this, t, e, n);
                            case "ucs2":
                            case "ucs-2":
                            case "utf16le":
                            case "utf-16le":
                                return w(this, t, e, n);
                            default:
                                if (a) throw new TypeError("Unknown encoding: " + r);
                                r = ("" + r).toLowerCase(), a = !0
                        }
                    }, r.prototype.toJSON = function() {
                        return {
                            type: "Buffer",
                            data: Array.prototype.slice.call(this._arr || this, 0)
                        }
                    }, r.prototype.slice = function(t, e) {
                        var n = this.length;
                        t = ~~t, e = void 0 === e ? n : ~~e, 0 > t ? (t += n, 0 > t && (t = 0)) : t > n && (t = n), 0 > e ? (e += n, 0 > e && (e = 0)) : e > n && (e = n), t > e && (e = t);
                        var i;
                        if (r.TYPED_ARRAY_SUPPORT) i = r._augment(this.subarray(t, e));
                        else {
                            var o = e - t;
                            i = new r(o, void 0);
                            for (var a = 0; o > a; a++) i[a] = this[a + t]
                        }
                        return i.length && (i.parent = this.parent || this), i
                    }, r.prototype.readUIntLE = function(t, e, n) {
                        t = 0 | t, e = 0 | e, n || T(t, e, this.length);
                        for (var r = this[t], i = 1, o = 0; ++o < e && (i *= 256);) r += this[t + o] * i;
                        return r
                    }, r.prototype.readUIntBE = function(t, e, n) {
                        t = 0 | t, e = 0 | e, n || T(t, e, this.length);
                        for (var r = this[t + --e], i = 1; e > 0 && (i *= 256);) r += this[t + --e] * i;
                        return r
                    }, r.prototype.readUInt8 = function(t, e) {
                        return e || T(t, 1, this.length), this[t]
                    }, r.prototype.readUInt16LE = function(t, e) {
                        return e || T(t, 2, this.length), this[t] | this[t + 1] << 8
                    }, r.prototype.readUInt16BE = function(t, e) {
                        return e || T(t, 2, this.length), this[t] << 8 | this[t + 1]
                    }, r.prototype.readUInt32LE = function(t, e) {
                        return e || T(t, 4, this.length), (this[t] | this[t + 1] << 8 | this[t + 2] << 16) + 16777216 * this[t + 3]
                    }, r.prototype.readUInt32BE = function(t, e) {
                        return e || T(t, 4, this.length), 16777216 * this[t] + (this[t + 1] << 16 | this[t + 2] << 8 | this[t + 3])
                    }, r.prototype.readIntLE = function(t, e, n) {
                        t = 0 | t, e = 0 | e, n || T(t, e, this.length);
                        for (var r = this[t], i = 1, o = 0; ++o < e && (i *= 256);) r += this[t + o] * i;
                        return i *= 128, r >= i && (r -= Math.pow(2, 8 * e)), r
                    }, r.prototype.readIntBE = function(t, e, n) {
                        t = 0 | t, e = 0 | e, n || T(t, e, this.length);
                        for (var r = e, i = 1, o = this[t + --r]; r > 0 && (i *= 256);) o += this[t + --r] * i;
                        return i *= 128, o >= i && (o -= Math.pow(2, 8 * e)), o
                    }, r.prototype.readInt8 = function(t, e) {
                        return e || T(t, 1, this.length), 128 & this[t] ? -1 * (255 - this[t] + 1) : this[t]
                    }, r.prototype.readInt16LE = function(t, e) {
                        e || T(t, 2, this.length);
                        var n = this[t] | this[t + 1] << 8;
                        return 32768 & n ? 4294901760 | n : n
                    }, r.prototype.readInt16BE = function(t, e) {
                        e || T(t, 2, this.length);
                        var n = this[t + 1] | this[t] << 8;
                        return 32768 & n ? 4294901760 | n : n
                    }, r.prototype.readInt32LE = function(t, e) {
                        return e || T(t, 4, this.length), this[t] | this[t + 1] << 8 | this[t + 2] << 16 | this[t + 3] << 24
                    }, r.prototype.readInt32BE = function(t, e) {
                        return e || T(t, 4, this.length), this[t] << 24 | this[t + 1] << 16 | this[t + 2] << 8 | this[t + 3]
                    }, r.prototype.readFloatLE = function(t, e) {
                        return e || T(t, 4, this.length), X.read(this, t, !0, 23, 4)
                    }, r.prototype.readFloatBE = function(t, e) {
                        return e || T(t, 4, this.length), X.read(this, t, !1, 23, 4)
                    }, r.prototype.readDoubleLE = function(t, e) {
                        return e || T(t, 8, this.length), X.read(this, t, !0, 52, 8)
                    }, r.prototype.readDoubleBE = function(t, e) {
                        return e || T(t, 8, this.length), X.read(this, t, !1, 52, 8)
                    }, r.prototype.writeUIntLE = function(t, e, n, r) {
                        t = +t, e = 0 | e, n = 0 | n, r || x(this, t, e, n, Math.pow(2, 8 * n), 0);
                        var i = 1,
                            o = 0;
                        for (this[e] = 255 & t; ++o < n && (i *= 256);) this[e + o] = t / i & 255;
                        return e + n
                    }, r.prototype.writeUIntBE = function(t, e, n, r) {
                        t = +t, e = 0 | e, n = 0 | n, r || x(this, t, e, n, Math.pow(2, 8 * n), 0);
                        var i = n - 1,
                            o = 1;
                        for (this[e + i] = 255 & t; --i >= 0 && (o *= 256);) this[e + i] = t / o & 255;
                        return e + n
                    }, r.prototype.writeUInt8 = function(t, e, n) {
                        return t = +t, e = 0 | e, n || x(this, t, e, 1, 255, 0), r.TYPED_ARRAY_SUPPORT || (t = Math.floor(t)), this[e] = t, e + 1
                    }, r.prototype.writeUInt16LE = function(t, e, n) {
                        return t = +t, e = 0 | e, n || x(this, t, e, 2, 65535, 0), r.TYPED_ARRAY_SUPPORT ? (this[e] = t, this[e + 1] = t >>> 8) : L(this, t, e, !0), e + 2
                    }, r.prototype.writeUInt16BE = function(t, e, n) {
                        return t = +t, e = 0 | e, n || x(this, t, e, 2, 65535, 0), r.TYPED_ARRAY_SUPPORT ? (this[e] = t >>> 8, this[e + 1] = t) : L(this, t, e, !1), e + 2
                    }, r.prototype.writeUInt32LE = function(t, e, n) {
                        return t = +t, e = 0 | e, n || x(this, t, e, 4, 4294967295, 0), r.TYPED_ARRAY_SUPPORT ? (this[e + 3] = t >>> 24, this[e + 2] = t >>> 16, this[e + 1] = t >>> 8, this[e] = t) : j(this, t, e, !0), e + 4
                    }, r.prototype.writeUInt32BE = function(t, e, n) {
                        return t = +t, e = 0 | e, n || x(this, t, e, 4, 4294967295, 0), r.TYPED_ARRAY_SUPPORT ? (this[e] = t >>> 24, this[e + 1] = t >>> 16, this[e + 2] = t >>> 8, this[e + 3] = t) : j(this, t, e, !1), e + 4
                    }, r.prototype.writeIntLE = function(t, e, n, r) {
                        if (t = +t, e = 0 | e, !r) {
                            var i = Math.pow(2, 8 * n - 1);
                            x(this, t, e, n, i - 1, -i)
                        }
                        var o = 0,
                            a = 1,
                            s = 0 > t ? 1 : 0;
                        for (this[e] = 255 & t; ++o < n && (a *= 256);) this[e + o] = (t / a >> 0) - s & 255;
                        return e + n
                    }, r.prototype.writeIntBE = function(t, e, n, r) {
                        if (t = +t, e = 0 | e, !r) {
                            var i = Math.pow(2, 8 * n - 1);
                            x(this, t, e, n, i - 1, -i)
                        }
                        var o = n - 1,
                            a = 1,
                            s = 0 > t ? 1 : 0;
                        for (this[e + o] = 255 & t; --o >= 0 && (a *= 256);) this[e + o] = (t / a >> 0) - s & 255;
                        return e + n
                    }, r.prototype.writeInt8 = function(t, e, n) {
                        return t = +t, e = 0 | e, n || x(this, t, e, 1, 127, -128), r.TYPED_ARRAY_SUPPORT || (t = Math.floor(t)), 0 > t && (t = 255 + t + 1), this[e] = t, e + 1
                    }, r.prototype.writeInt16LE = function(t, e, n) {
                        return t = +t, e = 0 | e, n || x(this, t, e, 2, 32767, -32768), r.TYPED_ARRAY_SUPPORT ? (this[e] = t, this[e + 1] = t >>> 8) : L(this, t, e, !0), e + 2
                    }, r.prototype.writeInt16BE = function(t, e, n) {
                        return t = +t, e = 0 | e, n || x(this, t, e, 2, 32767, -32768), r.TYPED_ARRAY_SUPPORT ? (this[e] = t >>> 8, this[e + 1] = t) : L(this, t, e, !1), e + 2
                    }, r.prototype.writeInt32LE = function(t, e, n) {
                        return t = +t, e = 0 | e, n || x(this, t, e, 4, 2147483647, -2147483648), r.TYPED_ARRAY_SUPPORT ? (this[e] = t, this[e + 1] = t >>> 8, this[e + 2] = t >>> 16, this[e + 3] = t >>> 24) : j(this, t, e, !0), e + 4
                    }, r.prototype.writeInt32BE = function(t, e, n) {
                        return t = +t, e = 0 | e, n || x(this, t, e, 4, 2147483647, -2147483648), 0 > t && (t = 4294967295 + t + 1), r.TYPED_ARRAY_SUPPORT ? (this[e] = t >>> 24, this[e + 1] = t >>> 16, this[e + 2] = t >>> 8, this[e + 3] = t) : j(this, t, e, !1), e + 4
                    }, r.prototype.writeFloatLE = function(t, e, n) {
                        return C(this, t, e, !0, n)
                    }, r.prototype.writeFloatBE = function(t, e, n) {
                        return C(this, t, e, !1, n)
                    }, r.prototype.writeDoubleLE = function(t, e, n) {
                        return N(this, t, e, !0, n)
                    }, r.prototype.writeDoubleBE = function(t, e, n) {
                        return N(this, t, e, !1, n)
                    }, r.prototype.copy = function(t, e, n, i) {
                        if (n || (n = 0), i || 0 === i || (i = this.length), e >= t.length && (e = t.length), e || (e = 0), i > 0 && n > i && (i = n), i === n) return 0;
                        if (0 === t.length || 0 === this.length) return 0;
                        if (0 > e) throw new RangeError("targetStart out of bounds");
                        if (0 > n || n >= this.length) throw new RangeError("sourceStart out of bounds");
                        if (0 > i) throw new RangeError("sourceEnd out of bounds");
                        i > this.length && (i = this.length), t.length - e < i - n && (i = t.length - e + n);
                        var o = i - n;
                        if (1e3 > o || !r.TYPED_ARRAY_SUPPORT)
                            for (var a = 0; o > a; a++) t[a + e] = this[a + n];
                        else t._set(this.subarray(n, n + o), e);
                        return o
                    }, r.prototype.fill = function(t, e, n) {
                        if (t || (t = 0), e || (e = 0), n || (n = this.length), e > n) throw new RangeError("end < start");
                        if (n !== e && 0 !== this.length) {
                            if (0 > e || e >= this.length) throw new RangeError("start out of bounds");
                            if (0 > n || n > this.length) throw new RangeError("end out of bounds");
                            var r;
                            if ("number" == typeof t)
                                for (r = e; n > r; r++) this[r] = t;
                            else {
                                var i = F(t.toString()),
                                    o = i.length;
                                for (r = e; n > r; r++) this[r] = i[r % o]
                            }
                            return this
                        }
                    }, r.prototype.toArrayBuffer = function() {
                        if ("undefined" != typeof Uint8Array) {
                            if (r.TYPED_ARRAY_SUPPORT) return new r(this).buffer;
                            for (var t = new Uint8Array(this.length), e = 0, n = t.length; n > e; e += 1) t[e] = this[e];
                            return t.buffer
                        }
                        throw new TypeError("Buffer.toArrayBuffer not supported in this browser")
                    };
                    var J = r.prototype;
                    r._augment = function(t) {
                        return t.constructor = r, t._isBuffer = !0, t._set = t.set, t.get = J.get, t.set = J.set, t.write = J.write, t.toString = J.toString, t.toLocaleString = J.toString, t.toJSON = J.toJSON, t.equals = J.equals, t.compare = J.compare, t.indexOf = J.indexOf, t.copy = J.copy, t.slice = J.slice, t.readUIntLE = J.readUIntLE, t.readUIntBE = J.readUIntBE, t.readUInt8 = J.readUInt8, t.readUInt16LE = J.readUInt16LE, t.readUInt16BE = J.readUInt16BE, t.readUInt32LE = J.readUInt32LE, t.readUInt32BE = J.readUInt32BE, t.readIntLE = J.readIntLE, t.readIntBE = J.readIntBE, t.readInt8 = J.readInt8, t.readInt16LE = J.readInt16LE, t.readInt16BE = J.readInt16BE, t.readInt32LE = J.readInt32LE, t.readInt32BE = J.readInt32BE, t.readFloatLE = J.readFloatLE, t.readFloatBE = J.readFloatBE, t.readDoubleLE = J.readDoubleLE, t.readDoubleBE = J.readDoubleBE, t.writeUInt8 = J.writeUInt8, t.writeUIntLE = J.writeUIntLE, t.writeUIntBE = J.writeUIntBE, t.writeUInt16LE = J.writeUInt16LE, t.writeUInt16BE = J.writeUInt16BE, t.writeUInt32LE = J.writeUInt32LE, t.writeUInt32BE = J.writeUInt32BE, t.writeIntLE = J.writeIntLE, t.writeIntBE = J.writeIntBE, t.writeInt8 = J.writeInt8, t.writeInt16LE = J.writeInt16LE, t.writeInt16BE = J.writeInt16BE, t.writeInt32LE = J.writeInt32LE, t.writeInt32BE = J.writeInt32BE, t.writeFloatLE = J.writeFloatLE, t.writeFloatBE = J.writeFloatBE, t.writeDoubleLE = J.writeDoubleLE, t.writeDoubleBE = J.writeDoubleBE, t.fill = J.fill, t.inspect = J.inspect, t.toArrayBuffer = J.toArrayBuffer, t
                    };
                    var $ = /[^+\/0-9A-z\-]/g
                }, {
                    "base64-js": 7,
                    ieee754: 8,
                    "is-array": 9
                }],
                7: [function(t, e, n) {
                    var r = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
                    ! function(t) {
                        "use strict";

                        function e(t) {
                            var e = t.charCodeAt(0);
                            return e === a || e === l ? 62 : e === s || e === h ? 63 : u > e ? -1 : u + 10 > e ? e - u + 26 + 26 : f + 26 > e ? e - f : c + 26 > e ? e - c + 26 : void 0
                        }

                        function n(t) {
                            function n(t) {
                                c[l++] = t
                            }
                            var r, i, a, s, u, c;
                            if (t.length % 4 > 0) throw new Error("Invalid string. Length must be a multiple of 4");
                            var f = t.length;
                            u = "=" === t.charAt(f - 2) ? 2 : "=" === t.charAt(f - 1) ? 1 : 0, c = new o(3 * t.length / 4 - u), a = u > 0 ? t.length - 4 : t.length;
                            var l = 0;
                            for (r = 0, i = 0; a > r; r += 4, i += 3) s = e(t.charAt(r)) << 18 | e(t.charAt(r + 1)) << 12 | e(t.charAt(r + 2)) << 6 | e(t.charAt(r + 3)), n((16711680 & s) >> 16), n((65280 & s) >> 8), n(255 & s);
                            return 2 === u ? (s = e(t.charAt(r)) << 2 | e(t.charAt(r + 1)) >> 4, n(255 & s)) : 1 === u && (s = e(t.charAt(r)) << 10 | e(t.charAt(r + 1)) << 4 | e(t.charAt(r + 2)) >> 2, n(s >> 8 & 255), n(255 & s)), c
                        }

                        function i(t) {
                            function e(t) {
                                return r.charAt(t)
                            }

                            function n(t) {
                                return e(t >> 18 & 63) + e(t >> 12 & 63) + e(t >> 6 & 63) + e(63 & t)
                            }
                            var i, o, a, s = t.length % 3,
                                u = "";
                            for (i = 0, a = t.length - s; a > i; i += 3) o = (t[i] << 16) + (t[i + 1] << 8) + t[i + 2], u += n(o);
                            switch (s) {
                                case 1:
                                    o = t[t.length - 1], u += e(o >> 2), u += e(o << 4 & 63), u += "==";
                                    break;
                                case 2:
                                    o = (t[t.length - 2] << 8) + t[t.length - 1], u += e(o >> 10), u += e(o >> 4 & 63), u += e(o << 2 & 63), u += "="
                            }
                            return u
                        }
                        var o = "undefined" != typeof Uint8Array ? Uint8Array : Array,
                            a = "+".charCodeAt(0),
                            s = "/".charCodeAt(0),
                            u = "0".charCodeAt(0),
                            c = "a".charCodeAt(0),
                            f = "A".charCodeAt(0),
                            l = "-".charCodeAt(0),
                            h = "_".charCodeAt(0);
                        t.toByteArray = n, t.fromByteArray = i
                    }("undefined" == typeof n ? this.base64js = {} : n)
                }, {}],
                8: [function(t, e, n) {
                    n.read = function(t, e, n, r, i) {
                        var o, a, s = 8 * i - r - 1,
                            u = (1 << s) - 1,
                            c = u >> 1,
                            f = -7,
                            l = n ? i - 1 : 0,
                            h = n ? -1 : 1,
                            d = t[e + l];
                        for (l += h, o = d & (1 << -f) - 1, d >>= -f, f += s; f > 0; o = 256 * o + t[e + l], l += h, f -= 8);
                        for (a = o & (1 << -f) - 1, o >>= -f, f += r; f > 0; a = 256 * a + t[e + l], l += h, f -= 8);
                        if (0 === o) o = 1 - c;
                        else {
                            if (o === u) return a ? NaN : (d ? -1 : 1) * (1 / 0);
                            a += Math.pow(2, r), o -= c
                        }
                        return (d ? -1 : 1) * a * Math.pow(2, o - r)
                    }, n.write = function(t, e, n, r, i, o) {
                        var a, s, u, c = 8 * o - i - 1,
                            f = (1 << c) - 1,
                            l = f >> 1,
                            h = 23 === i ? Math.pow(2, -24) - Math.pow(2, -77) : 0,
                            d = r ? 0 : o - 1,
                            p = r ? 1 : -1,
                            m = 0 > e || 0 === e && 0 > 1 / e ? 1 : 0;
                        for (e = Math.abs(e), isNaN(e) || e === 1 / 0 ? (s = isNaN(e) ? 1 : 0, a = f) : (a = Math.floor(Math.log(e) / Math.LN2), e * (u = Math.pow(2, -a)) < 1 && (a--, u *= 2), e += a + l >= 1 ? h / u : h * Math.pow(2, 1 - l), e * u >= 2 && (a++, u /= 2), a + l >= f ? (s = 0, a = f) : a + l >= 1 ? (s = (e * u - 1) * Math.pow(2, i), a += l) : (s = e * Math.pow(2, l - 1) * Math.pow(2, i), a = 0)); i >= 8; t[n + d] = 255 & s, d += p, s /= 256, i -= 8);
                        for (a = a << i | s, c += i; c > 0; t[n + d] = 255 & a, d += p, a /= 256, c -= 8);
                        t[n + d - p] |= 128 * m
                    }
                }, {}],
                9: [function(t, e, n) {
                    var r = Array.isArray,
                        i = Object.prototype.toString;
                    e.exports = r || function(t) {
                        return !!t && "[object Array]" == i.call(t)
                    }
                }, {}],
                10: [function(t, e, n) {
                    function r(t, e) {
                        for (var n = 0, r = t.length - 1; r >= 0; r--) {
                            var i = t[r];
                            "." === i ? t.splice(r, 1) : ".." === i ? (t.splice(r, 1), n++) : n && (t.splice(r, 1), n--)
                        }
                        if (e)
                            for (; n--; n) t.unshift("..");
                        return t
                    }

                    function i(t, e) {
                        if (t.filter) return t.filter(e);
                        for (var n = [], r = 0; r < t.length; r++) e(t[r], r, t) && n.push(t[r]);
                        return n
                    }
                    var o = /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/,
                        a = function(t) {
                            return o.exec(t).slice(1)
                        };
                    n.resolve = function() {
                        for (var t = "", e = !1, n = arguments.length - 1; n >= -1 && !e; n--) {
                            var o = n >= 0 ? arguments[n] : process.cwd();
                            if ("string" != typeof o) throw new TypeError("Arguments to path.resolve must be strings");
                            o && (t = o + "/" + t, e = "/" === o.charAt(0))
                        }
                        return t = r(i(t.split("/"), function(t) {
                            return !!t
                        }), !e).join("/"), (e ? "/" : "") + t || "."
                    }, n.normalize = function(t) {
                        var e = n.isAbsolute(t),
                            o = "/" === s(t, -1);
                        return t = r(i(t.split("/"), function(t) {
                            return !!t
                        }), !e).join("/"), t || e || (t = "."), t && o && (t += "/"), (e ? "/" : "") + t
                    }, n.isAbsolute = function(t) {
                        return "/" === t.charAt(0)
                    }, n.join = function() {
                        var t = Array.prototype.slice.call(arguments, 0);
                        return n.normalize(i(t, function(t, e) {
                            if ("string" != typeof t) throw new TypeError("Arguments to path.join must be strings");
                            return t
                        }).join("/"))
                    }, n.relative = function(t, e) {
                        function r(t) {
                            for (var e = 0; e < t.length && "" === t[e]; e++);
                            for (var n = t.length - 1; n >= 0 && "" === t[n]; n--);
                            return e > n ? [] : t.slice(e, n - e + 1)
                        }
                        t = n.resolve(t).substr(1), e = n.resolve(e).substr(1);
                        for (var i = r(t.split("/")), o = r(e.split("/")), a = Math.min(i.length, o.length), s = a, u = 0; a > u; u++)
                            if (i[u] !== o[u]) {
                                s = u;
                                break
                            }
                        for (var c = [], u = s; u < i.length; u++) c.push("..");
                        return c = c.concat(o.slice(s)), c.join("/")
                    }, n.sep = "/", n.delimiter = ":", n.dirname = function(t) {
                        var e = a(t),
                            n = e[0],
                            r = e[1];
                        return n || r ? (r && (r = r.substr(0, r.length - 1)), n + r) : "."
                    }, n.basename = function(t, e) {
                        var n = a(t)[2];
                        return e && n.substr(-1 * e.length) === e && (n = n.substr(0, n.length - e.length)), n
                    }, n.extname = function(t) {
                        return a(t)[3]
                    };
                    var s = "b" === "ab".substr(-1) ? function(t, e, n) {
                        return t.substr(e, n)
                    } : function(t, e, n) {
                        return 0 > e && (e = t.length + e), t.substr(e, n)
                    }
                }, {}],
                11: [function(t, e, n) {
                    ! function(t, e, n, r) {
                        function i(t) {
                            return t.split("").reduce(function(t, e) {
                                return t[e] = !0, t
                            }, {})
                        }

                        function o(t, e) {
                            return e = e || {},
                                function(n, r, i) {
                                    return s(n, t, e)
                                }
                        }

                        function a(t, e) {
                            t = t || {}, e = e || {};
                            var n = {};
                            return Object.keys(e).forEach(function(t) {
                                n[t] = e[t]
                            }), Object.keys(t).forEach(function(e) {
                                n[e] = t[e]
                            }), n
                        }

                        function s(t, e, n) {
                            if ("string" != typeof e) throw new TypeError("glob pattern string required");
                            return n || (n = {}), n.nocomment || "#" !== e.charAt(0) ? "" === e.trim() ? "" === t : new u(e, n).match(t) : !1
                        }

                        function u(t, e) {
                            if (!(this instanceof u)) return new u(t, e, y);
                            if ("string" != typeof t) throw new TypeError("glob pattern string required");
                            e || (e = {}), t = t.trim(), "win32" === r && (t = t.split("\\").join("/"));
                            var n = t + "\n" + w(e),
                                i = s.cache.get(n);
                            return i ? i : (s.cache.set(n, this), this.options = e, this.set = [], this.pattern = t, this.regexp = null, this.negate = !1, this.comment = !1, this.empty = !1, void this.make())
                        }

                        function c() {
                            if (!this._made) {
                                var t = this.pattern,
                                    e = this.options;
                                if (!e.nocomment && "#" === t.charAt(0)) return void(this.comment = !0);
                                if (!t) return void(this.empty = !0);
                                this.parseNegate();
                                var n = this.globSet = this.braceExpand();
                                e.debug && (this.debug = console.error), this.debug(this.pattern, n), n = this.globParts = n.map(function(t) {
                                    return t.split(S)
                                }), this.debug(this.pattern, n), n = n.map(function(t, e, n) {
                                    return t.map(this.parse, this)
                                }, this), this.debug(this.pattern, n), n = n.filter(function(t) {
                                    return -1 === t.indexOf(!1)
                                }), this.debug(this.pattern, n), this.set = n
                            }
                        }

                        function f() {
                            var t = this.pattern,
                                e = !1,
                                n = this.options,
                                r = 0;
                            if (!n.nonegate) {
                                for (var i = 0, o = t.length; o > i && "!" === t.charAt(i); i++) e = !e, r++;
                                r && (this.pattern = t.substr(r)), this.negate = e
                            }
                        }

                        function l(t, e, n) {
                            return n = n || "0", t += "", t.length >= e ? t : new Array(e - t.length + 1).join(n) + t
                        }

                        function h(t, e) {
                            function n() {
                                y.push(O), O = ""
                            }
                            if (e = e || this.options, t = "undefined" == typeof t ? this.pattern : t, "undefined" == typeof t) throw new Error("undefined pattern");
                            if (e.nobrace || !t.match(/\{.*\}/)) return [t];
                            var r = !1;
                            if ("{" !== t.charAt(0)) {
                                this.debug(t);
                                for (var i = null, o = 0, a = t.length; a > o; o++) {
                                    var s = t.charAt(o);
                                    if (this.debug(o, s), "\\" === s) r = !r;
                                    else if ("{" === s && !r) {
                                        i = t.substr(0, o);
                                        break
                                    }
                                }
                                if (null === i) return this.debug("no sets"), [t];
                                var u = h.call(this, t.substr(o), e);
                                return u.map(function(t) {
                                    return i + t
                                })
                            }
                            var c = t.match(/^\{(-?[0-9]+)\.\.(-?[0-9]+)\}/);
                            if (c) {
                                this.debug("numset", c[1], c[2]);
                                for (var f, d = h.call(this, t.substr(c[0].length), e), p = +c[1], m = "0" === c[1][0], g = c[1].length, v = +c[2], E = p > v ? -1 : 1, y = [], o = p; o != v + E; o += E) {
                                    f = m ? l(o, g) : o + "";
                                    for (var b = 0, w = d.length; w > b; b++) y.push(f + d[b])
                                }
                                return y
                            }
                            var o = 1,
                                _ = 1,
                                y = [],
                                O = "",
                                r = !1;
                            this.debug("Entering for");
                            t: for (o = 1, a = t.length; a > o; o++) {
                                var s = t.charAt(o);
                                if (this.debug("", o, s), r) r = !1, O += "\\" + s;
                                else switch (s) {
                                    case "\\":
                                        r = !0;
                                        continue;
                                    case "{":
                                        _++, O += "{";
                                        continue;
                                    case "}":
                                        if (_--, 0 === _) {
                                            n(), o++;
                                            break t
                                        }
                                        O += s;
                                        continue;
                                    case ",":
                                        1 === _ ? n() : O += s;
                                        continue;
                                    default:
                                        O += s;
                                        continue
                                }
                            }
                            if (0 !== _) return this.debug("didn't close", t), h.call(this, "\\" + t, e);
                            this.debug("set", y), this.debug("suffix", t.substr(o));
                            var d = h.call(this, t.substr(o), e),
                                R = 1 === y.length;
                            this.debug("set pre-expanded", y), y = y.map(function(t) {
                                return h.call(this, t, e)
                            }, this), this.debug("set expanded", y), y = y.reduce(function(t, e) {
                                return t.concat(e)
                            }), R && (y = y.map(function(t) {
                                return "{" + t + "}"
                            }));
                            for (var I = [], o = 0, a = y.length; a > o; o++)
                                for (var b = 0, w = d.length; w > b; b++) I.push(y[o] + d[b]);
                            return I
                        }

                        function d(t, e) {
                            function n() {
                                if (o) {
                                    switch (o) {
                                        case "*":
                                            s += O, u = !0;
                                            break;
                                        case "?":
                                            s += _, u = !0;
                                            break;
                                        default:
                                            s += "\\" + o
                                    }
                                    m.debug("clearStateChar %j %j", o, s), o = !1
                                }
                            }
                            var r = this.options;
                            if (!r.noglobstar && "**" === t) return b;
                            if ("" === t) return "";
                            for (var i, o, a, s = "", u = !!r.nocase, c = !1, f = [], l = !1, h = -1, d = -1, p = "." === t.charAt(0) ? "" : r.dot ? "(?!(?:^|\\/)\\.{1,2}(?:$|\\/))" : "(?!\\.)", m = this, v = 0, E = t.length; E > v && (a = t.charAt(v)); v++)
                                if (this.debug("%s	%s %s %j", t, v, s, a), c && A[a]) s += "\\" + a, c = !1;
                                else switch (a) {
                                    case "/":
                                        return !1;
                                    case "\\":
                                        n(), c = !0;
                                        continue;
                                    case "?":
                                    case "*":
                                    case "+":
                                    case "@":
                                    case "!":
                                        if (this.debug("%s	%s %s %j <-- stateChar", t, v, s, a), l) {
                                            this.debug("  in class"), "!" === a && v === d + 1 && (a = "^"), s += a;
                                            continue
                                        }
                                        m.debug("call clearStateChar %j", o), n(), o = a, r.noext && n();
                                        continue;
                                    case "(":
                                        if (l) {
                                            s += "(";
                                            continue
                                        }
                                        if (!o) {
                                            s += "\\(";
                                            continue
                                        }
                                        i = o, f.push({
                                            type: i,
                                            start: v - 1,
                                            reStart: s.length
                                        }), s += "!" === o ? "(?:(?!" : "(?:", this.debug("plType %j %j", o, s), o = !1;
                                        continue;
                                    case ")":
                                        if (l || !f.length) {
                                            s += "\\)";
                                            continue
                                        }
                                        switch (n(), u = !0, s += ")", i = f.pop().type) {
                                            case "!":
                                                s += "[^/]*?)";
                                                break;
                                            case "?":
                                            case "+":
                                            case "*":
                                                s += i;
                                            case "@":
                                        }
                                        continue;
                                    case "|":
                                        if (l || !f.length || c) {
                                            s += "\\|", c = !1;
                                            continue
                                        }
                                        n(), s += "|";
                                        continue;
                                    case "[":
                                        if (n(), l) {
                                            s += "\\" + a;
                                            continue
                                        }
                                        l = !0, d = v, h = s.length, s += a;
                                        continue;
                                    case "]":
                                        if (v === d + 1 || !l) {
                                            s += "\\" + a, c = !1;
                                            continue
                                        }
                                        u = !0, l = !1, s += a;
                                        continue;
                                    default:
                                        n(), c ? c = !1 : !A[a] || "^" === a && l || (s += "\\"), s += a
                                }
                            if (l) {
                                var y = t.substr(d + 1),
                                    w = this.parse(y, T);
                                s = s.substr(0, h) + "\\[" + w[0], u = u || w[1]
                            }
                            for (var R; R = f.pop();) {
                                var I = s.slice(R.reStart + 3);
                                I = I.replace(/((?:\\{2})*)(\\?)\|/g, function(t, e, n) {
                                    return n || (n = "\\"), e + e + n + "|"
                                }), this.debug("tail=%j\n   %s", I, I);
                                var S = "*" === R.type ? O : "?" === R.type ? _ : "\\" + R.type;
                                u = !0, s = s.slice(0, R.reStart) + S + "\\(" + I
                            }
                            n(), c && (s += "\\\\");
                            var x = !1;
                            switch (s.charAt(0)) {
                                case ".":
                                case "[":
                                case "(":
                                    x = !0
                            }
                            if ("" !== s && u && (s = "(?=.)" + s), x && (s = p + s), e === T) return [s, u];
                            if (!u) return g(t);
                            var L = r.nocase ? "i" : "",
                                j = new RegExp("^" + s + "$", L);
                            return j._glob = t, j._src = s, j
                        }

                        function p() {
                            if (this.regexp || this.regexp === !1) return this.regexp;
                            var t = this.set;
                            if (!t.length) return this.regexp = !1;
                            var e = this.options,
                                n = e.noglobstar ? O : e.dot ? R : I,
                                r = e.nocase ? "i" : "",
                                i = t.map(function(t) {
                                    return t.map(function(t) {
                                        return t === b ? n : "string" == typeof t ? v(t) : t._src
                                    }).join("\\/")
                                }).join("|");
                            i = "^(?:" + i + ")$", this.negate && (i = "^(?!" + i + ").*$");
                            try {
                                return this.regexp = new RegExp(i, r)
                            } catch (o) {
                                return this.regexp = !1
                            }
                        }

                        function m(t, e) {
                            if (this.debug("match", t, this.pattern), this.comment) return !1;
                            if (this.empty) return "" === t;
                            if ("/" === t && e) return !0;
                            var n = this.options;
                            "win32" === r && (t = t.split("\\").join("/")), t = t.split(S), this.debug(this.pattern, "split", t);
                            var i = this.set;
                            this.debug(this.pattern, "set", i);
                            for (var o, a = t.length - 1; a >= 0 && !(o = t[a]); a--);
                            for (var a = 0, s = i.length; s > a; a++) {
                                var u = i[a],
                                    c = t;
                                n.matchBase && 1 === u.length && (c = [o]);
                                var f = this.matchOne(c, u, e);
                                if (f) return n.flipNegate ? !0 : !this.negate
                            }
                            return n.flipNegate ? !1 : this.negate
                        }

                        function g(t) {
                            return t.replace(/\\(.)/g, "$1")
                        }

                        function v(t) {
                            return t.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&")
                        }
                        n ? n.exports = s : e.minimatch = s, t || (t = function(t) {
                            switch (t) {
                                case "sigmund":
                                    return function(t) {
                                        return JSON.stringify(t)
                                    };
                                case "path":
                                    return {
                                        basename: function(t) {
                                            t = t.split(/[\/\\]/);
                                            var e = t.pop();
                                            return e || (e = t.pop()), e
                                        }
                                    };
                                case "lru-cache":
                                    return function() {
                                        var t = {},
                                            e = 0;
                                        this.set = function(n, r) {
                                            e++, e >= 100 && (t = {}), t[n] = r
                                        }, this.get = function(e) {
                                            return t[e]
                                        }
                                    }
                            }
                        }), s.Minimatch = u;
                        var E = t("lru-cache"),
                            y = s.cache = new E({
                                max: 100
                            }),
                            b = s.GLOBSTAR = u.GLOBSTAR = {},
                            w = t("sigmund"),
                            _ = (t("path"), "[^/]"),
                            O = _ + "*?",
                            R = "(?:(?!(?:\\/|^)(?:\\.{1,2})($|\\/)).)*?",
                            I = "(?:(?!(?:\\/|^)\\.).)*?",
                            A = i("().*{}+?[]^$\\!"),
                            S = /\/+/;
                        s.filter = o, s.defaults = function(t) {
                            if (!t || !Object.keys(t).length) return s;
                            var e = s,
                                n = function(n, r, i) {
                                    return e.minimatch(n, r, a(t, i))
                                };
                            return n.Minimatch = function(n, r) {
                                return new e.Minimatch(n, a(t, r))
                            }, n
                        }, u.defaults = function(t) {
                            return t && Object.keys(t).length ? s.defaults(t).Minimatch : u
                        }, u.prototype.debug = function() {}, u.prototype.make = c, u.prototype.parseNegate = f, s.braceExpand = function(t, e) {
                            return new u(t, e).braceExpand()
                        }, u.prototype.braceExpand = h, u.prototype.parse = d;
                        var T = {};
                        s.makeRe = function(t, e) {
                            return new u(t, e || {}).makeRe()
                        }, u.prototype.makeRe = p, s.match = function(t, e, n) {
                            n = n || {};
                            var r = new u(e, n);
                            return t = t.filter(function(t) {
                                return r.match(t)
                            }), r.options.nonull && !t.length && t.push(e), t
                        }, u.prototype.match = m, u.prototype.matchOne = function(t, e, n) {
                            var r = this.options;
                            this.debug("matchOne", {
                                "this": this,
                                file: t,
                                pattern: e
                            }), this.debug("matchOne", t.length, e.length);
                            for (var i = 0, o = 0, a = t.length, s = e.length; a > i && s > o; i++, o++) {
                                this.debug("matchOne loop");
                                var u = e[o],
                                    c = t[i];
                                if (this.debug(e, u, c), u === !1) return !1;
                                if (u === b) {
                                    this.debug("GLOBSTAR", [e, u, c]);
                                    var f = i,
                                        l = o + 1;
                                    if (l === s) {
                                        for (this.debug("** at the end"); a > i; i++)
                                            if ("." === t[i] || ".." === t[i] || !r.dot && "." === t[i].charAt(0)) return !1;
                                        return !0
                                    }
                                    t: for (; a > f;) {
                                        var h = t[f];
                                        if (this.debug("\nglobstar while", t, f, e, l, h), this.matchOne(t.slice(f), e.slice(l), n)) return this.debug("globstar found match!", f, a, h), !0;
                                        if ("." === h || ".." === h || !r.dot && "." === h.charAt(0)) {
                                            this.debug("dot detected!", t, f, e, l);
                                            break t
                                        }
                                        this.debug("globstar swallow a segment, and continue"), f++
                                    }
                                    return n && (this.debug("\n>>> no match, partial?", t, f, e, l), f === a) ? !0 : !1
                                }
                                var d;
                                if ("string" == typeof u ? (d = r.nocase ? c.toLowerCase() === u.toLowerCase() : c === u, this.debug("string match", u, c, d)) : (d = c.match(u), this.debug("pattern match", u, c, d)), !d) return !1
                            }
                            if (i === a && o === s) return !0;
                            if (i === a) return n;
                            if (o === s) {
                                var p = i === a - 1 && "" === t[i];
                                return p
                            }
                            throw new Error("wtf?")
                        }
                    }("function" == typeof t ? t : null, this, "object" == typeof e ? e : null, "object" == typeof process ? process.platform : "win32")
                }, {
                    "lru-cache": 12,
                    path: 10,
                    sigmund: 13
                }],
                12: [function(t, e, n) {
                    ! function() {
                        function t(t, e) {
                            return Object.prototype.hasOwnProperty.call(t, e)
                        }

                        function n() {
                            return 1
                        }

                        function r(t) {
                            return this instanceof r ? ("number" == typeof t && (t = {
                                max: t
                            }), t || (t = {}), this._max = t.max, (!this._max || "number" != typeof this._max || this._max <= 0) && (this._max = 1 / 0), this._lengthCalculator = t.length || n, "function" != typeof this._lengthCalculator && (this._lengthCalculator = n), this._allowStale = t.stale || !1, this._maxAge = t.maxAge || null, this._dispose = t.dispose, void this.reset()) : new r(t)
                        }

                        function i(t, e, n) {
                            var r = t._cache[e];
                            return r && (o(t, r) ? (c(t, r), t._allowStale || (r = void 0)) : n && a(t, r), r && (r = r.value)), r
                        }

                        function o(t, e) {
                            if (!e || !e.maxAge && !t._maxAge) return !1;
                            var n = !1,
                                r = Date.now() - e.now;
                            return n = e.maxAge ? r > e.maxAge : t._maxAge && r > t._maxAge
                        }

                        function a(t, e) {
                            u(t, e), e.lu = t._mru++, t._lruList[e.lu] = e
                        }

                        function s(t) {
                            for (; t._lru < t._mru && t._length > t._max;) c(t, t._lruList[t._lru])
                        }

                        function u(t, e) {
                            for (delete t._lruList[e.lu]; t._lru < t._mru && !t._lruList[t._lru];) t._lru++
                        }

                        function c(t, e) {
                            e && (t._dispose && t._dispose(e.key, e.value), t._length -= e.length, t._itemCount--, delete t._cache[e.key], u(t, e))
                        }

                        function f(t, e, n, r, i, o) {
                            this.key = t, this.value = e, this.lu = n, this.length = r, this.now = i, o && (this.maxAge = o)
                        }
                        "object" == typeof e && e.exports ? e.exports = r : this.LRUCache = r, Object.defineProperty(r.prototype, "max", {
                            set: function(t) {
                                (!t || "number" != typeof t || 0 >= t) && (t = 1 / 0), this._max = t, this._length > this._max && s(this)
                            },
                            get: function() {
                                return this._max
                            },
                            enumerable: !0
                        }), Object.defineProperty(r.prototype, "lengthCalculator", {
                            set: function(t) {
                                if ("function" != typeof t) {
                                    this._lengthCalculator = n, this._length = this._itemCount;
                                    for (var e in this._cache) this._cache[e].length = 1
                                } else {
                                    this._lengthCalculator = t, this._length = 0;
                                    for (var e in this._cache) this._cache[e].length = this._lengthCalculator(this._cache[e].value), this._length += this._cache[e].length
                                }
                                this._length > this._max && s(this)
                            },
                            get: function() {
                                return this._lengthCalculator
                            },
                            enumerable: !0
                        }), Object.defineProperty(r.prototype, "length", {
                            get: function() {
                                return this._length
                            },
                            enumerable: !0
                        }), Object.defineProperty(r.prototype, "itemCount", {
                            get: function() {
                                return this._itemCount
                            },
                            enumerable: !0
                        }), r.prototype.forEach = function(t, e) {
                            e = e || this;
                            for (var n = 0, r = this._itemCount, i = this._mru - 1; i >= 0 && r > n; i--)
                                if (this._lruList[i]) {
                                    n++;
                                    var a = this._lruList[i];
                                    o(this, a) && (c(this, a), this._allowStale || (a = void 0)), a && t.call(e, a.value, a.key, this)
                                }
                        }, r.prototype.keys = function() {
                            for (var t = new Array(this._itemCount), e = 0, n = this._mru - 1; n >= 0 && e < this._itemCount; n--)
                                if (this._lruList[n]) {
                                    var r = this._lruList[n];
                                    t[e++] = r.key
                                }
                            return t
                        }, r.prototype.values = function() {
                            for (var t = new Array(this._itemCount), e = 0, n = this._mru - 1; n >= 0 && e < this._itemCount; n--)
                                if (this._lruList[n]) {
                                    var r = this._lruList[n];
                                    t[e++] = r.value
                                }
                            return t
                        }, r.prototype.reset = function() {
                            if (this._dispose && this._cache)
                                for (var t in this._cache) this._dispose(t, this._cache[t].value);
                            this._cache = Object.create(null), this._lruList = Object.create(null), this._mru = 0, this._lru = 0, this._length = 0, this._itemCount = 0
                        }, r.prototype.dump = function() {
                            return this._cache
                        }, r.prototype.dumpLru = function() {
                            return this._lruList
                        }, r.prototype.set = function(e, n, r) {
                            r = r || this._maxAge;
                            var i = r ? Date.now() : 0;
                            if (t(this._cache, e)) return this._dispose && this._dispose(e, this._cache[e].value), this._cache[e].now = i, this._cache[e].maxAge = r, this._cache[e].value = n, this.get(e), !0;
                            var o = this._lengthCalculator(n),
                                a = new f(e, n, this._mru++, o, i, r);
                            return a.length > this._max ? (this._dispose && this._dispose(e, n), !1) : (this._length += a.length, this._lruList[a.lu] = this._cache[e] = a, this._itemCount++, this._length > this._max && s(this), !0)
                        }, r.prototype.has = function(e) {
                            if (!t(this._cache, e)) return !1;
                            var n = this._cache[e];
                            return o(this, n) ? !1 : !0
                        }, r.prototype.get = function(t) {
                            return i(this, t, !0)
                        }, r.prototype.peek = function(t) {
                            return i(this, t, !1)
                        }, r.prototype.pop = function() {
                            var t = this._lruList[this._lru];
                            return c(this, t), t || null
                        }, r.prototype.del = function(t) {
                            c(this, this._cache[t])
                        }
                    }()
                }, {}],
                13: [function(t, e, n) {
                    function r(t, e) {
                        function n(t, a) {
                            return a > e || "function" == typeof t || "undefined" == typeof t ? void 0 : "object" != typeof t || !t || t instanceof o ? void(i += t) : void(-1 === r.indexOf(t) && a !== e && (r.push(t), i += "{", Object.keys(t).forEach(function(e, r, o) {
                                if ("_" !== e.charAt(0)) {
                                    var s = typeof t[e];
                                    "function" !== s && "undefined" !== s && (i += e, n(t[e], a + 1))
                                }
                            })))
                        }
                        e = e || 10;
                        var r = [],
                            i = "",
                            o = RegExp;
                        return n(t, 0), i
                    }
                    e.exports = r
                }, {}],
                14: [function(t, e, n) {
                    (function(t) {
                        function n(e, n, r) {
                            return e instanceof ArrayBuffer && (e = new Uint8Array(e)), new t(e, n, r)
                        }
                        n.prototype = Object.create(t.prototype), n.prototype.constructor = n, Object.keys(t).forEach(function(e) {
                            t.hasOwnProperty(e) && (n[e] = t[e])
                        }), e.exports = n
                    }).call(this, t("buffer").Buffer)
                }, {
                    buffer: 6
                }],
                15: [function(t, e, n) {
                    var r = "READ",
                        i = "WRITE",
                        o = "CREATE",
                        a = "EXCLUSIVE",
                        s = "TRUNCATE",
                        u = "APPEND",
                        c = "CREATE",
                        f = "REPLACE";
                    e.exports = {
                        FILE_SYSTEM_NAME: "local",
                        FILE_STORE_NAME: "files",
                        IDB_RO: "readonly",
                        IDB_RW: "readwrite",
                        WSQL_VERSION: "1",
                        WSQL_SIZE: 5242880,
                        WSQL_DESC: "FileSystem Storage",
                        MODE_FILE: "FILE",
                        MODE_DIRECTORY: "DIRECTORY",
                        MODE_SYMBOLIC_LINK: "SYMLINK",
                        MODE_META: "META",
                        SYMLOOP_MAX: 10,
                        BINARY_MIME_TYPE: "application/octet-stream",
                        JSON_MIME_TYPE: "application/json",
                        ROOT_DIRECTORY_NAME: "/",
                        FS_FORMAT: "FORMAT",
                        FS_NOCTIME: "NOCTIME",
                        FS_NOMTIME: "NOMTIME",
                        FS_NODUPEIDCHECK: "FS_NODUPEIDCHECK",
                        O_READ: r,
                        O_WRITE: i,
                        O_CREATE: o,
                        O_EXCLUSIVE: a,
                        O_TRUNCATE: s,
                        O_APPEND: u,
                        O_FLAGS: {
                            r: [r],
                            "r+": [r, i],
                            w: [i, o, s],
                            "w+": [i, r, o, s],
                            wx: [i, o, a, s],
                            "wx+": [i, r, o, a, s],
                            a: [i, o, u],
                            "a+": [i, r, o, u],
                            ax: [i, o, a, u],
                            "ax+": [i, r, o, a, u]
                        },
                        XATTR_CREATE: c,
                        XATTR_REPLACE: f,
                        FS_READY: "READY",
                        FS_PENDING: "PENDING",
                        FS_ERROR: "ERROR",
                        SUPER_NODE_ID: "00000000-0000-0000-0000-000000000000",
                        STDIN: 0,
                        STDOUT: 1,
                        STDERR: 2,
                        FIRST_DESCRIPTOR: 3,
                        ENVIRONMENT: {
                            TMP: "/tmp",
                            PATH: ""
                        }
                    }
                }, {}],
                16: [function(t, e, n) {
                    var r = t("./constants.js").MODE_FILE;
                    e.exports = function(t, e) {
                        this.id = t, this.type = e || r
                    }
                }, {
                    "./constants.js": 15
                }],
                17: [function(t, e, n) {
                    (function(t) {
                        function n(t) {
                            return t.toString("utf8")
                        }

                        function r(e) {
                            return new t(e, "utf8")
                        }
                        e.exports = {
                            encode: r,
                            decode: n
                        }
                    }).call(this, t("buffer").Buffer)
                }, {
                    buffer: 6
                }],
                18: [function(t, e, n) {
                    var r = {};
                    ["9:EBADF:bad file descriptor", "10:EBUSY:resource busy or locked", "18:EINVAL:invalid argument", "27:ENOTDIR:not a directory", "28:EISDIR:illegal operation on a directory", "34:ENOENT:no such file or directory", "47:EEXIST:file already exists", "50:EPERM:operation not permitted", "51:ELOOP:too many symbolic links encountered", "53:ENOTEMPTY:directory not empty", "55:EIO:i/o error", "1000:ENOTMOUNTED:not mounted", "1001:EFILESYSTEMERROR:missing super node, use 'FORMAT' flag to format filesystem.", "1002:ENOATTR:attribute does not exist"].forEach(function(t) {
                        function e(t, e) {
                            Error.call(this), this.name = i, this.code = i, this.errno = n, this.message = t || o, e && (this.path = e), this.stack = new Error(this.message).stack
                        }
                        t = t.split(":");
                        var n = +t[0],
                            i = t[1],
                            o = t[2];
                        e.prototype = Object.create(Error.prototype), e.prototype.constructor = e, e.prototype.toString = function() {
                            var t = this.path ? ", '" + this.path + "'" : "";
                            return this.name + ": " + this.message + t
                        }, r[i] = r[n] = e
                    }), e.exports = r
                }, {}],
                19: [function(t, e, n) {
                    function r(t, e, n, r, i) {
                        function o(n) {
                            t.changes.push({
                                event: "change",
                                path: e
                            }), i(n)
                        }
                        var a = t.flags;
                        ht(a).contains(Bt) && delete r.ctime, ht(a).contains(Pt) && delete r.mtime;
                        var s = !1;
                        r.ctime && (n.ctime = r.ctime, n.atime = r.ctime, s = !0), r.atime && (n.atime = r.atime, s = !0), r.mtime && (n.mtime = r.mtime, s = !0), s ? t.putObject(n.id, n, o) : o()
                    }

                    function i(t, e, n, i) {
                        function a(n, r) {
                            n ? i(n) : r.mode !== wt ? i(new Ft.ENOTDIR("a component of the path prefix is not a directory", e)) : (l = r, o(t, e, s))
                        }

                        function s(n, r) {
                            !n && r ? i(new Ft.EEXIST("path name already exists", e)) : !n || n instanceof Ft.ENOENT ? t.getObject(l.data, u) : i(n)
                        }

                        function u(e, r) {
                            e ? i(e) : (h = r, Vt.create({
                                guid: t.guid,
                                mode: n
                            }, function(e, n) {
                                return e ? void i(e) : (d = n, d.nlinks += 1, void t.putObject(d.id, d, f))
                            }))
                        }

                        function c(e) {
                            if (e) i(e);
                            else {
                                var n = Date.now();
                                r(t, m, d, {
                                    mtime: n,
                                    ctime: n
                                }, i)
                            }
                        }

                        function f(e) {
                            e ? i(e) : (h[p] = new kt(d.id, n), t.putObject(l.data, h, c))
                        }
                        if (n !== wt && n !== bt) return i(new Ft.EINVAL("mode must be a directory or file", e));
                        e = pt(e);
                        var l, h, d, p = gt(e),
                            m = mt(e);
                        o(t, m, a)
                    }

                    function o(t, e, n) {
                        function r(e, r) {
                            e ? n(e) : r && r.mode === Ot && r.rnode ? t.getObject(r.rnode, i) : n(new Ft.EFILESYSTEMERROR)
                        }

                        function i(t, e) {
                            t ? n(t) : e ? n(null, e) : n(new Ft.ENOENT)
                        }

                        function a(r, i) {
                            r ? n(r) : i.mode === wt && i.data ? t.getObject(i.data, s) : n(new Ft.ENOTDIR("a component of the path prefix is not a directory", e))
                        }

                        function s(r, i) {
                            if (r) n(r);
                            else if (ht(i).has(f)) {
                                var o = i[f].id;
                                t.getObject(o, u)
                            } else n(new Ft.ENOENT(null, e))
                        }

                        function u(t, r) {
                            t ? n(t) : r.mode == _t ? (h++, h > At ? n(new Ft.ELOOP(null, e)) : c(r.data)) : n(null, r)
                        }

                        function c(e) {
                            e = pt(e), l = mt(e), f = gt(e), Rt == f ? t.getObject(It, r) : o(t, l, a)
                        }
                        if (e = pt(e), !e) return n(new Ft.ENOENT("path is an empty string"));
                        var f = gt(e),
                            l = mt(e),
                            h = 0;
                        Rt == f ? t.getObject(It, r) : o(t, l, a)
                    }

                    function a(t, e, n, i, o, a, s) {
                        function u(i) {
                            i ? s(i) : r(t, e, n, {
                                ctime: Date.now()
                            }, s)
                        }
                        var c = n.xattrs;
                        a === Ct && c.hasOwnProperty(i) ? s(new Ft.EEXIST("attribute already exists", e)) : a !== Nt || c.hasOwnProperty(i) ? (c[i] = o, t.putObject(n.id, n, u)) : s(new Ft.ENOATTR(null, e))
                    }

                    function s(t, e) {
                        function n(n, i) {
                            !n && i ? e() : !n || n instanceof Ft.ENOENT ? Wt.create({
                                guid: t.guid
                            }, function(n, i) {
                                return n ? void e(n) : (o = i, void t.putObject(o.id, o, r))
                            }) : e(n)
                        }

                        function r(n) {
                            n ? e(n) : Vt.create({
                                guid: t.guid,
                                id: o.rnode,
                                mode: wt
                            }, function(n, r) {
                                return n ? void e(n) : (a = r, a.nlinks += 1, void t.putObject(a.id, a, i))
                            })
                        }

                        function i(n) {
                            n ? e(n) : (s = {}, t.putObject(a.data, s, e))
                        }
                        var o, a, s;
                        t.getObject(It, n)
                    }

                    function u(t, e, n) {
                        function i(r, i) {
                            !r && i ? n(new Ft.EEXIST(null, e)) : !r || r instanceof Ft.ENOENT ? o(t, g, a) : n(r)
                        }

                        function a(e, r) {
                            e ? n(e) : (d = r, t.getObject(d.data, s))
                        }

                        function s(e, r) {
                            e ? n(e) : (p = r, Vt.create({
                                guid: t.guid,
                                mode: wt
                            }, function(e, r) {
                                return e ? void n(e) : (l = r, l.nlinks += 1, void t.putObject(l.id, l, u))
                            }))
                        }

                        function u(e) {
                            e ? n(e) : (h = {}, t.putObject(l.data, h, f))
                        }

                        function c(e) {
                            if (e) n(e);
                            else {
                                var i = Date.now();
                                r(t, g, d, {
                                    mtime: i,
                                    ctime: i
                                }, n)
                            }
                        }

                        function f(e) {
                            e ? n(e) : (p[m] = new kt(l.id, wt), t.putObject(d.data, p, c))
                        }
                        e = pt(e);
                        var l, h, d, p, m = gt(e),
                            g = mt(e);
                        o(t, e, i)
                    }

                    function c(t, e, n) {
                        function i(e, r) {
                            e ? n(e) : (m = r, t.getObject(m.data, a))
                        }

                        function a(r, i) {
                            r ? n(r) : Rt == v ? n(new Ft.EBUSY(null, e)) : ht(i).has(v) ? (g = i, d = g[v].id, t.getObject(d, s)) : n(new Ft.ENOENT(null, e))
                        }

                        function s(r, i) {
                            r ? n(r) : i.mode != wt ? n(new Ft.ENOTDIR(null, e)) : (d = i, t.getObject(d.data, u))
                        }

                        function u(t, r) {
                            t ? n(t) : (p = r, ht(p).size() > 0 ? n(new Ft.ENOTEMPTY(null, e)) : f())
                        }

                        function c(e) {
                            if (e) n(e);
                            else {
                                var i = Date.now();
                                r(t, E, m, {
                                    mtime: i,
                                    ctime: i
                                }, l)
                            }
                        }

                        function f() {
                            delete g[v], t.putObject(m.data, g, c)
                        }

                        function l(e) {
                            e ? n(e) : t["delete"](d.id, h)
                        }

                        function h(e) {
                            e ? n(e) : t["delete"](d.data, n)
                        }
                        e = pt(e);
                        var d, p, m, g, v = gt(e),
                            E = mt(e);
                        o(t, E, i)
                    }

                    function f(t, e, n, i) {
                        function a(n, r) {
                            n ? i(n) : r.mode !== wt ? i(new Ft.ENOENT(null, e)) : (g = r, t.getObject(g.data, s))
                        }

                        function s(r, o) {
                            r ? i(r) : (v = o, ht(v).has(w) ? ht(n).contains(Lt) ? i(new Ft.ENOENT("O_CREATE and O_EXCLUSIVE are set, and the named file exists", e)) : (E = v[w], E.type == wt && ht(n).contains(Tt) ? i(new Ft.EISDIR("the named file is a directory and O_WRITE is set", e)) : t.getObject(E.id, u)) : ht(n).contains(xt) ? l() : i(new Ft.ENOENT("O_CREATE is not set and the named file does not exist", e)))
                        }

                        function u(t, n) {
                            if (t) i(t);
                            else {
                                var r = n;
                                r.mode == _t ? (O++, O > At ? i(new Ft.ELOOP(null, e)) : c(r.data)) : f(void 0, r)
                            }
                        }

                        function c(r) {
                            r = pt(r), _ = mt(r), w = gt(r), Rt == w && (ht(n).contains(Tt) ? i(new Ft.EISDIR("the named file is a directory and O_WRITE is set", e)) : o(t, e, f)), o(t, _, a)
                        }

                        function f(t, e) {
                            t ? i(t) : (y = e, i(null, y))
                        }

                        function l() {
                            Vt.create({
                                guid: t.guid,
                                mode: bt
                            }, function(e, n) {
                                return e ? void i(e) : (y = n, y.nlinks += 1, void t.putObject(y.id, y, h))
                            })
                        }

                        function h(e) {
                            e ? i(e) : (b = new zt(0), b.fill(0), t.putBuffer(y.data, b, p))
                        }

                        function d(e) {
                            if (e) i(e);
                            else {
                                var n = Date.now();
                                r(t, _, g, {
                                    mtime: n,
                                    ctime: n
                                }, m)
                            }
                        }

                        function p(e) {
                            e ? i(e) : (v[w] = new kt(y.id, bt), t.putObject(g.data, v, d))
                        }

                        function m(t) {
                            t ? i(t) : i(null, y)
                        }
                        e = pt(e);
                        var g, v, E, y, b, w = gt(e),
                            _ = mt(e),
                            O = 0;
                        Rt == w ? ht(n).contains(Tt) ? i(new Ft.EISDIR("the named file is a directory and O_WRITE is set", e)) : o(t, e, f) : o(t, _, a)
                    }

                    function l(t, e, n, i, o, a) {
                        function s(t) {
                            t ? a(t) : a(null, o)
                        }

                        function u(n) {
                            if (n) a(n);
                            else {
                                var i = Date.now();
                                r(t, e.path, l, {
                                    mtime: i,
                                    ctime: i
                                }, s)
                            }
                        }

                        function c(e) {
                            e ? a(e) : t.putObject(l.id, l, u)
                        }

                        function f(r, s) {
                            if (r) a(r);
                            else {
                                l = s;
                                var u = new zt(o);
                                u.fill(0), n.copy(u, 0, i, i + o), e.position = o, l.size = o, l.version += 1, t.putBuffer(l.data, u, c)
                            }
                        }
                        var l;
                        t.getObject(e.id, f)
                    }

                    function h(t, e, n, i, o, a, s) {
                        function u(t) {
                            t ? s(t) : s(null, o)
                        }

                        function c(n) {
                            if (n) s(n);
                            else {
                                var i = Date.now();
                                r(t, e.path, d, {
                                    mtime: i,
                                    ctime: i
                                }, u)
                            }
                        }

                        function f(e) {
                            e ? s(e) : t.putObject(d.id, d, c)
                        }

                        function l(r, u) {
                            if (r) s(r);
                            else {
                                if (p = u, !p) return s(new Ft.EIO("Expected Buffer"));
                                var c = void 0 !== a && null !== a ? a : e.position,
                                    l = Math.max(p.length, c + o),
                                    h = new zt(l);
                                h.fill(0), p && p.copy(h), n.copy(h, c, i, i + o), void 0 === a && (e.position += o), d.size = l, d.version += 1, t.putBuffer(d.data, h, f)
                            }
                        }

                        function h(e, n) {
                            e ? s(e) : (d = n, t.getBuffer(d.data, l))
                        }
                        var d, p;
                        t.getObject(e.id, h)
                    }

                    function d(t, e, n, r, i, o, a) {
                        function s(t, s) {
                            if (t) a(t);
                            else {
                                if (f = s, !f) return a(new Ft.EIO("Expected Buffer"));
                                var u = void 0 !== o && null !== o ? o : e.position;
                                i = u + i > n.length ? i - u : i, f.copy(n, r, u, u + i), void 0 === o && (e.position += i), a(null, i)
                            }
                        }

                        function u(n, r) {
                            n ? a(n) : "DIRECTORY" === r.mode ? a(new Ft.EISDIR("the named file is a directory", e.path)) : (c = r, t.getBuffer(c.data, s))
                        }
                        var c, f;
                        t.getObject(e.id, u)
                    }

                    function p(t, e, n) {
                        e = pt(e), gt(e), o(t, e, n)
                    }

                    function m(t, e, n) {
                        e.getNode(t, n)
                    }

                    function g(t, e, n) {
                        function r(e, r) {
                            e ? n(e) : (a = r, t.getObject(a.data, i))
                        }

                        function i(r, i) {
                            r ? n(r) : (s = i, ht(s).has(u) ? t.getObject(s[u].id, n) : n(new Ft.ENOENT("a component of the path does not name an existing file", e)))
                        }
                        e = pt(e);
                        var a, s, u = gt(e),
                            c = mt(e);
                        Rt == u ? o(t, e, n) : o(t, c, r)
                    }

                    function v(t, e, n, i) {
                        function a(e) {
                            e ? i(e) : r(t, n, y, {
                                ctime: Date.now()
                            }, i)
                        }

                        function s(e, n) {
                            e ? i(e) : (y = n, y.nlinks += 1, t.putObject(y.id, y, a))
                        }

                        function u(e, n) {
                            e ? i(e) : t.getObject(E[b].id, s)
                        }

                        function c(e, n) {
                            e ? i(e) : (E = n, ht(E).has(b) ? i(new Ft.EEXIST("newpath resolves to an existing file", b)) : (E[b] = g[d], t.putObject(v.data, E, u)))
                        }

                        function f(e, n) {
                            e ? i(e) : (v = n, t.getObject(v.data, c))
                        }

                        function l(e, n) {
                            e ? i(e) : (g = n, ht(g).has(d) ? "DIRECTORY" === g[d].type ? i(new Ft.EPERM("oldpath refers to a directory")) : o(t, w, f) : i(new Ft.ENOENT("a component of either path prefix does not exist", d)))
                        }

                        function h(e, n) {
                            e ? i(e) : (m = n, t.getObject(m.data, l))
                        }
                        e = pt(e);
                        var d = gt(e),
                            p = mt(e);
                        n = pt(n);
                        var m, g, v, E, y, b = gt(n),
                            w = mt(n);
                        o(t, p, h)
                    }

                    function E(t, e, n) {
                        function i(e) {
                            e ? n(e) : (delete h[p], t.putObject(l.data, h, function(e) {
                                var i = Date.now();
                                r(t, m, l, {
                                    mtime: i,
                                    ctime: i
                                }, n)
                            }))
                        }

                        function a(e) {
                            e ? n(e) : t["delete"](d.data, i)
                        }

                        function s(o, s) {
                            o ? n(o) : (d = s, d.nlinks -= 1, d.nlinks < 1 ? t["delete"](d.id, a) : t.putObject(d.id, d, function(n) {
                                r(t, e, d, {
                                    ctime: Date.now()
                                }, i)
                            }))
                        }

                        function u(t, e) {
                            t ? n(t) : "DIRECTORY" === e.mode ? n(new Ft.EPERM("unlink not permitted on directories", p)) : s(null, e)
                        }

                        function c(e, r) {
                            e ? n(e) : (h = r, ht(h).has(p) ? t.getObject(h[p].id, u) : n(new Ft.ENOENT("a component of the path does not name an existing file", p)))
                        }

                        function f(e, r) {
                            e ? n(e) : (l = r, t.getObject(l.data, c))
                        }
                        e = pt(e);
                        var l, h, d, p = gt(e),
                            m = mt(e);
                        o(t, m, f)
                    }

                    function y(t, e, n) {
                        function r(t, e) {
                            if (t) n(t);
                            else {
                                s = e;
                                var r = Object.keys(s);
                                n(null, r)
                            }
                        }

                        function i(i, o) {
                            i ? n(i) : o.mode !== wt ? n(new Ft.ENOTDIR(null, e)) : (a = o, t.getObject(a.data, r))
                        }
                        e = pt(e);
                        var a, s;
                        gt(e), o(t, e, i)
                    }

                    function b(t, e, n, i) {
                        function a(e, n) {
                            e ? i(e) : (l = n, t.getObject(l.data, s))
                        }

                        function s(t, e) {
                            t ? i(t) : (h = e, ht(h).has(p) ? i(new Ft.EEXIST(null, p)) : u())
                        }

                        function u() {
                            Vt.create({
                                guid: t.guid,
                                mode: _t
                            }, function(n, r) {
                                return n ? void i(n) : (d = r, d.nlinks += 1, d.size = e.length, d.data = e, void t.putObject(d.id, d, f))
                            })
                        }

                        function c(e) {
                            if (e) i(e);
                            else {
                                var n = Date.now();
                                r(t, m, l, {
                                    mtime: n,
                                    ctime: n
                                }, i)
                            }
                        }

                        function f(e) {
                            e ? i(e) : (h[p] = new kt(d.id, _t), t.putObject(l.data, h, c))
                        }
                        n = pt(n);
                        var l, h, d, p = gt(n),
                            m = mt(n);
                        Rt == p ? i(new Ft.EEXIST(null, p)) : o(t, m, a)
                    }

                    function w(t, e, n) {
                        function r(e, r) {
                            e ? n(e) : (s = r, t.getObject(s.data, i))
                        }

                        function i(e, r) {
                            e ? n(e) : (u = r, ht(u).has(c) ? t.getObject(u[c].id, a) : n(new Ft.ENOENT("a component of the path does not name an existing file", c)))
                        }

                        function a(t, r) {
                            t ? n(t) : r.mode != _t ? n(new Ft.EINVAL("path not a symbolic link", e)) : n(null, r.data)
                        }
                        e = pt(e);
                        var s, u, c = gt(e),
                            f = mt(e);
                        o(t, f, r)
                    }

                    function _(t, e, n, i) {
                        function a(n, r) {
                            n ? i(n) : r.mode == wt ? i(new Ft.EISDIR(null, e)) : (f = r, t.getBuffer(f.data, s))
                        }

                        function s(e, r) {
                            if (e) i(e);
                            else {
                                if (!r) return i(new Ft.EIO("Expected Buffer"));
                                var o = new zt(n);
                                o.fill(0), r && r.copy(o), t.putBuffer(f.data, o, c)
                            }
                        }

                        function u(n) {
                            if (n) i(n);
                            else {
                                var o = Date.now();
                                r(t, e, f, {
                                    mtime: o,
                                    ctime: o
                                }, i)
                            }
                        }

                        function c(e) {
                            e ? i(e) : (f.size = n, f.version += 1, t.putObject(f.id, f, u))
                        }
                        e = pt(e);
                        var f;
                        0 > n ? i(new Ft.EINVAL("length cannot be negative")) : o(t, e, a)
                    }

                    function O(t, e, n, i) {
                        function o(e, n) {
                            e ? i(e) : n.mode == wt ? i(new Ft.EISDIR) : (c = n, t.getBuffer(c.data, a))
                        }

                        function a(e, r) {
                            if (e) i(e);
                            else {
                                var o;
                                if (!r) return i(new Ft.EIO("Expected Buffer"));
                                r ? o = r.slice(0, n) : (o = new zt(n), o.fill(0)), t.putBuffer(c.data, o, u)
                            }
                        }

                        function s(n) {
                            if (n) i(n);
                            else {
                                var o = Date.now();
                                r(t, e.path, c, {
                                    mtime: o,
                                    ctime: o
                                }, i)
                            }
                        }

                        function u(e) {
                            e ? i(e) : (c.size = n, c.version += 1, t.putObject(c.id, c, s))
                        }
                        var c;
                        0 > n ? i(new Ft.EINVAL("length cannot be negative")) : e.getNode(t, o)
                    }

                    function R(t, e, n, i, a) {
                        function s(o, s) {
                            o ? a(o) : r(t, e, s, {
                                atime: n,
                                ctime: i,
                                mtime: i
                            }, a)
                        }
                        e = pt(e), "number" != typeof n || "number" != typeof i ? a(new Ft.EINVAL("atime and mtime must be number", e)) : 0 > n || 0 > i ? a(new Ft.EINVAL("atime and mtime must be positive integers", e)) : o(t, e, s)
                    }

                    function I(t, e, n, i, o) {
                        function a(a, s) {
                            a ? o(a) : r(t, e.path, s, {
                                atime: n,
                                ctime: i,
                                mtime: i
                            }, o)
                        }
                        "number" != typeof n || "number" != typeof i ? o(new Ft.EINVAL("atime and mtime must be a number")) : 0 > n || 0 > i ? o(new Ft.EINVAL("atime and mtime must be positive integers")) : e.getNode(t, a)
                    }

                    function A(t, e, n, r, i, s) {
                        function u(o, u) {
                            return o ? s(o) : void a(t, e, u, n, r, i, s)
                        }
                        e = pt(e), "string" != typeof n ? s(new Ft.EINVAL("attribute name must be a string", e)) : n ? null !== i && i !== Ct && i !== Nt ? s(new Ft.EINVAL("invalid flag, must be null, XATTR_CREATE or XATTR_REPLACE", e)) : o(t, e, u) : s(new Ft.EINVAL("attribute name cannot be an empty string", e))
                    }

                    function S(t, e, n, r, i, o) {
                        function s(s, u) {
                            return s ? o(s) : void a(t, e.path, u, n, r, i, o)
                        }
                        "string" != typeof n ? o(new Ft.EINVAL("attribute name must be a string")) : n ? null !== i && i !== Ct && i !== Nt ? o(new Ft.EINVAL("invalid flag, must be null, XATTR_CREATE or XATTR_REPLACE")) : e.getNode(t, s) : o(new Ft.EINVAL("attribute name cannot be an empty string"))
                    }

                    function T(t, e, n, r) {
                        function i(t, i) {
                            if (t) return r(t);
                            var o = i.xattrs;
                            o.hasOwnProperty(n) ? r(null, o[n]) : r(new Ft.ENOATTR(null, e))
                        }
                        e = pt(e), "string" != typeof n ? r(new Ft.EINVAL("attribute name must be a string", e)) : n ? o(t, e, i) : r(new Ft.EINVAL("attribute name cannot be an empty string", e))
                    }

                    function x(t, e, n, r) {
                        function i(t, e) {
                            if (t) return r(t);
                            var i = e.xattrs;
                            i.hasOwnProperty(n) ? r(null, i[n]) : r(new Ft.ENOATTR)
                        }
                        "string" != typeof n ? r(new Ft.EINVAL) : n ? e.getNode(t, i) : r(new Ft.EINVAL("attribute name cannot be an empty string"))
                    }

                    function L(t, e, n, i) {
                        function a(o, a) {
                            function s(n) {
                                n ? i(n) : r(t, e, a, {
                                    ctime: Date.now()
                                }, i)
                            }
                            if (o) return i(o);
                            var u = a.xattrs;
                            u.hasOwnProperty(n) ? (delete u[n], t.putObject(a.id, a, s)) : i(new Ft.ENOATTR(null, e))
                        }
                        e = pt(e), "string" != typeof n ? i(new Ft.EINVAL("attribute name must be a string", e)) : n ? o(t, e, a) : i(new Ft.EINVAL("attribute name cannot be an empty string", e))
                    }

                    function j(t, e, n, i) {
                        function o(o, a) {
                            function s(n) {
                                n ? i(n) : r(t, e.path, a, {
                                    ctime: Date.now()
                                }, i)
                            }
                            if (o) return i(o);
                            var u = a.xattrs;
                            u.hasOwnProperty(n) ? (delete u[n], t.putObject(a.id, a, s)) : i(new Ft.ENOATTR)
                        }
                        "string" != typeof n ? i(new Ft.EINVAL("attribute name must be a string")) : n ? e.getNode(t, o) : i(new Ft.EINVAL("attribute name cannot be an empty string"))
                    }

                    function D(t) {
                        return ht(Dt).has(t) ? Dt[t] : null
                    }

                    function C(t, e, n) {
                        return t ? "function" == typeof t ? t = {
                            encoding: e,
                            flag: n
                        } : "string" == typeof t && (t = {
                            encoding: t,
                            flag: n
                        }) : t = {
                            encoding: e,
                            flag: n
                        }, t
                    }

                    function N(t, e) {
                        var n;
                        return t ? Et(t) ? n = new Ft.EINVAL("Path must be a string without null bytes.", t) : vt(t) || (n = new Ft.EINVAL("Path must be absolute.", t)) : n = new Ft.EINVAL("Path must be a string", t), n ? (e(n), !1) : !0
                    }

                    function P(t, e, n, r, i, o) {
                        function a(e, i) {
                            if (e) o(e);
                            else {
                                var a;
                                a = ht(r).contains(jt) ? i.size : 0;
                                var s = new Ut(n, i.id, r, a),
                                    u = t.allocDescriptor(s);
                                o(null, u)
                            }
                        }
                        o = arguments[arguments.length - 1], N(n, o) && (r = D(r), r || o(new Ft.EINVAL("flags is not valid"), n), f(e, n, r, a))
                    }

                    function B(t, e, n, r) {
                        ht(t.openFiles).has(n) ? (t.releaseDescriptor(n), r(null)) : r(new Ft.EBADF)
                    }

                    function M(t, e, n, r, o) {
                        N(n, o) && i(e, n, r, o)
                    }

                    function F(t, e, n, r, i) {
                        i = arguments[arguments.length - 1], N(n, i) && u(e, n, i)
                    }

                    function k(t, e, n, r) {
                        N(n, r) && c(e, n, r)
                    }

                    function U(t, e, n, r) {
                        function i(e, n) {
                            if (e) r(e);
                            else {
                                var i = new Yt(n, t.name);
                                r(null, i)
                            }
                        }
                        N(n, r) && p(e, n, i)
                    }

                    function W(t, e, n, r) {
                        function i(e, n) {
                            if (e) r(e);
                            else {
                                var i = new Yt(n, t.name);
                                r(null, i)
                            }
                        }
                        var o = t.openFiles[n];
                        o ? m(e, o, i) : r(new Ft.EBADF)
                    }

                    function V(t, e, n, r, i) {
                        N(n, i) && N(r, i) && v(e, n, r, i)
                    }

                    function Y(t, e, n, r) {
                        N(n, r) && E(e, n, r)
                    }

                    function z(t, e, n, r, i, o, a, s) {
                        function u(t, e) {
                            s(t, e || 0, r)
                        }
                        i = void 0 === i ? 0 : i, o = void 0 === o ? r.length - i : o, s = arguments[arguments.length - 1];
                        var c = t.openFiles[n];
                        c ? ht(c.flags).contains(St) ? d(e, c, r, i, o, a, u) : s(new Ft.EBADF("descriptor does not permit reading")) : s(new Ft.EBADF)
                    }

                    function X(t, e, n, r, i) {
                        if (i = arguments[arguments.length - 1], r = C(r, null, "r"), N(n, i)) {
                            var o = D(r.flag || "r");
                            return o ? void f(e, n, o, function(a, s) {
                                function u() {
                                    t.releaseDescriptor(f)
                                }
                                if (a) return i(a);
                                var c = new Ut(n, s.id, o, 0),
                                    f = t.allocDescriptor(c);
                                m(e, c, function(o, a) {
                                    if (o) return u(), i(o);
                                    var s = new Yt(a, t.name);
                                    if (s.isDirectory()) return u(), i(new Ft.EISDIR("illegal operation on directory", n));
                                    var f = s.size,
                                        l = new zt(f);
                                    l.fill(0), d(e, c, l, 0, f, 0, function(t, e) {
                                        if (u(), t) return i(t);
                                        var n;
                                        n = "utf8" === r.encoding ? Mt.decode(l) : l, i(null, n)
                                    })
                                })
                            }) : i(new Ft.EINVAL("flags is not valid", n))
                        }
                    }

                    function q(t, e, n, r, i, o, a, s) {
                        s = arguments[arguments.length - 1], i = void 0 === i ? 0 : i, o = void 0 === o ? r.length - i : o;
                        var u = t.openFiles[n];
                        u ? ht(u.flags).contains(Tt) ? r.length - i < o ? s(new Ft.EIO("intput buffer is too small")) : h(e, u, r, i, o, a, s) : s(new Ft.EBADF("descriptor does not permit writing")) : s(new Ft.EBADF)
                    }

                    function H(t, e, n, r, i, o) {
                        if (o = arguments[arguments.length - 1], i = C(i, "utf8", "w"), N(n, o)) {
                            var a = D(i.flag || "w");
                            if (!a) return o(new Ft.EINVAL("flags is not valid", n));
                            r = r || "", "number" == typeof r && (r = "" + r), "string" == typeof r && "utf8" === i.encoding && (r = Mt.encode(r)), f(e, n, a, function(i, s) {
                                if (i) return o(i);
                                var u = new Ut(n, s.id, a, 0),
                                    c = t.allocDescriptor(u);
                                l(e, u, r, 0, r.length, function(e, n) {
                                    return t.releaseDescriptor(c), e ? o(e) : void o(null)
                                })
                            })
                        }
                    }

                    function Q(t, e, n, r, i, o) {
                        if (o = arguments[arguments.length - 1], i = C(i, "utf8", "a"), N(n, o)) {
                            var a = D(i.flag || "a");
                            if (!a) return o(new Ft.EINVAL("flags is not valid", n));
                            r = r || "", "number" == typeof r && (r = "" + r), "string" == typeof r && "utf8" === i.encoding && (r = Mt.encode(r)), f(e, n, a, function(i, s) {
                                if (i) return o(i);
                                var u = new Ut(n, s.id, a, s.size),
                                    c = t.allocDescriptor(u);
                                h(e, u, r, 0, r.length, u.position, function(e, n) {
                                    return t.releaseDescriptor(c),
                                        e ? o(e) : void o(null)
                                })
                            })
                        }
                    }

                    function J(t, e, n, r) {
                        function i(t, e) {
                            r(t ? !1 : !0)
                        }
                        U(t, e, n, i)
                    }

                    function $(t, e, n, r, i) {
                        N(n, i) && T(e, n, r, i)
                    }

                    function G(t, e, n, r, i) {
                        var o = t.openFiles[n];
                        o ? x(e, o, r, i) : i(new Ft.EBADF)
                    }

                    function K(t, e, n, r, i, o, a) {
                        "function" == typeof o && (a = o, o = null), N(n, a) && A(e, n, r, i, o, a)
                    }

                    function Z(t, e, n, r, i, o, a) {
                        "function" == typeof o && (a = o, o = null);
                        var s = t.openFiles[n];
                        s ? ht(s.flags).contains(Tt) ? S(e, s, r, i, o, a) : a(new Ft.EBADF("descriptor does not permit writing")) : a(new Ft.EBADF)
                    }

                    function tt(t, e, n, r, i) {
                        N(n, i) && L(e, n, r, i)
                    }

                    function et(t, e, n, r, i) {
                        var o = t.openFiles[n];
                        o ? ht(o.flags).contains(Tt) ? j(e, o, r, i) : i(new Ft.EBADF("descriptor does not permit writing")) : i(new Ft.EBADF)
                    }

                    function nt(t, e, n, r, i, o) {
                        function a(t, e) {
                            t ? o(t) : e.size + r < 0 ? o(new Ft.EINVAL("resulting file offset would be negative")) : (s.position = e.size + r, o(null, s.position))
                        }
                        var s = t.openFiles[n];
                        s || o(new Ft.EBADF), "SET" === i ? 0 > r ? o(new Ft.EINVAL("resulting file offset would be negative")) : (s.position = r, o(null, s.position)) : "CUR" === i ? s.position + r < 0 ? o(new Ft.EINVAL("resulting file offset would be negative")) : (s.position += r, o(null, s.position)) : "END" === i ? m(e, s, a) : o(new Ft.EINVAL("whence argument is not a proper value"))
                    }

                    function rt(t, e, n, r) {
                        N(n, r) && y(e, n, r)
                    }

                    function it(t, e, n, r, i, o) {
                        if (N(n, o)) {
                            var a = Date.now();
                            r = r ? r : a, i = i ? i : a, R(e, n, r, i, o)
                        }
                    }

                    function ot(t, e, n, r, i, o) {
                        var a = Date.now();
                        r = r ? r : a, i = i ? i : a;
                        var s = t.openFiles[n];
                        s ? ht(s.flags).contains(Tt) ? I(e, s, r, i, o) : o(new Ft.EBADF("descriptor does not permit writing")) : o(new Ft.EBADF)
                    }

                    function at(t, e, n, i, a) {
                        function s(t, n) {
                            t ? a(t) : r(e, i, n, {
                                ctime: Date.now()
                            }, a)
                        }

                        function u(t) {
                            t ? a(t) : e.getObject(O[S].id, s)
                        }

                        function f(t) {
                            t ? a(t) : (b.id === _.id && (w = O), delete w[A], e.putObject(b.data, w, u))
                        }

                        function l(t) {
                            t ? a(t) : (O[S] = w[A], e.putObject(_.data, O, f))
                        }

                        function h(t, n) {
                            t ? a(t) : (O = n, ht(O).has(S) ? c(e, i, l) : l())
                        }

                        function d(t, n) {
                            t ? a(t) : (_ = n, e.getObject(_.data, h))
                        }

                        function p(t, n) {
                            t ? a(t) : (w = n, o(e, I, d))
                        }

                        function m(t, n) {
                            t ? a(t) : (b = n, e.getObject(n.data, p))
                        }

                        function g(t) {
                            t ? a(t) : E(e, n, a)
                        }

                        function y(t, r) {
                            t ? a(t) : "DIRECTORY" === r.mode ? o(e, R, m) : v(e, n, i, g)
                        }
                        if (N(n, a) && N(i, a)) {
                            n = pt(n), i = pt(i);
                            var b, w, _, O, R = dt.dirname(n),
                                I = dt.dirname(n),
                                A = dt.basename(n),
                                S = dt.basename(i);
                            o(e, n, y)
                        }
                    }

                    function st(t, e, n, r, i, o) {
                        o = arguments[arguments.length - 1], N(n, o) && N(r, o) && b(e, n, r, o)
                    }

                    function ut(t, e, n, r) {
                        N(n, r) && w(e, n, r)
                    }

                    function ct(t, e, n, r) {
                        function i(e, n) {
                            if (e) r(e);
                            else {
                                var i = new Yt(n, t.name);
                                r(null, i)
                            }
                        }
                        N(n, r) && g(e, n, i)
                    }

                    function ft(t, e, n, r, i) {
                        i = arguments[arguments.length - 1], r = r || 0, N(n, i) && _(e, n, r, i)
                    }

                    function lt(t, e, n, r, i) {
                        i = arguments[arguments.length - 1], r = r || 0;
                        var o = t.openFiles[n];
                        o ? ht(o.flags).contains(Tt) ? O(e, o, r, i) : i(new Ft.EBADF("descriptor does not permit writing")) : i(new Ft.EBADF)
                    }
                    var ht = t("../../lib/nodash.js"),
                        dt = t("../path.js"),
                        pt = dt.normalize,
                        mt = dt.dirname,
                        gt = dt.basename,
                        vt = dt.isAbsolute,
                        Et = dt.isNull,
                        yt = t("../constants.js"),
                        bt = yt.MODE_FILE,
                        wt = yt.MODE_DIRECTORY,
                        _t = yt.MODE_SYMBOLIC_LINK,
                        Ot = yt.MODE_META,
                        Rt = yt.ROOT_DIRECTORY_NAME,
                        It = yt.SUPER_NODE_ID,
                        At = yt.SYMLOOP_MAX,
                        St = yt.O_READ,
                        Tt = yt.O_WRITE,
                        xt = yt.O_CREATE,
                        Lt = yt.O_EXCLUSIVE,
                        jt = (yt.O_TRUNCATE, yt.O_APPEND),
                        Dt = yt.O_FLAGS,
                        Ct = yt.XATTR_CREATE,
                        Nt = yt.XATTR_REPLACE,
                        Pt = yt.FS_NOMTIME,
                        Bt = yt.FS_NOCTIME,
                        Mt = t("../encoding.js"),
                        Ft = t("../errors.js"),
                        kt = t("../directory-entry.js"),
                        Ut = t("../open-file-description.js"),
                        Wt = t("../super-node.js"),
                        Vt = t("../node.js"),
                        Yt = t("../stats.js"),
                        zt = t("../buffer.js");
                    e.exports = {
                        ensureRootDirectory: s,
                        open: P,
                        close: B,
                        mknod: M,
                        mkdir: F,
                        rmdir: k,
                        unlink: Y,
                        stat: U,
                        fstat: W,
                        link: V,
                        read: z,
                        readFile: X,
                        write: q,
                        writeFile: H,
                        appendFile: Q,
                        exists: J,
                        getxattr: $,
                        fgetxattr: G,
                        setxattr: K,
                        fsetxattr: Z,
                        removexattr: tt,
                        fremovexattr: et,
                        lseek: nt,
                        readdir: rt,
                        utimes: it,
                        futimes: ot,
                        rename: at,
                        symlink: st,
                        readlink: ut,
                        lstat: ct,
                        truncate: ft,
                        ftruncate: lt
                    }
                }, {
                    "../../lib/nodash.js": 4,
                    "../buffer.js": 14,
                    "../constants.js": 15,
                    "../directory-entry.js": 16,
                    "../encoding.js": 17,
                    "../errors.js": 18,
                    "../node.js": 23,
                    "../open-file-description.js": 24,
                    "../path.js": 25,
                    "../stats.js": 33,
                    "../super-node.js": 34
                }],
                20: [function(t, e, n) {
                    function r(t) {
                        return "function" == typeof t ? t : function(t) {
                            if (t) throw t
                        }
                    }

                    function i(t) {
                        t && console.error("Filer error: ", t)
                    }

                    function o(t, e) {
                        function n() {
                            N.forEach(function(t) {
                                t.call(this)
                            }.bind(j)), N = null
                        }

                        function r(t) {
                            return function(e) {
                                function n(e) {
                                    var r = S();
                                    t.getObject(r, function(t, i) {
                                        return t ? void e(t) : void(i ? n(e) : e(null, r))
                                    })
                                }
                                return a(c).contains(m) ? void e(null, S()) : void n(e)
                            }
                        }

                        function o(t) {
                            if (t.length) {
                                var e = E.getInstance();
                                t.forEach(function(t) {
                                    e.emit(t.event, t.path)
                                })
                            }
                        }
                        t = t || {}, e = e || i;
                        var c = t.flags,
                            S = t.guid ? t.guid : w,
                            T = t.provider || new g.Default(t.name || f),
                            x = t.name || T.name,
                            L = a(c).contains(l),
                            j = this;
                        j.readyState = d, j.name = x, j.error = null, j.stdin = _, j.stdout = O, j.stderr = R, this.Shell = v.bind(void 0, this);
                        var D = {},
                            C = I;
                        Object.defineProperty(this, "openFiles", {
                            get: function() {
                                return D
                            }
                        }), this.allocDescriptor = function(t) {
                            var e = C++;
                            return D[e] = t, e
                        }, this.releaseDescriptor = function(t) {
                            delete D[t]
                        };
                        var N = [];
                        this.queueOrRun = function(t) {
                            var e;
                            return h == j.readyState ? t.call(j) : p == j.readyState ? e = new b.EFILESYSTEMERROR("unknown error") : N.push(t), e
                        }, this.watch = function(t, e, n) {
                            if (s(t)) throw new Error("Path must be a string without null bytes.");
                            "function" == typeof e && (n = e, e = {}), e = e || {}, n = n || u;
                            var r = new y;
                            return r.start(t, !1, e.recursive), r.on("change", n), r
                        }, T.open(function(t) {
                            function i(t) {
                                function i(t) {
                                    var e = T[t]();
                                    return e.flags = c, e.changes = [], e.guid = r(e), e.close = function() {
                                        var t = e.changes;
                                        o(t), t.length = 0
                                    }, e
                                }
                                j.provider = {
                                    openReadWriteContext: function() {
                                        return i("getReadWriteContext")
                                    },
                                    openReadOnlyContext: function() {
                                        return i("getReadOnlyContext")
                                    }
                                }, t ? j.readyState = p : j.readyState = h, n(), e(t, j)
                            }
                            if (t) return i(t);
                            var a = T.getReadWriteContext();
                            a.guid = r(a), L ? a.clear(function(t) {
                                return t ? i(t) : void A.ensureRootDirectory(a, i)
                            }) : A.ensureRootDirectory(a, i)
                        })
                    }
                    var a = t("../../lib/nodash.js"),
                        s = t("../path.js").isNull,
                        u = t("../shared.js").nop,
                        c = t("../constants.js"),
                        f = c.FILE_SYSTEM_NAME,
                        l = c.FS_FORMAT,
                        h = c.FS_READY,
                        d = c.FS_PENDING,
                        p = c.FS_ERROR,
                        m = c.FS_NODUPEIDCHECK,
                        g = t("../providers/index.js"),
                        v = t("../shell/shell.js"),
                        E = t("../../lib/intercom.js"),
                        y = t("../fs-watcher.js"),
                        b = t("../errors.js"),
                        w = t("../shared.js").guid,
                        _ = c.STDIN,
                        O = c.STDOUT,
                        R = c.STDERR,
                        I = c.FIRST_DESCRIPTOR,
                        A = t("./implementation.js");
                    o.providers = g, ["open", "close", "mknod", "mkdir", "rmdir", "stat", "fstat", "link", "unlink", "read", "readFile", "write", "writeFile", "appendFile", "exists", "lseek", "readdir", "rename", "readlink", "symlink", "lstat", "truncate", "ftruncate", "utimes", "futimes", "setxattr", "getxattr", "fsetxattr", "fgetxattr", "removexattr", "fremovexattr"].forEach(function(t) {
                        o.prototype[t] = function() {
                            var e = this,
                                n = Array.prototype.slice.call(arguments, 0),
                                i = n.length - 1,
                                o = "function" != typeof n[i],
                                a = r(n[i]),
                                s = e.queueOrRun(function() {
                                    function r() {
                                        s.close(), a.apply(e, arguments)
                                    }
                                    var s = e.provider.openReadWriteContext();
                                    if (p === e.readyState) {
                                        var u = new b.EFILESYSTEMERROR("filesystem unavailable, operation canceled");
                                        return a.call(e, u)
                                    }
                                    o ? n.push(r) : n[i] = r;
                                    var c = [e, s].concat(n);
                                    A[t].apply(null, c)
                                });
                            s && a(s)
                        }
                    }), e.exports = o
                }, {
                    "../../lib/intercom.js": 3,
                    "../../lib/nodash.js": 4,
                    "../constants.js": 15,
                    "../errors.js": 18,
                    "../fs-watcher.js": 21,
                    "../path.js": 25,
                    "../providers/index.js": 26,
                    "../shared.js": 30,
                    "../shell/shell.js": 32,
                    "./implementation.js": 19
                }],
                21: [function(t, e, n) {
                    function r() {
                        function t(t) {
                            (n === t || s && 0 === t.indexOf(e)) && r.trigger("change", "change", t)
                        }
                        i.call(this);
                        var e, n, r = this,
                            s = !1;
                        r.start = function(r, i, u) {
                            if (!n) {
                                if (o.isNull(r)) throw new Error("Path must be a string without null bytes.");
                                n = o.normalize(r), s = u === !0, s && (e = "/" === n ? "/" : n + "/");
                                var c = a.getInstance();
                                c.on("change", t)
                            }
                        }, r.close = function() {
                            var e = a.getInstance();
                            e.off("change", t), r.removeAllListeners("change")
                        }
                    }
                    var i = t("../lib/eventemitter.js"),
                        o = t("./path.js"),
                        a = t("../lib/intercom.js");
                    r.prototype = new i, r.prototype.constructor = r, e.exports = r
                }, {
                    "../lib/eventemitter.js": 2,
                    "../lib/intercom.js": 3,
                    "./path.js": 25
                }],
                22: [function(t, e, n) {
                    e.exports = {
                        FileSystem: t("./filesystem/interface.js"),
                        Buffer: t("./buffer.js"),
                        Path: t("./path.js"),
                        Errors: t("./errors.js"),
                        Shell: t("./shell/shell.js")
                    }
                }, {
                    "./buffer.js": 14,
                    "./errors.js": 18,
                    "./filesystem/interface.js": 20,
                    "./path.js": 25,
                    "./shell/shell.js": 32
                }],
                23: [function(t, e, n) {
                    function r(t) {
                        var e = Date.now();
                        this.id = t.id, this.mode = t.mode || o, this.size = t.size || 0, this.atime = t.atime || e, this.ctime = t.ctime || e, this.mtime = t.mtime || e, this.flags = t.flags || [], this.xattrs = t.xattrs || {}, this.nlinks = t.nlinks || 0, this.version = t.version || 0, this.blksize = void 0, this.nblocks = 1, this.data = t.data
                    }

                    function i(t, e, n) {
                        t[e] ? n(null) : t.guid(function(r, i) {
                            t[e] = i, n(r)
                        })
                    }
                    var o = t("./constants.js").MODE_FILE;
                    r.create = function(t, e) {
                        i(t, "id", function(n) {
                            return n ? void e(n) : void i(t, "data", function(n) {
                                return n ? void e(n) : void e(null, new r(t))
                            })
                        })
                    }, e.exports = r
                }, {
                    "./constants.js": 15
                }],
                24: [function(t, e, n) {
                    function r(t, e, n, r) {
                        this.path = t, this.id = e, this.flags = n, this.position = r
                    }
                    var i = t("./errors.js");
                    r.prototype.getNode = function(t, e) {
                        function n(t, n) {
                            return t ? e(t) : n ? void e(null, n) : e(new i.EBADF("file descriptor refers to unknown node", o))
                        }
                        var r = this.id,
                            o = this.path;
                        t.getObject(r, n)
                    }, e.exports = r
                }, {
                    "./errors.js": 18
                }],
                25: [function(t, e, n) {
                    function r(t, e) {
                        for (var n = 0, r = t.length - 1; r >= 0; r--) {
                            var i = t[r];
                            "." === i ? t.splice(r, 1) : ".." === i ? (t.splice(r, 1), n++) : n && (t.splice(r, 1), n--)
                        }
                        if (e)
                            for (; n--; n) t.unshift("..");
                        return t
                    }

                    function i() {
                        for (var t = "", e = !1, n = arguments.length - 1; n >= -1 && !e; n--) {
                            var i = n >= 0 ? arguments[n] : "/";
                            "string" == typeof i && i && (t = i + "/" + t, e = "/" === i.charAt(0))
                        }
                        return t = r(t.split("/").filter(function(t) {
                            return !!t
                        }), !e).join("/"), (e ? "/" : "") + t || "."
                    }

                    function o(t) {
                        var e = "/" === t.charAt(0);
                        return "/" === t.substr(-1), t = r(t.split("/").filter(function(t) {
                            return !!t
                        }), !e).join("/"), t || e || (t = "."), (e ? "/" : "") + t
                    }

                    function a() {
                        var t = Array.prototype.slice.call(arguments, 0);
                        return o(t.filter(function(t, e) {
                            return t && "string" == typeof t
                        }).join("/"))
                    }

                    function s(t, e) {
                        function n(t) {
                            for (var e = 0; e < t.length && "" === t[e]; e++);
                            for (var n = t.length - 1; n >= 0 && "" === t[n]; n--);
                            return e > n ? [] : t.slice(e, n - e + 1)
                        }
                        t = i(t).substr(1), e = i(e).substr(1);
                        for (var r = n(t.split("/")), o = n(e.split("/")), a = Math.min(r.length, o.length), s = a, u = 0; a > u; u++)
                            if (r[u] !== o[u]) {
                                s = u;
                                break
                            }
                        for (var c = [], u = s; u < r.length; u++) c.push("..");
                        return c = c.concat(o.slice(s)), c.join("/")
                    }

                    function u(t) {
                        var e = g(t),
                            n = e[0],
                            r = e[1];
                        return n || r ? (r && (r = r.substr(0, r.length - 1)), n + r) : "."
                    }

                    function c(t, e) {
                        var n = g(t)[2];
                        return e && n.substr(-1 * e.length) === e && (n = n.substr(0, n.length - e.length)), "" === n ? "/" : n
                    }

                    function f(t) {
                        return g(t)[3]
                    }

                    function l(t) {
                        return "/" === t.charAt(0) ? !0 : !1
                    }

                    function h(t) {
                        return -1 !== ("" + t).indexOf("\x00") ? !0 : !1
                    }

                    function d(t) {
                        return t.replace(/\/*$/, "/")
                    }

                    function p(t) {
                        return t = t.replace(/\/*$/, ""), "" === t ? "/" : t
                    }
                    var m = /^(\/?)([\s\S]+\/(?!$)|\/)?((?:\.{1,2}$|[\s\S]+?)?(\.[^.\/]*)?)$/,
                        g = function(t) {
                            var e = m.exec(t);
                            return [e[1] || "", e[2] || "", e[3] || "", e[4] || ""]
                        };
                    e.exports = {
                        normalize: o,
                        resolve: i,
                        join: a,
                        relative: s,
                        sep: "/",
                        delimiter: ":",
                        dirname: u,
                        basename: c,
                        extname: f,
                        isAbsolute: l,
                        isNull: h,
                        addTrailing: d,
                        removeTrailing: p
                    }
                }, {}],
                26: [function(t, e, n) {
                    var r = t("./indexeddb.js"),
                        i = t("./websql.js"),
                        o = t("./memory.js");
                    e.exports = {
                        IndexedDB: r,
                        WebSQL: i,
                        Memory: o,
                        Default: r,
                        Fallback: function() {
                            function t() {
                                throw "[Filer Error] Your browser doesn't support IndexedDB or WebSQL."
                            }
                            return r.isSupported() ? r : i.isSupported() ? i : (t.isSupported = function() {
                                return !1
                            }, t)
                        }()
                    }
                }, {
                    "./indexeddb.js": 27,
                    "./memory.js": 28,
                    "./websql.js": 29
                }],
                27: [function(t, e, n) {
                    (function(n, r) {
                        function i(t, e) {
                            var n = t.transaction(c, e);
                            this.objectStore = n.objectStore(c)
                        }

                        function o(t, e, n) {
                            try {
                                var r = t.get(e);
                                r.onsuccess = function(t) {
                                    var e = t.target.result;
                                    n(null, e)
                                }, r.onerror = function(t) {
                                    n(t)
                                }
                            } catch (i) {
                                n(i)
                            }
                        }

                        function a(t, e, n, r) {
                            try {
                                var i = t.put(n, e);
                                i.onsuccess = function(t) {
                                    var e = t.target.result;
                                    r(null, e)
                                }, i.onerror = function(t) {
                                    r(t)
                                }
                            } catch (o) {
                                r(o)
                            }
                        }

                        function s(t) {
                            this.name = t || u, this.db = null
                        }
                        var u = t("../constants.js").FILE_SYSTEM_NAME,
                            c = t("../constants.js").FILE_STORE_NAME,
                            f = t("../constants.js").IDB_RW,
                            l = (t("../constants.js").IDB_RO, t("../errors.js")),
                            h = t("../buffer.js"),
                            d = n.indexedDB || n.mozIndexedDB || n.webkitIndexedDB || n.msIndexedDB;
                        i.prototype.clear = function(t) {
                            try {
                                var e = this.objectStore.clear();
                                e.onsuccess = function(e) {
                                    t()
                                }, e.onerror = function(e) {
                                    t(e)
                                }
                            } catch (n) {
                                t(n)
                            }
                        }, i.prototype.getObject = function(t, e) {
                            o(this.objectStore, t, e)
                        }, i.prototype.getBuffer = function(t, e) {
                            o(this.objectStore, t, function(t, n) {
                                return t ? e(t) : void e(null, new h(n))
                            })
                        }, i.prototype.putObject = function(t, e, n) {
                            a(this.objectStore, t, e, n)
                        }, i.prototype.putBuffer = function(t, e, n) {
                            var i;
                            i = r._useTypedArrays ? e.buffer : e.toArrayBuffer(), a(this.objectStore, t, i, n)
                        }, i.prototype["delete"] = function(t, e) {
                            try {
                                var n = this.objectStore["delete"](t);
                                n.onsuccess = function(t) {
                                    var n = t.target.result;
                                    e(null, n)
                                }, n.onerror = function(t) {
                                    e(t)
                                }
                            } catch (r) {
                                e(r)
                            }
                        }, s.isSupported = function() {
                            return !!d
                        }, s.prototype.open = function(t) {
                            var e = this;
                            if (e.db) return t();
                            var n = d.open(e.name);
                            n.onupgradeneeded = function(t) {
                                var e = t.target.result;
                                e.objectStoreNames.contains(c) && e.deleteObjectStore(c), e.createObjectStore(c)
                            }, n.onsuccess = function(n) {
                                e.db = n.target.result, t()
                            }, n.onerror = function(e) {
                                t(new l.EINVAL("IndexedDB cannot be accessed. If private browsing is enabled, disable it."))
                            }
                        }, s.prototype.getReadOnlyContext = function() {
                            return new i(this.db, f)
                        }, s.prototype.getReadWriteContext = function() {
                            return new i(this.db, f)
                        }, e.exports = s
                    }).call(this, "undefined" != typeof global ? global : "undefined" != typeof self ? self : "undefined" != typeof window ? window : {}, t("buffer").Buffer)
                }, {
                    "../buffer.js": 14,
                    "../constants.js": 15,
                    "../errors.js": 18,
                    buffer: 6
                }],
                28: [function(t, e, n) {
                    function r(t, e) {
                        this.readOnly = e, this.objectStore = t
                    }

                    function i(t) {
                        this.name = t || o
                    }
                    var o = t("../constants.js").FILE_SYSTEM_NAME,
                        a = t("../../lib/async.js").setImmediate,
                        s = function() {
                            var t = {};
                            return function(e) {
                                return t.hasOwnProperty(e) || (t[e] = {}), t[e]
                            }
                        }();
                    r.prototype.clear = function(t) {
                        if (this.readOnly) return void a(function() {
                            t("[MemoryContext] Error: write operation on read only context")
                        });
                        var e = this.objectStore;
                        Object.keys(e).forEach(function(t) {
                            delete e[t]
                        }), a(t)
                    }, r.prototype.getObject = r.prototype.getBuffer = function(t, e) {
                        var n = this;
                        a(function() {
                            e(null, n.objectStore[t])
                        })
                    }, r.prototype.putObject = r.prototype.putBuffer = function(t, e, n) {
                        return this.readOnly ? void a(function() {
                            n("[MemoryContext] Error: write operation on read only context")
                        }) : (this.objectStore[t] = e, void a(n))
                    }, r.prototype["delete"] = function(t, e) {
                        return this.readOnly ? void a(function() {
                            e("[MemoryContext] Error: write operation on read only context")
                        }) : (delete this.objectStore[t], void a(e))
                    }, i.isSupported = function() {
                        return !0
                    }, i.prototype.open = function(t) {
                        this.db = s(this.name), a(t)
                    }, i.prototype.getReadOnlyContext = function() {
                        return new r(this.db, !0)
                    }, i.prototype.getReadWriteContext = function() {
                        return new r(this.db, !1)
                    }, e.exports = i
                }, {
                    "../../lib/async.js": 1,
                    "../constants.js": 15
                }],
                29: [function(t, e, n) {
                    (function(n) {
                        function r(t, e) {
                            var n = this;
                            this.getTransaction = function(r) {
                                return n.transaction ? void r(n.transaction) : void t[e ? "readTransaction" : "transaction"](function(t) {
                                    n.transaction = t, r(t)
                                })
                            }
                        }

                        function i(t, e, n) {
                            function r(t, e) {
                                var r = 0 === e.rows.length ? null : e.rows.item(0).data;
                                n(null, r)
                            }

                            function i(t, e) {
                                n(e)
                            }
                            t(function(t) {
                                t.executeSql("SELECT data FROM " + u + " WHERE id = ? LIMIT 1;", [e], r, i)
                            })
                        }

                        function o(t, e, n, r) {
                            function i(t, e) {
                                r(null)
                            }

                            function o(t, e) {
                                r(e)
                            }
                            t(function(t) {
                                t.executeSql("INSERT OR REPLACE INTO " + u + " (id, data) VALUES (?, ?);", [e, n], i, o)
                            })
                        }

                        function a(t) {
                            this.name = t || s, this.db = null
                        }
                        var s = t("../constants.js").FILE_SYSTEM_NAME,
                            u = t("../constants.js").FILE_STORE_NAME,
                            c = t("../constants.js").WSQL_VERSION,
                            f = t("../constants.js").WSQL_SIZE,
                            l = t("../constants.js").WSQL_DESC,
                            h = t("../errors.js"),
                            d = t("../buffer.js"),
                            p = t("base64-arraybuffer");
                        r.prototype.clear = function(t) {
                            function e(e, n) {
                                t(n)
                            }

                            function n(e, n) {
                                t(null)
                            }
                            this.getTransaction(function(t) {
                                t.executeSql("DELETE FROM " + u + ";", [], n, e)
                            })
                        }, r.prototype.getObject = function(t, e) {
                            i(this.getTransaction, t, function(t, n) {
                                if (t) return e(t);
                                try {
                                    n && (n = JSON.parse(n))
                                } catch (r) {
                                    return e(r)
                                }
                                e(null, n)
                            })
                        }, r.prototype.getBuffer = function(t, e) {
                            i(this.getTransaction, t, function(t, n) {
                                if (t) return e(t);
                                if (n || "" === n) {
                                    var r = p.decode(n);
                                    n = new d(r)
                                }
                                e(null, n)
                            })
                        }, r.prototype.putObject = function(t, e, n) {
                            var r = JSON.stringify(e);
                            o(this.getTransaction, t, r, n)
                        }, r.prototype.putBuffer = function(t, e, n) {
                            var r = p.encode(e.buffer);
                            o(this.getTransaction, t, r, n)
                        }, r.prototype["delete"] = function(t, e) {
                            function n(t, n) {
                                e(null)
                            }

                            function r(t, n) {
                                e(n)
                            }
                            this.getTransaction(function(e) {
                                e.executeSql("DELETE FROM " + u + " WHERE id = ?;", [t], n, r)
                            })
                        }, a.isSupported = function() {
                            return !!n.openDatabase
                        }, a.prototype.open = function(t) {
                            function e(e, n) {
                                5 === n.code && t(new h.EINVAL("WebSQL cannot be accessed. If private browsing is enabled, disable it.")), t(n)
                            }

                            function r(e, n) {
                                i.db = o, t()
                            }
                            var i = this;
                            if (i.db) return t();
                            var o = n.openDatabase(i.name, c, l, f);
                            return o ? void o.transaction(function(t) {
                                function n(t) {
                                    t.executeSql("CREATE INDEX IF NOT EXISTS idx_" + u + "_id on " + u + " (id);", [], r, e)
                                }
                                t.executeSql("CREATE TABLE IF NOT EXISTS " + u + " (id unique, data TEXT);", [], n, e)
                            }) : void t("[WebSQL] Unable to open database.")
                        }, a.prototype.getReadOnlyContext = function() {
                            return new r(this.db, !0)
                        }, a.prototype.getReadWriteContext = function() {
                            return new r(this.db, !1)
                        }, e.exports = a
                    }).call(this, "undefined" != typeof global ? global : "undefined" != typeof self ? self : "undefined" != typeof window ? window : {})
                }, {
                    "../buffer.js": 14,
                    "../constants.js": 15,
                    "../errors.js": 18,
                    "base64-arraybuffer": 5
                }],
                30: [function(t, e, n) {
                    function r() {
                        return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(t) {
                            var e = 16 * Math.random() | 0,
                                n = "x" == t ? e : 3 & e | 8;
                            return n.toString(16)
                        }).toUpperCase()
                    }

                    function i() {}

                    function o(t) {
                        for (var e = [], n = t.length, r = 0; n > r; r++) e[r] = t[r];
                        return e
                    }
                    e.exports = {
                        guid: r,
                        u8toArray: o,
                        nop: i
                    }
                }, {}],
                31: [function(t, e, n) {
                    var r = t("../constants.js").ENVIRONMENT;
                    e.exports = function(t) {
                        t = t || {}, t.TMP = t.TMP || r.TMP, t.PATH = t.PATH || r.PATH, this.get = function(e) {
                            return t[e]
                        }, this.set = function(e, n) {
                            t[e] = n
                        }
                    }
                }, {
                    "../constants.js": 15
                }],
                32: [function(t, e, n) {
                    function r(t, e) {
                        e = e || {};
                        var n = new a(e.env),
                            r = "/";
                        Object.defineProperty(this, "fs", {
                            get: function() {
                                return t
                            },
                            enumerable: !0
                        }), Object.defineProperty(this, "env", {
                            get: function() {
                                return n
                            },
                            enumerable: !0
                        }), this.cd = function(e, n) {
                            e = i.resolve(r, e), t.stat(e, function(t, i) {
                                return t ? void n(new o.ENOTDIR(null, e)) : void("DIRECTORY" === i.type ? (r = e, n()) : n(new o.ENOTDIR(null, e)))
                            })
                        }, this.pwd = function() {
                            return r
                        }
                    }
                    var i = t("../path.js"),
                        o = t("../errors.js"),
                        a = t("./environment.js"),
                        s = t("../../lib/async.js"),
                        u = (t("../encoding.js"), t("minimatch"));
                    r.prototype.exec = function(t, e, n) {
                        var r = this,
                            o = r.fs;
                        "function" == typeof e && (n = e, e = []), e = e || [], n = n || function() {}, t = i.resolve(r.pwd(), t), o.readFile(t, "utf8", function(t, r) {
                            if (t) return void n(t);
                            try {
                                var i = new Function("fs", "args", "callback", r);
                                i(o, e, n)
                            } catch (a) {
                                n(a)
                            }
                        })
                    }, r.prototype.touch = function(t, e, n) {
                        function r(t) {
                            s.writeFile(t, "", n)
                        }

                        function o(t) {
                            var r = Date.now(),
                                i = e.date || r,
                                o = e.date || r;
                            s.utimes(t, i, o, n)
                        }
                        var a = this,
                            s = a.fs;
                        "function" == typeof e && (n = e, e = {}), e = e || {}, n = n || function() {}, t = i.resolve(a.pwd(), t), s.stat(t, function(i, a) {
                            i ? e.updateOnly === !0 ? n() : r(t) : o(t)
                        })
                    }, r.prototype.cat = function(t, e) {
                        function n(t, e) {
                            var n = i.resolve(r.pwd(), t);
                            a.readFile(n, "utf8", function(t, n) {
                                return t ? void e(t) : (u += n + "\n", void e())
                            })
                        }
                        var r = this,
                            a = r.fs,
                            u = "";
                        return e = e || function() {}, t ? (t = "string" == typeof t ? [t] : t, void s.eachSeries(t, n, function(t) {
                            t ? e(t) : e(null, u.replace(/\n$/, ""))
                        })) : void e(new o.EINVAL("Missing files argument"))
                    }, r.prototype.ls = function(t, e, n) {
                        function r(t, n) {
                            var o = i.resolve(a.pwd(), t),
                                c = [];
                            u.readdir(o, function(t, a) {
                                function f(t, n) {
                                    t = i.join(o, t), u.stat(t, function(a, s) {
                                        if (a) return void n(a);
                                        var u = {
                                            path: i.basename(t),
                                            links: s.nlinks,
                                            size: s.size,
                                            modified: s.mtime,
                                            type: s.type
                                        };
                                        e.recursive && "DIRECTORY" === s.type ? r(i.join(o, u.path), function(t, e) {
                                            return t ? void n(t) : (u.contents = e, c.push(u), void n())
                                        }) : (c.push(u), n())
                                    })
                                }
                                return t ? void n(t) : void s.eachSeries(a, f, function(t) {
                                    n(t, c)
                                })
                            })
                        }
                        var a = this,
                            u = a.fs;
                        return "function" == typeof e && (n = e, e = {}), e = e || {}, n = n || function() {}, t ? void r(t, n) : void n(new o.EINVAL("Missing dir argument"))
                    }, r.prototype.rm = function(t, e, n) {
                        function r(t, n) {
                            t = i.resolve(a.pwd(), t), u.stat(t, function(a, c) {
                                return a ? void n(a) : "FILE" === c.type ? void u.unlink(t, n) : void u.readdir(t, function(a, c) {
                                    return a ? void n(a) : 0 === c.length ? void u.rmdir(t, n) : e.recursive ? (c = c.map(function(e) {
                                        return i.join(t, e)
                                    }), void s.eachSeries(c, r, function(e) {
                                        return e ? void n(e) : void u.rmdir(t, n)
                                    })) : void n(new o.ENOTEMPTY(null, t))
                                })
                            })
                        }
                        var a = this,
                            u = a.fs;
                        return "function" == typeof e && (n = e, e = {}), e = e || {}, n = n || function() {}, t ? void r(t, n) : void n(new o.EINVAL("Missing path argument"))
                    }, r.prototype.tempDir = function(t) {
                        var e = this,
                            n = e.fs,
                            r = e.env.get("TMP");
                        t = t || function() {}, n.mkdir(r, function(e) {
                            t(null, r)
                        })
                    }, r.prototype.mkdirp = function(t, e) {
                        function n(t, e) {
                            a.stat(t, function(r, s) {
                                if (s) {
                                    if (s.isDirectory()) return void e();
                                    if (s.isFile()) return void e(new o.ENOTDIR(null, t))
                                } else {
                                    if (r && "ENOENT" !== r.code) return void e(r);
                                    var u = i.dirname(t);
                                    "/" === u ? a.mkdir(t, function(t) {
                                        return t && "EEXIST" != t.code ? void e(t) : void e()
                                    }) : n(u, function(n) {
                                        return n ? e(n) : void a.mkdir(t, function(t) {
                                            return t && "EEXIST" != t.code ? void e(t) : void e()
                                        })
                                    })
                                }
                            })
                        }
                        var r = this,
                            a = r.fs;
                        return e = e || function() {}, t ? "/" === t ? void e() : void n(t, e) : void e(new o.EINVAL("Missing path argument"))
                    }, r.prototype.find = function(t, e, n) {
                        function r(t, e) {
                            h(t, function(n) {
                                return n ? void e(n) : (d.push(t), void e())
                            })
                        }

                        function a(t, n) {
                            var o = i.removeTrailing(t);
                            return e.regex && !e.regex.test(o) ? void n() : e.name && !u(i.basename(o), e.name) ? void n() : e.path && !u(i.dirname(o), e.path) ? void n() : void r(t, n)
                        }

                        function c(t, e) {
                            t = i.resolve(f.pwd(), t), l.readdir(t, function(n, r) {
                                return n ? void("ENOTDIR" === n.code ? a(t, e) : e(n)) : void a(i.addTrailing(t), function(n) {
                                    return n ? void e(n) : (r = r.map(function(e) {
                                        return i.join(t, e)
                                    }), void s.eachSeries(r, c, function(t) {
                                        e(t, d)
                                    }))
                                })
                            })
                        }
                        var f = this,
                            l = f.fs;
                        "function" == typeof e && (n = e, e = {}), e = e || {}, n = n || function() {};
                        var h = e.exec || function(t, e) {
                                e()
                            },
                            d = [];
                        return t ? void l.stat(t, function(e, r) {
                            return e ? void n(e) : r.isDirectory() ? void c(t, n) : void n(new o.ENOTDIR(null, t))
                        }) : void n(new o.EINVAL("Missing path argument"))
                    }, e.exports = r
                }, {
                    "../../lib/async.js": 1,
                    "../encoding.js": 17,
                    "../errors.js": 18,
                    "../path.js": 25,
                    "./environment.js": 31,
                    minimatch: 11
                }],
                33: [function(t, e, n) {
                    function r(t, e) {
                        this.node = t.id, this.dev = e, this.size = t.size, this.nlinks = t.nlinks, this.atime = t.atime, this.mtime = t.mtime, this.ctime = t.ctime, this.type = t.mode
                    }
                    var i = t("./constants.js");
                    r.prototype.isFile = function() {
                        return this.type === i.MODE_FILE
                    }, r.prototype.isDirectory = function() {
                        return this.type === i.MODE_DIRECTORY
                    }, r.prototype.isSymbolicLink = function() {
                        return this.type === i.MODE_SYMBOLIC_LINK
                    }, r.prototype.isSocket = r.prototype.isFIFO = r.prototype.isCharacterDevice = r.prototype.isBlockDevice = function() {
                        return !1
                    }, e.exports = r
                }, {
                    "./constants.js": 15
                }],
                34: [function(t, e, n) {
                    function r(t) {
                        var e = Date.now();
                        this.id = i.SUPER_NODE_ID, this.mode = i.MODE_META, this.atime = t.atime || e, this.ctime = t.ctime || e, this.mtime = t.mtime || e, this.rnode = t.rnode
                    }
                    var i = t("./constants.js");
                    r.create = function(t, e) {
                        t.guid(function(n, i) {
                            return n ? void e(n) : (t.rnode = t.rnode || i, void e(null, new r(t)))
                        })
                    }, e.exports = r
                }, {
                    "./constants.js": 15
                }]
            }, {}, [22])(22)
        }), n("bramble/thirdparty/MessageChannel/uuid.core", ["require", "exports", "module"], function(t, e, n) {
            function r() {}
            r.generate = function() {
                var t = r._gri,
                    e = r._ha;
                return e(t(32), 8) + "-" + e(t(16), 4) + "-" + e(16384 | t(12), 4) + "-" + e(32768 | t(14), 4) + "-" + e(t(48), 12)
            }, r._gri = function(t) {
                return 0 > t ? NaN : 30 >= t ? 0 | Math.random() * (1 << t) : 53 >= t ? (0 | 1073741824 * Math.random()) + 1073741824 * (0 | Math.random() * (1 << t - 30)) : NaN
            }, r._ha = function(t, e) {
                for (var n = t.toString(16), r = e - n.length, i = "0"; r > 0; r >>>= 1, i += i) 1 & r && (n = i + n);
                return n
            }, n.exports = r
        }), n("bramble/ChannelUtils", ["require", "exports", "module", "bramble/thirdparty/MessageChannel/uuid.core"], function(t, e, n) {
            "use strict";

            function r(t, e) {
                a ? t.postMessage.apply(t, e) : (e.unshift(t), Window.postMessage.apply(Window, e))
            }

            function i(t, e) {
                function n(i) {
                    t.removeEventListener("message", n, !1);
                    try {
                        var o = new Uint8Array(r),
                            a = new Uint8Array(i.data.buffer);
                        e(null, o.length === a.length && o[0] === a[0] && o[1] === a[1] && o[2] === a[2] && o[3] === a[3])
                    } catch (s) {
                        e(null, !1)
                    }
                }
                var r = [1, 2, 3, 4],
                    i = new Uint8Array(r),
                    o = i.buffer;
                t.addEventListener("message", n, !1), t.postMessage({
                    buffer: o
                }, [o])
            }
            var o = t("bramble/thirdparty/MessageChannel/uuid.core"),
                a = window.MessageChannel && !window.MessageChannel._shim;
            e.checkArrayBufferTransfer = i, e.postMessage = r, e.UUID = o
        }),
        function() {
            "use strict";

            function t() {}

            function e(t, e) {
                for (var n = t.length; n--;)
                    if (t[n].listener === e) return n;
                return -1
            }

            function r(t) {
                return function() {
                    return this[t].apply(this, arguments)
                }
            }
            var i = t.prototype,
                o = this,
                a = o.EventEmitter;
            i.getListeners = function(t) {
                var e, n, r = this._getEvents();
                if (t instanceof RegExp) {
                    e = {};
                    for (n in r) r.hasOwnProperty(n) && t.test(n) && (e[n] = r[n])
                } else e = r[t] || (r[t] = []);
                return e
            }, i.flattenListeners = function(t) {
                var e, n = [];
                for (e = 0; e < t.length; e += 1) n.push(t[e].listener);
                return n
            }, i.getListenersAsObject = function(t) {
                var e, n = this.getListeners(t);
                return n instanceof Array && (e = {}, e[t] = n), e || n
            }, i.addListener = function(t, n) {
                var r, i = this.getListenersAsObject(t),
                    o = "object" == typeof n;
                for (r in i) i.hasOwnProperty(r) && -1 === e(i[r], n) && i[r].push(o ? n : {
                    listener: n,
                    once: !1
                });
                return this
            }, i.on = r("addListener"), i.addOnceListener = function(t, e) {
                return this.addListener(t, {
                    listener: e,
                    once: !0
                })
            }, i.once = r("addOnceListener"), i.defineEvent = function(t) {
                return this.getListeners(t), this
            }, i.defineEvents = function(t) {
                for (var e = 0; e < t.length; e += 1) this.defineEvent(t[e]);
                return this
            }, i.removeListener = function(t, n) {
                var r, i, o = this.getListenersAsObject(t);
                for (i in o) o.hasOwnProperty(i) && (r = e(o[i], n), -1 !== r && o[i].splice(r, 1));
                return this
            }, i.off = r("removeListener"), i.addListeners = function(t, e) {
                return this.manipulateListeners(!1, t, e)
            }, i.removeListeners = function(t, e) {
                return this.manipulateListeners(!0, t, e)
            }, i.manipulateListeners = function(t, e, n) {
                var r, i, o = t ? this.removeListener : this.addListener,
                    a = t ? this.removeListeners : this.addListeners;
                if ("object" != typeof e || e instanceof RegExp)
                    for (r = n.length; r--;) o.call(this, e, n[r]);
                else
                    for (r in e) e.hasOwnProperty(r) && (i = e[r]) && ("function" == typeof i ? o.call(this, r, i) : a.call(this, r, i));
                return this
            }, i.removeEvent = function(t) {
                var e, n = typeof t,
                    r = this._getEvents();
                if ("string" === n) delete r[t];
                else if (t instanceof RegExp)
                    for (e in r) r.hasOwnProperty(e) && t.test(e) && delete r[e];
                else delete this._events;
                return this
            }, i.removeAllListeners = r("removeEvent"), i.emitEvent = function(t, e) {
                var n, r, i, o, a = this.getListenersAsObject(t);
                for (i in a)
                    if (a.hasOwnProperty(i))
                        for (r = a[i].length; r--;) n = a[i][r], n.once === !0 && this.removeListener(t, n.listener), o = n.listener.apply(this, e || []), o === this._getOnceReturnValue() && this.removeListener(t, n.listener);
                return this
            }, i.trigger = r("emitEvent"), i.emit = function(t) {
                var e = Array.prototype.slice.call(arguments, 1);
                return this.emitEvent(t, e)
            }, i.setOnceReturnValue = function(t) {
                return this._onceReturnValue = t, this
            }, i._getOnceReturnValue = function() {
                return this.hasOwnProperty("_onceReturnValue") ? this._onceReturnValue : !0
            }, i._getEvents = function() {
                return this._events || (this._events = {})
            }, t.noConflict = function() {
                return o.EventEmitter = a, t
            }, "function" == typeof n && n.amd ? n("bramble/thirdparty/EventEmitter/EventEmitter.min", [], function() {
                return t
            }) : "object" == typeof module && module.exports ? module.exports = t : o.EventEmitter = t
        }.call(this), n("bramble/client/StateManager", [], function() {
            "use strict";

            function t(t) {
                return "bramble-property::" + t
            }

            function e(e, n) {
                var r = e.getItem(t(n));
                return r || null
            }

            function n(t, n) {
                var r = e(t, n);
                return "true" === r ? !0 : "false" === r ? !1 : null
            }

            function r(t, n) {
                var r = e(t, n);
                return 0 | r
            }

            function i(i) {
                var s;
                i ? (a.clear(), s = o) : s = a, Object.defineProperties(this, {
                    fontSize: {
                        get: function() {
                            return e(s, "fontSize")
                        },
                        set: function(e) {
                            s.setItem(t("fontSize"), e)
                        }
                    },
                    theme: {
                        get: function() {
                            return e(s, "theme")
                        },
                        set: function(e) {
                            s.setItem(t("theme"), e)
                        }
                    },
                    sidebarVisible: {
                        get: function() {
                            return n(s, "sidebarVisible")
                        },
                        set: function(e) {
                            s.setItem(t("sidebarVisible"), e)
                        }
                    },
                    sidebarWidth: {
                        get: function() {
                            return r(s, "sidebarWidth")
                        },
                        set: function(e) {
                            s.setItem(t("sidebarWidth"), e)
                        }
                    },
                    firstPaneWidth: {
                        get: function() {
                            return r(s, "firstPaneWidth")
                        },
                        set: function(e) {
                            s.setItem(t("firstPaneWidth"), e)
                        }
                    },
                    secondPaneWidth: {
                        get: function() {
                            return r(s, "secondPaneWidth")
                        },
                        set: function(e) {
                            s.setItem(t("secondPaneWidth"), e)
                        }
                    },
                    previewMode: {
                        get: function() {
                            return e(s, "previewMode")
                        },
                        set: function(e) {
                            s.setItem(t("previewMode"), e)
                        }
                    },
                    filename: {
                        get: function() {
                            return e(s, "filename")
                        },
                        set: function(e) {
                            s.setItem(t("filename"), e)
                        }
                    },
                    fullPath: {
                        get: function() {
                            return e(s, "fullPath")
                        },
                        set: function(e) {
                            s.setItem(t("fullPath"), e)
                        }
                    },
                    wordWrap: {
                        get: function() {
                            return n(s, "wordWrap")
                        },
                        set: function(e) {
                            s.setItem(t("wordWrap"), e)
                        }
                    }
                })
            }
            var o = {
                    _items: {},
                    getItem: function(t) {
                        return o._items[t]
                    },
                    setItem: function(t, e) {
                        e = "" + e, o._items[t] = e
                    },
                    clear: function() {
                        o._items = {}
                    }
                },
                a = function(t) {
                    return "undefined" == typeof t.localStorage ? o : t.localStorage
                }(window);
            return i
        }), n("bramble/thirdparty/MessageChannel/message_channel", ["bramble/thirdparty/MessageChannel/uuid.core"], function(t) {
            function e(t) {
                return t && "[object Function]" === Object.prototype.toString.call(t)
            }

            function n() {
                return "undefined" == typeof Worker && "undefined" == typeof o
            }
            var r = window,
                i = r,
                o = i.Window,
                a = !1,
                s = [].slice;
            if (a || !i.MessageChannel) {
                var u = function(t) {
                        return "undefined" != typeof window && i instanceof o && (!e(i.Worker) || !(t instanceof Worker))
                    },
                    c = function(t) {
                        if (h.verbose) {
                            var e = s.apply(arguments);
                            e.unshift("MCNP: "), console.log.apply(console, e)
                        }
                    },
                    f = {},
                    l = i.MessagePort = function(e) {
                        this._entangledPortUuid = null, this.destinationUrl = null, this._listeners = {}, this._messageQueue = [], this._messageQueueEnabled = !1, this._currentTarget = null, this.uuid = e || t.generate(), f[this.uuid] = this, this.log("created")
                    };
                l.prototype = {
                    start: function() {
                        var t, e = this;
                        setTimeout(function() {
                            for (e.log("draining " + e._messageQueue.length + " queued messages"); e._messageQueueEnabled && (t = e._messageQueue.shift());) e.dispatchEvent(t)
                        }), this._messageQueueEnabled = !0, this.log("started")
                    },
                    close: function() {
                        this._messageQueueEnabled = !1, this._entangledPortUuid && (this._getEntangledPort()._entangledPortUuid = null, this._entangledPortUuid = null)
                    },
                    postMessage: function(t) {
                        var e, n = this._getEntangledPort(),
                            r = this._currentTarget;
                        return n ? void(r ? (e = h.encodeEvent(t, [n], !0), u(r) ? (this.log("posting message from window to window", t, this.destinationUrl), r.postMessage(e, this.destinationUrl)) : (this.log("posting message from or to worker", t), r.postMessage(e))) : (this.log("not connected, queueing message", t), n._enqueueEvent(h._messageEvent(t, [n], !0)))) : void this.log("not entangled, discarding message", t)
                    },
                    addEventListener: function(t, e) {
                        "undefined" == typeof this._listeners[t] && (this._listeners[t] = []), this._listeners[t].push(e)
                    },
                    removeEventListener: function(t, e) {
                        if (this._listeners[t] instanceof Array)
                            for (var n = this._listeners[t], r = 0; r < n.length; r++)
                                if (n[r] === e) {
                                    n.splice(r, 1);
                                    break
                                }
                    },
                    dispatchEvent: function(t) {
                        var e = this._listeners.message;
                        if (e)
                            for (var n = 0; n < e.length; n++) e[n].call(this, t)
                    },
                    _enqueueEvent: function(t) {
                        this._messageQueueEnabled ? this.dispatchEvent(t) : this._messageQueue.push(t)
                    },
                    _getPort: function(t, e, n) {
                        var r = function(t) {
                                var e = f[t] || h._createPort(t);
                                return e
                            },
                            o = r(t.uuid);
                        if (o._entangledPortUuid = t._entangledPortUuid, o._getEntangledPort()._entangledPortUuid = o.uuid, o._currentTarget = e.source || e.currentTarget || i, "null" === e.origin ? o.destinationUrl = "*" : o.destinationUrl = e.origin, n)
                            for (var a = 0; a < t._messageQueue.length; a++) o._messageQueue.push(t._messageQueue[a]);
                        return o
                    },
                    _getEntangledPort: function() {
                        return this._entangledPortUuid ? f[this._entangledPortUuid] || h._createPort(this._entangledPortUuid) : null
                    },
                    log: function() {
                        if (h.verbose) {
                            var t = s.apply(arguments);
                            t.unshift("Port", this.uuid), c.apply(null, t)
                        }
                    }
                };
                var h = i.MessageChannel = function() {
                    var t, e = h._createPort(),
                        n = h._createPort();
                    return e._entangledPortUuid = n.uuid, n._entangledPortUuid = e.uuid, t = {
                        port1: e,
                        port2: n
                    }, h.log(t, "created"), t
                };
                h._shim = !0, h.log = function(t) {
                    if (h.verbose) {
                        var e = ["Chnl"],
                            n = s.call(arguments, 1);
                        t.port1 && t.port2 ? e.push(t.port1.uuid, t.port2.uuid) : t.forEach(function(t) {
                            e.push(t._entangledPortUuid)
                        }), e.push.apply(e, n), c.apply(null, e)
                    }
                }, h._createPort = function() {
                    var t = arguments,
                        e = function() {
                            return l.apply(this, t)
                        };
                    return e.prototype = l.prototype, new e
                }, h.encodeEvent = function(t, e, n) {
                    for (var r, i = new Array(e.length), o = 0; o < e.length; ++o) i[o] = h._strippedPort(e[o]);
                    return r = {
                        event: h._messageEvent(t, i, n)
                    }
                }, h._messageEvent = function(t, e, n) {
                    return {
                        data: t,
                        ports: e,
                        messageChannel: n
                    }
                }, h._strippedPort = function(t) {
                    if (t) {
                        for (var e, n, r, i = [], o = 0; o < t._messageQueue.length; ++o) {
                            e = t._messageQueue[o], n = e.ports || [], r = [];
                            for (var a, s = 0; s < n.length; ++s) a = n[s], r.push({
                                uuid: a.uuid,
                                _entangledPortUuid: a._entangledPortUuid
                            });
                            i.push({
                                data: e.data,
                                messageChannel: e.messageChannel,
                                ports: r
                            })
                        }
                        return {
                            uuid: t.uuid,
                            _entangledPortUuid: t._entangledPortUuid,
                            _messageQueue: i
                        }
                    }
                }, h.decodeEvent = function(t, e) {
                    var n, r, i, o = {
                        data: null,
                        ports: []
                    };
                    if (n = t.data, r = n && n.event, !r) return t;
                    if (i = r.ports)
                        for (var a = 0; a < i.length; a++) o.ports.push(l.prototype._getPort(i[a], t, e));
                    return o.data = r.data, o.source = t.source, o.messageChannel = r.messageChannel, o
                };
                var d = function(t, e) {
                        var n;
                        try {
                            n = h.decodeEvent(t, e)
                        } catch (r) {
                            if (!(r instanceof SyntaxError)) throw r;
                            n = t
                        }
                        return n
                    },
                    p = function(t) {
                        var e = d(t, !0);
                        e.messageChannel && h.propagateEvent(e)
                    },
                    m = function(t) {
                        t.addEventListener ? t.addEventListener("message", p, !1) : t.attachEvent && t.attachEvent("onmessage", p)
                    },
                    g = function(t) {
                        var e, n, r, i, o;
                        t.addEventListener ? (n = "addEventListener", i = "removeEventListener", o = "message") : t.attachEvent && (n = "attachEvent", i = "detachEvent", o = "onmessage"), e = t[n], r = t[i], t[n] = function() {
                            var t, n = Array.prototype.slice.call(arguments),
                                r = n[1],
                                i = this;
                            n[0] === o && (t = function(t) {
                                var e = d(t);
                                e.messageChannel || r.call(i, e)
                            }, r.messageHandlerWrapper = t, n[1] = t), e.apply(this, n)
                        }, t[i] = function() {
                            var t = Array.prototype.slice.call(arguments),
                                e = t[1];
                            t[0] === o && (t[1] = e.messageHandlerWrapper, delete e.messageHandlerWrapper), t[1] && r.apply(this, t)
                        }
                    };
                if (h.propagateEvent = function(t) {
                        var e, n, r;
                        if (t.messageChannel) {
                            e = t.ports;
                            for (var i = 0; i < e.length; i++) n = e[i], r = n._getEntangledPort(), n._currentTarget && r._currentTarget ? r.postMessage(t.data) : n._enqueueEvent(t)
                        }
                    }, h.reset = function() {
                        f = {}
                    }, m(i), o) {
                    h.Window = o, o.postMessage = function(t, e, n, r) {
                        var i, o;
                        if (r = r || [], i = h.encodeEvent(e, r, !1), r)
                            for (var a = 0; a < r.length; a++) o = r[a]._getEntangledPort(), o._currentTarget || (o._currentTarget = t, o.destinationUrl = n);
                        h.log(r, "handshake window", t), t.postMessage(i, n)
                    };
                    var v;
                    if (window.addEventListener) v = window;
                    else {
                        if (!window.attachEvent) throw "We couldn't find a method to attach an event handler.";
                        v = o.prototype
                    }
                    g(v)
                } else g(i);
                if (i.Worker) {
                    var E, y = Worker;
                    y.prototype.addEventListener ? E = y.prototype.addEventListener : y.prototype.attachEvent && (E = y.prototype.attachEvent), i.Worker = function() {
                        var t = new y(arguments[0]),
                            e = E;
                        return e.call(t, "message", p), t
                    }, Worker.prototype = y.prototype, g(Worker.prototype)
                } else n() && (i.Worker = {});
                i.Worker && (i.Worker.postMessage = function(t, e, n) {
                    for (var r, i = h.encodeEvent(e, n, !1), o = 0; o < n.length; o++) r = n[o]._getEntangledPort(), r._currentTarget = t;
                    h.log(n, "handshake worker", t), t.postMessage(i)
                })
            } else o ? o.postMessage = function(t, e, n, r) {
                r = r || [], t.postMessage(e, n, r)
            } : i.Worker = {
                postMessage: function(t, e, n) {
                    t.postMessage(e, n)
                }
            }, i.Worker && (i.Worker.postMessage = function(t, e, n) {
                t.postMessage(e, n)
            });
            return h
        }), n("bramble/client/main", ["thirdparty/filer/dist/filer.min", "bramble/ChannelUtils", "bramble/thirdparty/EventEmitter/EventEmitter.min", "bramble/client/StateManager", "bramble/thirdparty/MessageChannel/message_channel"], function(t, e, n, r) {
            "use strict";

            function i(t) {
                d("parseEventData", t);
                try {
                    return t = JSON.parse(t), t || {}
                } catch (e) {
                    return d("parseEventData error", e), {}
                }
            }

            function o(t, e) {
                var n = m;
                m = t, d("setReadyState", n, t), p.trigger("readyStateChange", [n, t]), m === p.READY ? p.trigger("ready", [s]) : m === p.ERROR && (e && "EFILESYSTEMERROR" === e.code ? s._autoRecoverFileSystem ? p.formatFileSystem(function(t) {
                    t ? console.error("[Bramble] unable to access browser filesystem:", t) : console.log("[Bramble] browser filesystem auto-recovered, refresh page."), p.trigger("error", [e])
                }) : (console.error("[Bramble] browser filesystem inaccessible (needs to be re-formatted, or permission denied due to private browsing mode."), p.trigger("error", [e])) : p.trigger("error", [e]))
            }

            function a(t, n) {
                function a(t) {
                    addEventListener("resize", function(t) {
                        w._executeRemoteCommand({
                            commandCategory: "bramble",
                            command: "RESIZE"
                        })
                    }), addEventListener("message", function(e) {
                        var r = i(e.data);
                        if ("bramble:readyToMount" === r.type) d("bramble:readyToMount"), o(p.MOUNTABLE), "function" == typeof w._mount && (w._mount(), delete w._mount);
                        else if ("bramble:filer" === r.type) d("bramble:filer"), E(t);
                        else if ("bramble:loaded" === r.type) d("bramble:loaded"), n.hideUntilReady && (_.style.visibility = "visible"), j.fullPath = r.fullPath, j.filename = r.filename, j.fontSize = r.fontSize, j.sidebarVisible = r.sidebarVisible, j.sidebarWidth = r.sidebarWidth, j.firstPaneWidth = r.firstPaneWidth, j.secondPaneWidth = r.secondPaneWidth, j.previewMode = r.previewMode, j.theme = r.theme, j.wordWrap = r.wordWrap, o(p.READY);
                        else if ("bramble:remoteCommand:callback" === r.type) d("bramble:remoteCommand:callback"), D[r.callback](), delete D[r.callback];
                        else {
                            var a = r.type.replace(/^bramble:/, "");
                            delete r.type, "layout" === a ? (j.sidebarWidth = r.sidebarWidth, j.firstPaneWidth = r.firstPaneWidth, j.secondPaneWidth = r.secondPaneWidth) : "activeEditorChange" === a ? (j.fullPath = r.fullPath, j.filename = r.filename) : "previewModeChange" === a ? j.previewMode = r.mode : "themeChange" === a ? j.theme = r.theme : "fontSizeChange" === a ? j.fontSize = r.fontSize : "sidebarChange" === a ? j.sidebarVisible = r.visible : "wordWrapChange" === a ? j.wordWrap = r.wordWrap : "tutorialVisibilityChange" === a && (R = r.visible), d("triggering remote event", a, r), w.trigger(a, [r])
                        }
                    })
                }

                function v() {
                    "string" == typeof t && (t = document.querySelector(t)), t || (t = document.body), t.innerHTML = "<iframe id='" + x + "' frameborder='0' width='100%' height='100%'></iframe>", _ = document.getElementById(x), n.hideUntilReady && (_.style.visibility = "hidden"), A = _.contentWindow, a(A);
                    var e = "";
                    if (n.extensions) {
                        var r = n.extensions.enable;
                        r && r.length && (e += "?enableExtensions=" + r.join(","));
                        var i = n.extensions.disable;
                        i && i.length && (e += e.length ? "&" : "?", e += "disableExtensions=" + i.join(","))
                    } else n.useLocationSearch && (e = window.location.search);
                    n.locale && (e += e.length ? "&" : "?", e += n.locale), o(p.LOADING);
                    var s = (n.url ? n.url : u) + e;
                    d("setting iframe src", s), _.src = s
                }

                function E(t) {
                    var n = new MessageChannel;
                    e.postMessage(t, [JSON.stringify({
                        type: "bramble:filer"
                    }), "*", [n.port2]]), I = n.port1, I.start(), e.checkArrayBufferTransfer(I, function(t, e) {
                        d("checkArrayBufferTransfer", e), S = e, I.addEventListener("message", b, !1)
                    })
                }

                function y(t) {
                    return L[t] ? L[t] : function(e, n) {
                        var r;
                        return e && "EFILESYSTEMERROR" === e.code ? void o(p.ERROR, e) : (f.isBuffer(n) && (n = n.buffer, S && (r = [n])), void I.postMessage({
                            callback: t,
                            result: [e, n]
                        }, r))
                    }
                }

                function b(t) {
                    function e(t, e, n) {
                        return function(r) {
                            r || w.trigger(t, [e]), n(r)
                        }
                    }

                    function n(t, e, n, r) {
                        return function(i) {
                            i || w.trigger(t, [e, n]), r(i)
                        }
                    }

                    function r(t, e, n, r, i) {
                        return function(o) {
                            o || w.trigger(t, [{
                                oldPath: e,
                                newPath: n,
                                children: r
                            }]), i(o)
                        }
                    }

                    function i(t, n) {
                        function r(t, n) {
                            return t.endsWith("/") ? n() : void g.unlink(t, e("fileDelete", t, n))
                        }
                        I.find(t, {
                            exec: r
                        }, function(e) {
                            return e ? n(e) : void I.rm(t, {
                                recursive: !0
                            }, n)
                        })
                    }

                    function o(t, n, r) {
                        var i = l.join(n, l.basename(t));
                        g.readFile(t, function(t, o) {
                            return t ? r(t) : void I.mkdirp(n, function(t) {
                                return t ? r(t) : void g.writeFile(i, o, e("fileChange", i, r))
                            })
                        })
                    }

                    function a(t, e, n) {
                        var r = l.join(e, l.basename(t));
                        I.mkdirp(r, n)
                    }

                    function s(t, e) {
                        var n = l.join(p, l.basename(d), l.dirname(l.relative(d, t)));
                        return t.endsWith("/") ? void g.readdir(t, function(r, i) {
                            return r ? e(r) : i.length > 0 ? e() : (t.replace(/\/?$/, "") === d.replace(/\/?$/, "") && (n = l.dirname(n)), void a(t, n, e))
                        }) : o(t, n, e)
                    }

                    function u(t, e) {
                        function n(e, n) {
                            e.endsWith("/") || r.push(l.relative(t, e)), n()
                        }
                        var r = [];
                        I.find(t, {
                            exec: n
                        }, function(t) {
                            t ? e(t) : e(null, r)
                        })
                    }
                    var c, h, d, p, m, v = t.data,
                        E = v.method,
                        b = v.callback,
                        _ = y(b),
                        R = v.args,
                        I = new g.Shell;
                    switch (E) {
                        case "writeFile":
                            R[1] = new f(R[1]), h = R[0], c = e("fileChange", h, _), g.writeFile.apply(g, R.concat(function(t) {
                                t || h !== w.tutorialPath || (c = e("tutorialAdded", h, c), O = !0), c(t)
                            }));
                            break;
                        case "rename":
							var name= R[0].substr(R[0].lastIndexOf("/")+1,R[0].length);
							g.stat(R[0], function(t, i) {
                                t ? _(t) : i.isDirectory() ? u(R[0], function(t, e) {
                                    t ? _(t) : g.rename.apply(g, R.concat(r("folderRename", R[0], R[1], e, _)))
                                }) : (c = n("fileRename", R[0], R[1], _), g.rename.apply(g, R.concat(function(t) {
                                    t || (R[0] === w.tutorialPath ? (c = e("tutorialRemoved", R[0], c), O = !1) : R[1] === w.tutorialPath && (c = e("tutorialAdded", R[1], c), O = !0)), c(t)
                                })))
                            });
							//reload webpage if tutorial is modified to remove tutorial button.
							if(name == "tutorial.html"){
								window.location.reload();
							}
                            break;
                        case "unlink":
                            h = R[0], c = e("fileDelete", R[0], _), g.unlink.apply(g, R.concat(function(t) {
                                t || h !== w.tutorialPath || (c = e("tutorialRemoved", h, c), O = !1), c(t)
                            }));
                            break;
                        case "readFile":
                            g.readFile.apply(g, R.concat(function(t, e) {
                                _(t, e ? e.buffer : null)
                            }));
                            break;
                        case "watch":
                            L[b] = _, g.watch.apply(g, v.args.concat(_));
                            break;
                        case "mv":
                            d = R[0], p = R[1], g.stat(d, function(t, e) {
                                return t ? _(t) : e.isFile() ? o(d, p, _) : void I.find(d, {
                                    exec: s
                                }, _)
                            });
                            break;
                        case "rm":
						    var name= R[0].substr(R[0].lastIndexOf("/")+1,R[0].length);
                            h = R[0], m = R[1], g.readdir(h, function(t, n) {
                                return t ? "ENOTDIR" === t.code ? I.rm(h, e("fileDelete", h, _)) : _(t) : !n || n.length < 1 || !m.recursive ? I.rm(h, _) : void i(h, _)
                            });
							//reload webpage if tutorial is modified to remove tutorial button.
							if(name == "tutorial.html"){
								window.location.reload();
							}
                            break;
                        default:
                            v.shell ? I[v.method].apply(I, R.concat(_)) : g[v.method].apply(g, R.concat(_))
                    }
                }
                var w = this;
                n = n || {};
                var _, O, R, I, A, S, T, x = "bramble-" + h.generate(),
                    L = {},
                    j = new r(n.disableUIState),
                    D = {};
                w._autoRecoverFileSystem = n.autoRecoverFileSystem, w.getID = function() {
                    return x
                }, w.getIFrame = function() {
                    return _
                }, w.getFullPath = function() {
                    return j.fullPath
                }, w.getFilename = function() {
                    return j.filename
                }, w.getPreviewMode = function() {
                    return j.previewMode
                }, w.getTheme = function() {
                    return j.theme
                }, w.getFontSize = function() {
                    return j.fontSize
                }, w.getSidebarVisible = function() {
                    return j.sidebarVisible
                }, w.getRootDir = function() {
                    return T
                }, w.getWordWrap = function() {
                    return j.wordWrap
                }, w.getTutorialExists = function() {
                    return O
                }, w.getTutorialVisible = function() {
                    return R
                }, w.getLayout = function() {
                    return {
                        sidebarWidth: j.sidebarWidth,
                        firstPaneWidth: j.firstPaneWidth,
                        secondPaneWidth: j.secondPaneWidth
                    }
                }, "object" != typeof t || t instanceof HTMLElement || (n = t, t = null), "loading" === document.readyState ? document.addEventListener("DOMContentLoaded", function C() {
                    document.removeEventListener("DOMContentLoaded", C, !1), v()
                }, !1) : v(), w.mount = function(t, e) {
                    function n() {
                        o(p.MOUNTING), t = l.normalize(t), e = l.resolve(t, e || j.fullPath || "index.html"), g.stat(t, function(n, r) {
                            return n ? (d("mount stat error", n), void("ENOENT" === n.code ? o(p.ERROR, new Error("mount path does not exist: " + t)) : o(p.ERROR, n))) : void(r.isDirectory() ? (T = t, w.tutorialPath = l.join(t, c), g.exists(w.tutorialPath, function(n) {
                                O = n;
                                var r = {
                                    type: "bramble:init",
                                    mount: {
                                        root: t,
                                        filename: e
                                    },
                                    state: {
                                        fontSize: j.fontSize,
                                        theme: j.theme,
                                        sidebarVisible: j.sidebarVisible,
                                        sidebarWidth: j.sidebarWidth,
                                        firstPaneWidth: j.firstPaneWidth,
                                        secondPaneWidth: j.secondPaneWidth,
                                        previewMode: j.previewMode,
                                        wordWrap: j.wordWrap
                                    }
                                };
                                A.postMessage(JSON.stringify(r), _.src)
                            })) : o(p.ERROR, new Error("mount path is not a directory: " + t)))
                        })
                    }
                    return m > p.MOUNTABLE ? void o(p.ERROR, new Error("Bramble.mount() while already mounted, or attempting to mount.")) : void(m < p.MOUNTABLE ? (d("mount pending, waiting on Bramble.MOUNTABLE"), s._mount = n) : n())
                }, w._executeRemoteCommand = function(t, e) {
                    return A ? (e = e || function() {}, t.callback = h.generate(), D[t.callback] = e, t.type = "bramble:remoteCommand", d("executeRemoteCommand", t), void A.postMessage(JSON.stringify(t), _.src)) : void console.error("[Bramble Error] No active instance, unable to execute command")
                }
            }
            var s, u = "https://mozillathimblelivepreview.net/bramble/dist/index.html",
                c = "tutorial.html",
                f = t.Buffer,
                l = t.Path,
                h = e.UUID,
                d = function() {},
                p = new n;
            p.ERROR = -1, p.NOT_LOADED = 0, p.LOADING = 1, p.MOUNTABLE = 2, p.MOUNTING = 3, p.READY = 4;
            var m = p.NOT_LOADED;
            p.getReadyState = function() {
                return m
            }, p.Filer = t;
            var g = new t.FileSystem;
            return p.getFileSystem = function() {
                return g
            }, p.formatFileSystem = function(e) {
                g = new t.FileSystem({
                    flags: ["FORMAT"]
                }, e)
            }, p.load = function(t, e) {
                return s ? void o(p.ERROR, new Error("Bramble.load() called more than once.")) : (e = e || {}, e.debug && (d = console.log.bind(console)), void(s = new a(t, e)))
            }, p.mount = function(t, e) {
                return e || d("no filename passed to Bramble.mount()"), s ? void s.mount(t, e) : void o(p.ERROR, new Error("Bramble.mount() called before Bramble.load()."))
            }, a.prototype = new n, a.prototype.constructor = a, a.prototype.undo = function(t) {
                this._executeRemoteCommand({
                    commandCategory: "brackets",
                    command: "EDIT_UNDO"
                }, t)
            }, a.prototype.redo = function(t) {
                this._executeRemoteCommand({
                    commandCategory: "brackets",
                    command: "EDIT_REDO"
                }, t)
            }, a.prototype.increaseFontSize = function(t) {
                this._executeRemoteCommand({
                    commandCategory: "brackets",
                    command: "VIEW_INCREASE_FONT_SIZE"
                }, t)
            }, a.prototype.decreaseFontSize = function(t) {
                this._executeRemoteCommand({
                    commandCategory: "brackets",
                    command: "VIEW_DECREASE_FONT_SIZE"
                }, t)
            }, a.prototype.restoreFontSize = function(t) {
                this._executeRemoteCommand({
                    commandCategory: "brackets",
                    command: "VIEW_RESTORE_FONT_SIZE"
                }, t)
            }, a.prototype.save = function(t) {
                this._executeRemoteCommand({
                    commandCategory: "brackets",
                    command: "FILE_SAVE"
                }, t)
            }, a.prototype.saveAll = function(t) {
                this._executeRemoteCommand({
                    commandCategory: "brackets",
                    command: "FILE_SAVE_ALL"
                }, t)
            }, a.prototype.useHorizontalSplitView = function(t) {
                this._executeRemoteCommand({
                    commandCategory: "brackets",
                    command: "CMD_SPLITVIEW_HORIZONTAL"
                }, t)
            }, a.prototype.useVerticalSplitView = function(t) {
                this._executeRemoteCommand({
                    commandCategory: "brackets",
                    command: "CMD_SPLITVIEW_VERTICAL"
                }, t)
            }, a.prototype.find = function(t) {
                this._executeRemoteCommand({
                    commandCategory: "brackets",
                    command: "CMD_FIND"
                }, t)
            }, a.prototype.findInFiles = function(t) {
                this._executeRemoteCommand({
                    commandCategory: "brackets",
                    command: "CMD_FIND_IN_FILES"
                }, t)
            }, a.prototype.replace = function(t) {
                this._executeRemoteCommand({
                    commandCategory: "brackets",
                    command: "CMD_REPLACE"
                }, t)
            }, a.prototype.replaceInFiles = function(t) {
                this._executeRemoteCommand({
                    commandCategory: "brackets",
                    command: "CMD_REPLACE_IN_FILES"
                }, t)
            }, a.prototype.useLightTheme = function(t) {
                this._executeRemoteCommand({
                    commandCategory: "bramble",
                    command: "BRAMBLE_LIGHT_THEME"
                }, t)
            }, a.prototype.useDarkTheme = function(t) {
                this._executeRemoteCommand({
                    commandCategory: "bramble",
                    command: "BRAMBLE_DARK_THEME"
                }, t)
            }, a.prototype.showSidebar = function(t) {
                this._executeRemoteCommand({
                    commandCategory: "bramble",
                    command: "BRAMBLE_SHOW_SIDEBAR"
                }, t)
            }, a.prototype.hideSidebar = function(t) {
                this._executeRemoteCommand({
                    commandCategory: "bramble",
                    command: "BRAMBLE_HIDE_SIDEBAR"
                }, t)
            }, a.prototype.showStatusbar = function(t) {
                this._executeRemoteCommand({
                    commandCategory: "bramble",
                    command: "BRAMBLE_SHOW_STATUSBAR"
                }, t)
            }, a.prototype.hideStatusbar = function(t) {
                this._executeRemoteCommand({
                    commandCategory: "bramble",
                    command: "BRAMBLE_HIDE_STATUSBAR"
                }, t)
            }, a.prototype.refreshPreview = function(t) {
                this._executeRemoteCommand({
                    commandCategory: "bramble",
                    command: "BRAMBLE_RELOAD"
                }, t)
            }, a.prototype.useMobilePreview = function(t) {
                this._executeRemoteCommand({
                    commandCategory: "bramble",
                    command: "BRAMBLE_MOBILE_PREVIEW"
                }, t)
            }, a.prototype.useDesktopPreview = function(t) {
                this._executeRemoteCommand({
                    commandCategory: "bramble",
                    command: "BRAMBLE_DESKTOP_PREVIEW"
                }, t)
            }, a.prototype.enableFullscreenPreview = function(t) {
                this._executeRemoteCommand({
                    commandCategory: "bramble",
                    command: "BRAMBLE_ENABLE_FULLSCREEN_PREVIEW"
                }, t)
            }, a.prototype.disableFullscreenPreview = function(t) {
                this._executeRemoteCommand({
                    commandCategory: "bramble",
                    command: "BRAMBLE_DISABLE_FULLSCREEN_PREVIEW"
                }, t)
            }, a.prototype.enableAutoUpdate = function(t) {
                this._executeRemoteCommand({
                    commandCategory: "bramble",
                    command: "BRAMBLE_ENABLE_AUTO_UPDATE"
                }, t)
            }, a.prototype.disableAutoUpdate = function(t) {
                this._executeRemoteCommand({
                    commandCategory: "bramble",
                    command: "BRAMBLE_DISABLE_AUTO_UPDATE"
                }, t)
            }, a.prototype.enableJavaScript = function(t) {
                this._executeRemoteCommand({
                    commandCategory: "bramble",
                    command: "BRAMBLE_ENABLE_SCRIPTS"
                }, t)
            }, a.prototype.disableJavaScript = function(t) {
                this._executeRemoteCommand({
                    commandCategory: "bramble",
                    command: "BRAMBLE_DISABLE_SCRIPTS"
                }, t)
            }, a.prototype.enableInspector = function(t) {
                this._executeRemoteCommand({
                    commandCategory: "bramble",
                    command: "BRAMBLE_ENABLE_INSPECTOR"
                }, t)
            }, a.prototype.disableInspector = function(t) {
                this._executeRemoteCommand({
                    commandCategory: "bramble",
                    command: "BRAMBLE_DISABLE_INSPECTOR"
                }, t)
            }, a.prototype.enableWordWrap = function(t) {
                this._executeRemoteCommand({
                    commandCategory: "bramble",
                    command: "BRAMBLE_ENABLE_WORD_WRAP"
                }, t)
            }, a.prototype.disableWordWrap = function(t) {
                this._executeRemoteCommand({
                    commandCategory: "bramble",
                    command: "BRAMBLE_DISABLE_WORD_WRAP"
                }, t)
            }, a.prototype.showTutorial = function(t) {
                this._executeRemoteCommand({
                    commandCategory: "bramble",
                    command: "BRAMBLE_SHOW_TUTORIAL"
                }, t)
            }, a.prototype.hideTutorial = function(t) {
                this._executeRemoteCommand({
                    commandCategory: "bramble",
                    command: "BRAMBLE_HIDE_TUTORIAL"
                }, t)
            }, a.prototype.showUploadFilesDialog = function(t) {
                this._executeRemoteCommand({
                    commandCategory: "bramble",
                    command: "BRAMBLE_SHOW_UPLOAD_FILES_DIALOG"
                }, t)
            }, a.prototype.addNewFile = function(t, e) {
                return "string" != typeof t.contents ? void e(new Error("expected string for file contents")) : void this._executeRemoteCommand({
                    commandCategory: "bramble",
                    command: "BRAMBLE_ADD_NEW_FILE",
                    args: [t]
                }, e)
            }, a.prototype.addNewFolder = function(t) {
                this._executeRemoteCommand({
                    commandCategory: "brackets",
                    command: "FILE_FOLDER"
                }, t)
            }, a.prototype["export"] = function(t) {
                this._executeRemoteCommand({
                    commandCategory: "bramble",
                    command: "BRAMBLE_EXPORT"
                }, t)
            }, p
        }), e("bramble/client/main")
}); // This is just a sample script. Paste your real code (javascript or HTML) here.

if ('this_is' == /an_example/) {
    of_beautifier();
} else {
    var a = b ? (c % d) : e[f];
}
