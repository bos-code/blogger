var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
/**
 * Serves the Vercel functions in /api during `vite dev`, so features that
 * use them (subscriptions, previews, RSS…) work locally. In emulator mode
 * the functions talk to the Firebase emulators, and without Gmail
 * credentials emails are logged instead of sent.
 */
export var apiDevServer = function (mode) { return ({
    name: "api-dev-server",
    apply: "serve",
    configureServer: function (server) {
        var _this = this;
        var _a, _b, _c, _d;
        var _e, _f, _g, _h;
        if (mode === "emulators") {
            (_a = (_e = process.env).FIRESTORE_EMULATOR_HOST) !== null && _a !== void 0 ? _a : (_e.FIRESTORE_EMULATOR_HOST = "127.0.0.1:8080");
            (_b = (_f = process.env).FIREBASE_AUTH_EMULATOR_HOST) !== null && _b !== void 0 ? _b : (_f.FIREBASE_AUTH_EMULATOR_HOST = "127.0.0.1:9099");
            (_c = (_g = process.env).FIREBASE_PROJECT_ID) !== null && _c !== void 0 ? _c : (_g.FIREBASE_PROJECT_ID = "demo-blogger");
        }
        if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
            (_d = (_h = process.env).EMAIL_TRANSPORT) !== null && _d !== void 0 ? _d : (_h.EMAIL_TRANSPORT = "json");
        }
        server.middlewares.use(function (req, res, next) { return __awaiter(_this, void 0, void 0, function () {
            var url, aliases, match, module_1, handler, chunks, chunk, e_1_1, host, request, response, _a, _b, _c, _d, error_1;
            var _e, req_1, req_1_1;
            var _f, e_1, _g, _h;
            var _j, _k, _l, _m;
            return __generator(this, function (_o) {
                switch (_o.label) {
                    case 0:
                        url = new URL((_j = req.url) !== null && _j !== void 0 ? _j : "/", "http://localhost");
                        aliases = { "/rss.xml": "rss", "/sitemap.xml": "sitemap", "/robots.txt": "robots" };
                        match = aliases[url.pathname]
                            ? [url.pathname, aliases[url.pathname]]
                            : url.pathname.match(/^\/api\/([a-z0-9-]+)$/);
                        if (!match)
                            return [2 /*return*/, next()];
                        _o.label = 1;
                    case 1:
                        _o.trys.push([1, 17, , 18]);
                        return [4 /*yield*/, server.ssrLoadModule("/api/".concat(match[1], ".ts"))];
                    case 2:
                        module_1 = (_o.sent());
                        handler = module_1[(_k = req.method) !== null && _k !== void 0 ? _k : "GET"];
                        if (!handler) {
                            res.statusCode = 405;
                            return [2 /*return*/, res.end()];
                        }
                        chunks = [];
                        _o.label = 3;
                    case 3:
                        _o.trys.push([3, 8, 9, 14]);
                        _e = true, req_1 = __asyncValues(req);
                        _o.label = 4;
                    case 4: return [4 /*yield*/, req_1.next()];
                    case 5:
                        if (!(req_1_1 = _o.sent(), _f = req_1_1.done, !_f)) return [3 /*break*/, 7];
                        _h = req_1_1.value;
                        _e = false;
                        chunk = _h;
                        chunks.push(chunk);
                        _o.label = 6;
                    case 6:
                        _e = true;
                        return [3 /*break*/, 4];
                    case 7: return [3 /*break*/, 14];
                    case 8:
                        e_1_1 = _o.sent();
                        e_1 = { error: e_1_1 };
                        return [3 /*break*/, 14];
                    case 9:
                        _o.trys.push([9, , 12, 13]);
                        if (!(!_e && !_f && (_g = req_1.return))) return [3 /*break*/, 11];
                        return [4 /*yield*/, _g.call(req_1)];
                    case 10:
                        _o.sent();
                        _o.label = 11;
                    case 11: return [3 /*break*/, 13];
                    case 12:
                        if (e_1) throw e_1.error;
                        return [7 /*endfinally*/];
                    case 13: return [7 /*endfinally*/];
                    case 14:
                        host = (_l = req.headers.host) !== null && _l !== void 0 ? _l : "localhost";
                        request = new Request("http://".concat(host).concat(req.url), {
                            method: req.method,
                            headers: Object.entries(req.headers).flatMap(function (_a) {
                                var key = _a[0], value = _a[1];
                                return value === undefined ? [] : [[key, Array.isArray(value) ? value.join(", ") : value]];
                            }),
                            body: req.method === "GET" || req.method === "HEAD" ? undefined : Buffer.concat(chunks),
                        });
                        return [4 /*yield*/, handler(request)];
                    case 15:
                        response = _o.sent();
                        res.statusCode = response.status;
                        response.headers.forEach(function (value, key) { return res.setHeader(key, value); });
                        _b = (_a = res).end;
                        _d = (_c = Buffer).from;
                        return [4 /*yield*/, response.arrayBuffer()];
                    case 16:
                        _b.apply(_a, [_d.apply(_c, [_o.sent()])]);
                        return [3 /*break*/, 18];
                    case 17:
                        error_1 = _o.sent();
                        if (error_1.code === "ERR_LOAD_URL") {
                            res.statusCode = 404;
                            return [2 /*return*/, res.end()];
                        }
                        server.config.logger.error("[api] ".concat((_m = error_1.stack) !== null && _m !== void 0 ? _m : error_1));
                        res.statusCode = 500;
                        res.setHeader("Content-Type", "application/json");
                        res.end(JSON.stringify({ error: "Internal error" }));
                        return [3 /*break*/, 18];
                    case 18: return [2 /*return*/];
                }
            });
        }); });
    },
}); };
