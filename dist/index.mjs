import ue, { useContext as de, createContext as he, useState as y, useEffect as Z, useCallback as F } from "react";
import { AlertCircle as fe, EyeOff as me, Eye as ge } from "lucide-react";
import { useNavigate as pe, useLocation as G, Navigate as xe } from "react-router-dom";
const B = { BASE_URL: "/", DEV: !1, MODE: "production", PROD: !0, SSR: !1 };
class ve {
  constructor() {
    this.API_BASE_URL = this.getApiBaseUrl(), this.ACCESS_TOKEN_KEY = "accessToken", this.REFRESH_TOKEN_KEY = "refreshToken", this.USER_KEY = "user";
  }
  /**
   * Get API base URL based on environment
   */
  getApiBaseUrl() {
    try {
      if (typeof import.meta < "u" && B)
        return "https://sandbox.totum.surgery/api";
    } catch {
    }
    return "https://sandbox.totum.surgery/api";
  }
  /**
   * Check if we're in development mode
   */
  isDevelopment() {
    try {
      if (typeof import.meta < "u" && B)
        return !1;
    } catch {
    }
    return !1;
  }
  /**
   * Login user with email and password
   */
  async login(o, s) {
    try {
      console.log("AuthService: Making login request to:", `${this.API_BASE_URL}/Account/Login`), console.log("AuthService: Environment:", { isDev: this.isDevelopment(), apiUrl: this.API_BASE_URL }), console.log("AuthService: Request payload:", { login: o, password: "***" });
      const r = await fetch(`${this.API_BASE_URL}/Account/Login`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json"
        },
        // No credentials required
        body: JSON.stringify({
          login: o,
          password: s
        })
      });
      if (console.log("AuthService: Response status:", r.status), console.log("AuthService: Response headers:", Object.fromEntries(r.headers.entries())), !r.ok) {
        let d = `Login failed with status ${r.status}`;
        try {
          const g = await r.text();
          console.error("AuthService: Error response body:", g);
          try {
            const x = JSON.parse(g);
            d = x.message || x.error || g || d;
          } catch {
            d = g || d;
          }
        } catch (g) {
          console.error("AuthService: Could not read error response:", g);
        }
        throw new Error(d);
      }
      const i = await r.text();
      console.log("AuthService: Raw response text:", i);
      let n;
      try {
        n = JSON.parse(i);
      } catch (d) {
        throw console.error("AuthService: Failed to parse response as JSON:", d), new Error("Invalid response format from server");
      }
      if (console.log("AuthService: Parsed response data:", n), !n?.value?.accessToken)
        throw console.error("AuthService: No access token in response:", n), new Error("Invalid response: No access token received");
      const c = {
        id: n.value.userId,
        email: o,
        // Use the email from login since it's not in the response
        fullName: n.value.fullName,
        systemId: n.value.systemId,
        roleGroups: n.value.roleGroups
      };
      return this.setTokens(n.value.accessToken, n.value.refreshToken), this.setUser(c), console.log("AuthService: Login successful, tokens and user data stored"), n;
    } catch (r) {
      throw console.error("AuthService: Login error:", r), r;
    }
  }
  /**
   * Logout user and clear all stored data
   */
  logout() {
    console.log("AuthService: Logging out user"), localStorage.removeItem(this.ACCESS_TOKEN_KEY), localStorage.removeItem(this.REFRESH_TOKEN_KEY), localStorage.removeItem(this.USER_KEY);
  }
  /**
   * Check if user is authenticated
   */
  isAuthenticated() {
    const o = this.getAccessToken(), s = this.getUser(), r = !!o && !!s && !this.isTokenExpired(o);
    return console.log("AuthService: isAuthenticated check:", {
      hasToken: !!o,
      hasUser: !!s,
      isExpired: o ? this.isTokenExpired(o) : "no token",
      result: r
    }), r;
  }
  /**
   * Get access token from storage
   */
  getAccessToken() {
    return localStorage.getItem(this.ACCESS_TOKEN_KEY);
  }
  /**
   * Get refresh token from storage
   */
  getRefreshToken() {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }
  /**
   * Get user data from storage
   */
  getUser() {
    const o = localStorage.getItem(this.USER_KEY);
    if (!o) return null;
    try {
      return JSON.parse(o);
    } catch {
      return null;
    }
  }
  /**
   * Store tokens in localStorage
   */
  setTokens(o, s) {
    localStorage.setItem(this.ACCESS_TOKEN_KEY, o), localStorage.setItem(this.REFRESH_TOKEN_KEY, s), console.log("AuthService: Tokens stored in localStorage");
  }
  /**
   * Store user data in localStorage
   */
  setUser(o) {
    localStorage.setItem(this.USER_KEY, JSON.stringify(o)), console.log("AuthService: User data stored:", o);
  }
  /**
   * Check if token is expired (basic JWT check)
   */
  isTokenExpired(o) {
    try {
      const s = JSON.parse(atob(o.split(".")[1])), r = Date.now() / 1e3, i = s.exp < r;
      return console.log("AuthService: Token expiration check:", {
        expired: i,
        exp: s.exp,
        now: r,
        timeLeft: s.exp - r
      }), i;
    } catch (s) {
      return console.error("AuthService: Error checking token expiration:", s), !0;
    }
  }
  /**
   * Make authenticated API request
   */
  async authFetch(o, s = {}) {
    const r = this.getAccessToken();
    if (!r)
      throw new Error("No access token available");
    const i = {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...s.headers,
      Authorization: `Bearer ${r}`
    }, n = await fetch(o, {
      ...s,
      headers: i,
      credentials: "include"
    });
    if (n.status === 401)
      throw console.warn("AuthService: Token expired, clearing auth data"), this.logout(), new Error("Authentication expired");
    return n;
  }
  /**
   * Refresh access token using refresh token
   * Note: This would need to be implemented if the API supports token refresh
   */
  async refreshToken() {
    const o = this.getRefreshToken();
    if (!o)
      return !1;
    try {
      const s = await fetch(`${this.API_BASE_URL}/Account/RefreshToken`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json"
        },
        credentials: "include",
        body: JSON.stringify({ refreshToken: o })
      });
      if (!s.ok)
        return !1;
      const r = await s.json();
      return r?.value?.accessToken ? (this.setTokens(r.value.accessToken, r.value.refreshToken || o), !0) : !1;
    } catch (s) {
      return console.error("AuthService: Token refresh failed:", s), !1;
    }
  }
}
const A = new ve();
var k = { exports: {} }, N = {};
/**
 * @license React
 * react-jsx-runtime.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var W;
function be() {
  if (W) return N;
  W = 1;
  var l = Symbol.for("react.transitional.element"), o = Symbol.for("react.fragment");
  function s(r, i, n) {
    var c = null;
    if (n !== void 0 && (c = "" + n), i.key !== void 0 && (c = "" + i.key), "key" in i) {
      n = {};
      for (var d in i)
        d !== "key" && (n[d] = i[d]);
    } else n = i;
    return i = n.ref, {
      $$typeof: l,
      type: r,
      key: c,
      ref: i !== void 0 ? i : null,
      props: n
    };
  }
  return N.Fragment = o, N.jsx = s, N.jsxs = s, N;
}
var T = {};
/**
 * @license React
 * react-jsx-runtime.development.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var q;
function we() {
  return q || (q = 1, process.env.NODE_ENV !== "production" && (function() {
    function l(e) {
      if (e == null) return null;
      if (typeof e == "function")
        return e.$$typeof === ie ? null : e.displayName || e.name || null;
      if (typeof e == "string") return e;
      switch (e) {
        case _:
          return "Fragment";
        case R:
          return "Profiler";
        case v:
          return "StrictMode";
        case oe:
          return "Suspense";
        case se:
          return "SuspenseList";
        case ne:
          return "Activity";
      }
      if (typeof e == "object")
        switch (typeof e.tag == "number" && console.error(
          "Received an unexpected object in getComponentNameFromType(). This is likely a bug in React. Please file an issue."
        ), e.$$typeof) {
          case O:
            return "Portal";
          case te:
            return (e.displayName || "Context") + ".Provider";
          case ee:
            return (e._context.displayName || "Context") + ".Consumer";
          case re:
            var a = e.render;
            return e = e.displayName, e || (e = a.displayName || a.name || "", e = e !== "" ? "ForwardRef(" + e + ")" : "ForwardRef"), e;
          case ae:
            return a = e.displayName || null, a !== null ? a : l(e.type) || "Memo";
          case Y:
            a = e._payload, e = e._init;
            try {
              return l(e(a));
            } catch {
            }
        }
      return null;
    }
    function o(e) {
      return "" + e;
    }
    function s(e) {
      try {
        o(e);
        var a = !1;
      } catch {
        a = !0;
      }
      if (a) {
        a = console;
        var u = a.error, h = typeof Symbol == "function" && Symbol.toStringTag && e[Symbol.toStringTag] || e.constructor.name || "Object";
        return u.call(
          a,
          "The provided key is an unsupported type %s. This value must be coerced to a string before using it here.",
          h
        ), o(e);
      }
    }
    function r(e) {
      if (e === _) return "<>";
      if (typeof e == "object" && e !== null && e.$$typeof === Y)
        return "<...>";
      try {
        var a = l(e);
        return a ? "<" + a + ">" : "<...>";
      } catch {
        return "<...>";
      }
    }
    function i() {
      var e = C.A;
      return e === null ? null : e.getOwner();
    }
    function n() {
      return Error("react-stack-top-frame");
    }
    function c(e) {
      if ($.call(e, "key")) {
        var a = Object.getOwnPropertyDescriptor(e, "key").get;
        if (a && a.isReactWarning) return !1;
      }
      return e.key !== void 0;
    }
    function d(e, a) {
      function u() {
        M || (M = !0, console.error(
          "%s: `key` is not a prop. Trying to access it will result in `undefined` being returned. If you need to access the same value within the child component, you should pass it as a different prop. (https://react.dev/link/special-props)",
          a
        ));
      }
      u.isReactWarning = !0, Object.defineProperty(e, "key", {
        get: u,
        configurable: !0
      });
    }
    function g() {
      var e = l(this.type);
      return z[e] || (z[e] = !0, console.error(
        "Accessing element.ref was removed in React 19. ref is now a regular prop. It will be removed from the JSX Element type in a future release."
      )), e = this.props.ref, e !== void 0 ? e : null;
    }
    function x(e, a, u, h, E, w, I, U) {
      return u = w.ref, e = {
        $$typeof: j,
        type: e,
        key: a,
        props: w,
        _owner: E
      }, (u !== void 0 ? u : null) !== null ? Object.defineProperty(e, "ref", {
        enumerable: !1,
        get: g
      }) : Object.defineProperty(e, "ref", { enumerable: !1, value: null }), e._store = {}, Object.defineProperty(e._store, "validated", {
        configurable: !1,
        enumerable: !1,
        writable: !0,
        value: 0
      }), Object.defineProperty(e, "_debugInfo", {
        configurable: !1,
        enumerable: !1,
        writable: !0,
        value: null
      }), Object.defineProperty(e, "_debugStack", {
        configurable: !1,
        enumerable: !1,
        writable: !0,
        value: I
      }), Object.defineProperty(e, "_debugTask", {
        configurable: !1,
        enumerable: !1,
        writable: !0,
        value: U
      }), Object.freeze && (Object.freeze(e.props), Object.freeze(e)), e;
    }
    function b(e, a, u, h, E, w, I, U) {
      var f = a.children;
      if (f !== void 0)
        if (h)
          if (le(f)) {
            for (h = 0; h < f.length; h++)
              p(f[h]);
            Object.freeze && Object.freeze(f);
          } else
            console.error(
              "React.jsx: Static children should always be an array. You are likely explicitly calling React.jsxs or React.jsxDEV. Use the Babel transform instead."
            );
        else p(f);
      if ($.call(a, "key")) {
        f = l(e);
        var S = Object.keys(a).filter(function(ce) {
          return ce !== "key";
        });
        h = 0 < S.length ? "{key: someKey, " + S.join(": ..., ") + ": ...}" : "{key: someKey}", J[f + h] || (S = 0 < S.length ? "{" + S.join(": ..., ") + ": ...}" : "{}", console.error(
          `A props object containing a "key" prop is being spread into JSX:
  let props = %s;
  <%s {...props} />
React keys must be passed directly to JSX without using spread:
  let props = %s;
  <%s key={someKey} {...props} />`,
          h,
          f,
          S,
          f
        ), J[f + h] = !0);
      }
      if (f = null, u !== void 0 && (s(u), f = "" + u), c(a) && (s(a.key), f = "" + a.key), "key" in a) {
        u = {};
        for (var D in a)
          D !== "key" && (u[D] = a[D]);
      } else u = a;
      return f && d(
        u,
        typeof e == "function" ? e.displayName || e.name || "Unknown" : e
      ), x(
        e,
        f,
        w,
        E,
        i(),
        u,
        I,
        U
      );
    }
    function p(e) {
      typeof e == "object" && e !== null && e.$$typeof === j && e._store && (e._store.validated = 1);
    }
    var m = ue, j = Symbol.for("react.transitional.element"), O = Symbol.for("react.portal"), _ = Symbol.for("react.fragment"), v = Symbol.for("react.strict_mode"), R = Symbol.for("react.profiler"), ee = Symbol.for("react.consumer"), te = Symbol.for("react.context"), re = Symbol.for("react.forward_ref"), oe = Symbol.for("react.suspense"), se = Symbol.for("react.suspense_list"), ae = Symbol.for("react.memo"), Y = Symbol.for("react.lazy"), ne = Symbol.for("react.activity"), ie = Symbol.for("react.client.reference"), C = m.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE, $ = Object.prototype.hasOwnProperty, le = Array.isArray, L = console.createTask ? console.createTask : function() {
      return null;
    };
    m = {
      react_stack_bottom_frame: function(e) {
        return e();
      }
    };
    var M, z = {}, V = m.react_stack_bottom_frame.bind(
      m,
      n
    )(), K = L(r(n)), J = {};
    T.Fragment = _, T.jsx = function(e, a, u, h, E) {
      var w = 1e4 > C.recentlyCreatedOwnerStacks++;
      return b(
        e,
        a,
        u,
        !1,
        h,
        E,
        w ? Error("react-stack-top-frame") : V,
        w ? L(r(e)) : K
      );
    }, T.jsxs = function(e, a, u, h, E) {
      var w = 1e4 > C.recentlyCreatedOwnerStacks++;
      return b(
        e,
        a,
        u,
        !0,
        h,
        E,
        w ? Error("react-stack-top-frame") : V,
        w ? L(r(e)) : K
      );
    };
  })()), T;
}
var H;
function Ee() {
  return H || (H = 1, process.env.NODE_ENV === "production" ? k.exports = be() : k.exports = we()), k.exports;
}
var t = Ee();
const X = he(void 0), Ae = ({ children: l }) => {
  const [o, s] = y(null), [r, i] = y(!0), [n, c] = y(!1);
  Z(() => {
    (() => {
      console.log("AuthContext: Initializing authentication...");
      try {
        if (A.isAuthenticated()) {
          const p = A.getUser();
          console.log("AuthContext: Found existing authentication:", p), s(p), c(!0);
        } else
          console.log("AuthContext: No existing authentication found"), s(null), c(!1);
      } catch (p) {
        console.error("AuthContext: Auth initialization error:", p), A.logout(), s(null), c(!1);
      } finally {
        i(!1), console.log("AuthContext: Initialization complete");
      }
    })();
  }, []);
  const d = async (b, p) => {
    try {
      console.log("AuthContext: Starting login process..."), i(!0), await A.login(b, p), console.log("AuthContext: Login successful, updating state...");
      const m = A.getUser();
      console.log("AuthContext: Retrieved user data:", m), s(m), c(!0), console.log("AuthContext: Login process complete, user state updated");
    } catch (m) {
      throw console.error("AuthContext: Login failed:", m), s(null), c(!1), m;
    } finally {
      i(!1);
    }
  }, g = () => {
    console.log("AuthContext: Logging out user..."), s(null), c(!1), A.logout(), window.location.href = "/login";
  };
  console.log("AuthContext: Current state:", {
    user: o?.email,
    fullName: o?.fullName,
    isAuthenticated: n,
    isLoading: r
  });
  const x = {
    user: o,
    isAuthenticated: n,
    isLoading: r,
    login: d,
    logout: g
  };
  return /* @__PURE__ */ t.jsx(X.Provider, { value: x, children: l });
}, P = () => {
  const l = de(X);
  if (l === void 0)
    throw new Error("useAuth must be used within an AuthProvider");
  return l;
}, ye = () => {
  const [l, o] = y({
    email: "",
    password: ""
  }), [s, r] = y(!1), [i, n] = y(null), [c, d] = y(!1), { login: g, isAuthenticated: x, isLoading: b } = P(), p = pe(), m = G();
  Z(() => {
    if (console.log("LoginPage: Auth state changed:", { isAuthenticated: x, isLoading: b }), x && !b) {
      const v = m.state?.from?.pathname || "/dashboard";
      console.log("LoginPage: User authenticated, redirecting to:", v), p(v, { replace: !0 });
    }
  }, [x, b, p, m.state]);
  const j = (v) => {
    o({
      ...l,
      [v.target.name]: v.target.value
    }), i && n(null);
  }, O = async (v) => {
    v.preventDefault(), n(null), d(!0);
    try {
      console.log("LoginPage: Submitting login form..."), await g(l.email, l.password), console.log("LoginPage: Login successful");
    } catch (R) {
      console.error("LoginPage: Login error:", R), R instanceof Error ? n(R.message) : n("Login failed. Please check your credentials and try again.");
    } finally {
      d(!1);
    }
  };
  if (b)
    return /* @__PURE__ */ t.jsx("div", { className: "min-h-screen flex items-center justify-center bg-gray-50", children: /* @__PURE__ */ t.jsxs("div", { className: "text-center", children: [
      /* @__PURE__ */ t.jsx("div", { className: "w-8 h-8 border-4 border-[#00bbff] border-t-transparent rounded-full animate-spin mx-auto mb-4" }),
      /* @__PURE__ */ t.jsx("p", { className: "text-gray-600", children: "Loading..." })
    ] }) });
  if (x)
    return /* @__PURE__ */ t.jsx("div", { className: "min-h-screen flex items-center justify-center bg-gray-50", children: /* @__PURE__ */ t.jsxs("div", { className: "text-center", children: [
      /* @__PURE__ */ t.jsx("div", { className: "w-8 h-8 border-4 border-[#00bbff] border-t-transparent rounded-full animate-spin mx-auto mb-4" }),
      /* @__PURE__ */ t.jsx("p", { className: "text-gray-600", children: "Redirecting to dashboard..." })
    ] }) });
  const _ = () => /* @__PURE__ */ t.jsxs(
    "svg",
    {
      xmlns: "http://www.w3.org/2000/svg",
      fill: "currentColor",
      viewBox: "0 0 100 17",
      className: "h-8 w-auto text-white",
      children: [
        /* @__PURE__ */ t.jsxs("g", { clipPath: "url(#a)", children: [
          /* @__PURE__ */ t.jsx("path", { d: "M75.294.309v9.218c0 4.576-2.89 7.472-7.302 7.472-4.433 0-7.281-2.896-7.281-7.472V.31h4.09v8.975c0 2.188.942 3.647 3.19 3.647 2.25 0 3.234-1.436 3.234-3.647V.309h4.07ZM99 .309v16.38h-4.09V9.064l-3.234 7.604h-2.698l-3.255-7.604v7.627h-4.069V.31h4.112l4.54 10.301L94.867.31H99ZM27.454 0c-4.54 0-8.416 3.78-8.416 8.511 0 4.73 3.876 8.511 8.416 8.511 4.561 0 8.416-3.758 8.416-8.51 0-4.754-3.855-8.512-8.416-8.512Zm0 12.932c-2.377 0-4.283-1.967-4.283-4.421s1.906-4.421 4.283-4.421c2.398 0 4.283 1.945 4.283 4.421s-1.885 4.421-4.283 4.421Z" }),
          /* @__PURE__ */ t.jsx("path", { d: "M27.454 0c-4.54 0-8.416 3.78-8.416 8.511 0 4.73 3.876 8.511 8.416 8.511 4.561 0 8.416-3.758 8.416-8.51 0-4.754-3.855-8.512-8.416-8.512Zm0 12.932c-2.377 0-4.283-1.967-4.283-4.421s1.906-4.421 4.283-4.421c2.398 0 4.283 1.945 4.283 4.421s-1.885 4.421-4.283 4.421ZM40.86.309a19.959 19.959 0 0 1 1.092 4.111h3.876v12.27h4.09V4.42h4.925V.31H40.86ZM0 .309A19.96 19.96 0 0 1 1.092 4.42h3.876v12.27h4.09V4.42h4.926V.31H0Z" })
        ] }),
        /* @__PURE__ */ t.jsx("defs", { children: /* @__PURE__ */ t.jsx("clipPath", { id: "a", children: /* @__PURE__ */ t.jsx("path", { d: "M0 0h99v17H0z" }) }) })
      ]
    }
  );
  return /* @__PURE__ */ t.jsxs("div", { className: "min-h-screen flex", children: [
    /* @__PURE__ */ t.jsxs("div", { className: "flex-1 relative bg-black overflow-hidden", children: [
      /* @__PURE__ */ t.jsxs(
        "video",
        {
          autoPlay: !0,
          muted: !0,
          loop: !0,
          playsInline: !0,
          preload: "auto",
          className: "absolute inset-0 w-full h-full object-cover",
          onError: (v) => {
            console.error("Video failed to load:", v);
          },
          onLoadStart: () => {
            console.log("Video started loading");
          },
          onCanPlay: () => {
            console.log("Video can play");
          },
          children: [
            /* @__PURE__ */ t.jsx("source", { src: "https://inovus-public-assets.s3.eu-west-2.amazonaws.com/web/TotumVideo.mp4", type: "video/mp4" }),
            "Your browser does not support the video tag."
          ]
        }
      ),
      /* @__PURE__ */ t.jsx("div", { className: "absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-800 -z-10" }),
      /* @__PURE__ */ t.jsxs("div", { className: "relative z-10 flex flex-col justify-center items-center h-full px-8 text-center", children: [
        /* @__PURE__ */ t.jsxs("div", { className: "mb-16", children: [
          /* @__PURE__ */ t.jsx("div", { className: "mb-8", children: /* @__PURE__ */ t.jsx(_, {}) }),
          /* @__PURE__ */ t.jsxs("p", { className: "text-3xl text-white font-light", style: { textShadow: "2px 2px 4px rgba(0,0,0,0.8)" }, children: [
            "Surgical training ",
            /* @__PURE__ */ t.jsx("span", { className: "text-[#00bbff] font-medium", children: "remastered" }),
            "."
          ] })
        ] }),
        /* @__PURE__ */ t.jsxs("div", { className: "relative w-full max-w-md", children: [
          /* @__PURE__ */ t.jsx("div", { className: "relative z-30 mx-auto w-56 h-72 rounded-2xl overflow-hidden shadow-2xl", children: /* @__PURE__ */ t.jsx(
            "img",
            {
              src: "https://inovus-public-assets.s3.eu-west-2.amazonaws.com/web/LoginImageCenter.png",
              alt: "Medical professional center",
              className: "w-full h-full object-cover"
            }
          ) }),
          /* @__PURE__ */ t.jsx("div", { className: "absolute -left-12 bottom-6 z-20 w-44 h-56 rounded-2xl overflow-hidden shadow-xl transform -rotate-6 opacity-90", children: /* @__PURE__ */ t.jsx(
            "img",
            {
              src: "https://inovus-public-assets.s3.eu-west-2.amazonaws.com/web/LoginImageLeft.png",
              alt: "Surgical training",
              className: "w-full h-full object-cover"
            }
          ) }),
          /* @__PURE__ */ t.jsx("div", { className: "absolute -right-12 top-6 z-20 w-44 h-56 rounded-2xl overflow-hidden shadow-xl transform rotate-6 opacity-90", children: /* @__PURE__ */ t.jsx(
            "img",
            {
              src: "https://inovus-public-assets.s3.eu-west-2.amazonaws.com/web/LoginImageRight.png",
              alt: "Medical professional",
              className: "w-full h-full object-cover"
            }
          ) })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ t.jsx("div", { className: "w-full max-w-md bg-white flex flex-col justify-center px-8 py-12", children: /* @__PURE__ */ t.jsxs("div", { className: "w-full max-w-sm mx-auto", children: [
      /* @__PURE__ */ t.jsx("div", { className: "text-center mb-8", children: /* @__PURE__ */ t.jsx("h2", { className: "text-3xl font-bold text-gray-900 mb-2", children: "Welcome." }) }),
      i && /* @__PURE__ */ t.jsxs("div", { className: "mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3", children: [
        /* @__PURE__ */ t.jsx(fe, { className: "w-5 h-5 text-red-500 flex-shrink-0" }),
        /* @__PURE__ */ t.jsx("p", { className: "text-red-700 text-sm", children: i })
      ] }),
      /* @__PURE__ */ t.jsxs("form", { onSubmit: O, className: "space-y-6", children: [
        /* @__PURE__ */ t.jsx("div", { children: /* @__PURE__ */ t.jsx(
          "input",
          {
            type: "email",
            name: "email",
            value: l.email,
            onChange: j,
            placeholder: "Email",
            required: !0,
            disabled: c,
            className: "w-full px-4 py-4 bg-gray-50 border-0 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00bbff] focus:bg-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          }
        ) }),
        /* @__PURE__ */ t.jsxs("div", { className: "relative", children: [
          /* @__PURE__ */ t.jsx(
            "input",
            {
              type: s ? "text" : "password",
              name: "password",
              value: l.password,
              onChange: j,
              placeholder: "••••••••",
              required: !0,
              disabled: c,
              className: "w-full px-4 py-4 bg-gray-50 border-0 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00bbff] focus:bg-white transition-all duration-200 pr-12 disabled:opacity-50 disabled:cursor-not-allowed"
            }
          ),
          /* @__PURE__ */ t.jsx(
            "button",
            {
              type: "button",
              onClick: () => r(!s),
              disabled: c,
              className: "absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200 disabled:opacity-50",
              children: s ? /* @__PURE__ */ t.jsx(me, { className: "w-5 h-5" }) : /* @__PURE__ */ t.jsx(ge, { className: "w-5 h-5" })
            }
          )
        ] }),
        /* @__PURE__ */ t.jsx(
          "button",
          {
            type: "submit",
            disabled: c,
            className: "w-full bg-[#00bbff] text-white px-6 py-3 rounded-full font-medium hover:bg-[#0099cc] transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2",
            children: c ? /* @__PURE__ */ t.jsxs(t.Fragment, { children: [
              /* @__PURE__ */ t.jsx("div", { className: "w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" }),
              "Signing in..."
            ] }) : "Login"
          }
        )
      ] }),
      /* @__PURE__ */ t.jsx("div", { className: "text-center mt-6", children: /* @__PURE__ */ t.jsx("a", { href: "#", className: "text-gray-600 hover:text-[#00bbff] text-sm transition-colors duration-200", children: "Forgot your password?" }) })
    ] }) })
  ] });
}, Se = ({ children: l }) => {
  const { isAuthenticated: o, isLoading: s } = P(), r = G();
  return console.log("ProtectedRoute: isAuthenticated:", o, "isLoading:", s), s ? /* @__PURE__ */ t.jsx("div", { className: "min-h-screen flex items-center justify-center bg-gray-50", children: /* @__PURE__ */ t.jsxs("div", { className: "text-center", children: [
    /* @__PURE__ */ t.jsx("div", { className: "w-8 h-8 border-4 border-[#00bbff] border-t-transparent rounded-full animate-spin mx-auto mb-4" }),
    /* @__PURE__ */ t.jsx("p", { className: "text-gray-600", children: "Loading..." })
  ] }) }) : o ? (console.log("ProtectedRoute: User authenticated, rendering children"), /* @__PURE__ */ t.jsx(t.Fragment, { children: l })) : (console.log("ProtectedRoute: User not authenticated, redirecting to login"), /* @__PURE__ */ t.jsx(xe, { to: "/login", state: { from: r }, replace: !0 }));
}, je = { BASE_URL: "/", DEV: !1, MODE: "production", PROD: !0, SSR: !1 };
function _e() {
  try {
    if (typeof import.meta < "u" && je)
      return "https://sandbox.totum.surgery/api";
  } catch {
  }
  return "https://sandbox.totum.surgery/api";
}
const Q = (l = {}) => {
  const { logout: o } = P(), { baseUrl: s = _e() } = l;
  return { authenticatedFetch: F(async (i, n = {}) => {
    try {
      const c = i.startsWith("http") ? i : `${s}${i}`;
      return await A.authFetch(c, n);
    } catch (c) {
      throw c instanceof Error && c.message === "Authentication expired" && o(), c;
    }
  }, [s, o]) };
}, Re = () => {
  const { authenticatedFetch: l } = Q(), o = F(async () => {
    try {
      const r = await l("/User/Profile");
      if (!r.ok)
        throw new Error(`Failed to fetch profile: ${r.status}`);
      return await r.json();
    } catch (r) {
      throw console.error("Error fetching user profile:", r), r;
    }
  }, [l]), s = F(async () => {
    try {
      const r = await l("/Dashboard/Data");
      if (!r.ok)
        throw new Error(`Failed to fetch dashboard data: ${r.status}`);
      return await r.json();
    } catch (r) {
      throw console.error("Error fetching dashboard data:", r), r;
    }
  }, [l]);
  return {
    fetchUserProfile: o,
    fetchDashboardData: s
  };
}, Pe = {
  // Auth functionality
  AuthProvider: Ae,
  useAuth: P,
  authService: A,
  LoginPage: ye,
  ProtectedRoute: Se,
  useAuthenticatedFetch: Q,
  useApiData: Re
};
export {
  Ae as AuthProvider,
  ye as LoginPage,
  Se as ProtectedRoute,
  A as authService,
  Pe as default,
  Re as useApiData,
  P as useAuth,
  Q as useAuthenticatedFetch
};
