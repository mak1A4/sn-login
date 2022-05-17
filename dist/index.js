"use strict";
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
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.cookieStore = exports.credentialStore = void 0;
var OTPAuth = require("otpauth");
var axios_1 = require("axios");
var axios_cookiejar_support_1 = require("axios-cookiejar-support");
var url_1 = require("url");
var cred_store_1 = require("./cred-store");
var cookie_store_1 = require("./cookie-store");
exports.credentialStore = require("./cred-store");
exports.cookieStore = require("./cookie-store");
function getMultiFactorToken(mfaKey) {
    var totp = new OTPAuth.TOTP({
        "secret": mfaKey,
        "digits": 6,
        "period": 30
    });
    return totp.generate();
}
function login(instance, user, password) {
    return __awaiter(this, void 0, void 0, function () {
        var INSTANCE_NAME, instanceURL, userPassword, iCred, jar, axiosClient, userToken, httpClient, loginPassword, mfaKeyResult, loginFormData, loginResponse, responseBody, ck, nowSession;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    INSTANCE_NAME = "".concat(instance, ".service-now.com");
                    instanceURL = "https://".concat(INSTANCE_NAME);
                    userPassword = password;
                    if (!!userPassword) return [3 /*break*/, 2];
                    return [4 /*yield*/, (0, cred_store_1.getInstanceCredentials)(instance, user)];
                case 1:
                    iCred = _a.sent();
                    if (iCred.password)
                        userPassword = iCred.password;
                    else
                        throw "Couldn't find user password";
                    _a.label = 2;
                case 2:
                    jar = (0, cookie_store_1.getCookieJar)(instance, user, userPassword);
                    if ((0, cookie_store_1.checkUserSessionValid)(instance, jar)) {
                        axiosClient = (0, axios_cookiejar_support_1.wrapper)(axios_1.default.create({ jar: jar, baseURL: instanceURL }));
                        userToken = (0, cookie_store_1.getUserToken)(instance, user, userPassword);
                        return [2 /*return*/, {
                                "httpClient": axiosClient,
                                "userToken": userToken
                            }];
                    }
                    httpClient = (0, axios_cookiejar_support_1.wrapper)(axios_1.default.create({ jar: jar, baseURL: instanceURL }));
                    loginPassword = userPassword;
                    return [4 /*yield*/, (0, cred_store_1.getInstanceMultiFactorKey)(instance, user)];
                case 3:
                    mfaKeyResult = _a.sent();
                    if (mfaKeyResult.mfaKey) {
                        loginPassword += getMultiFactorToken(mfaKeyResult.mfaKey);
                    }
                    loginFormData = new url_1.URLSearchParams({
                        "user_name": user, "user_password": loginPassword,
                        "remember_me": "true", "sys_action": "sysverb_login"
                    }).toString();
                    return [4 /*yield*/, httpClient.post("/login.do", loginFormData, {
                            headers: {
                                "Connection": "keep-alive",
                                "Cache-Control": "max-age=0",
                                "Content-Type": "application/x-www-form-urlencoded"
                            }
                        })];
                case 4:
                    loginResponse = _a.sent();
                    responseBody = loginResponse.data;
                    if (responseBody.indexOf('id="sysverb_login"') >= 0) {
                        throw "Login failed";
                    }
                    ck = responseBody.split("var g_ck = '")[1].split('\'')[0];
                    httpClient.defaults.headers.common["X-UserToken"] = ck;
                    nowSession = {
                        "httpClient": httpClient,
                        "userToken": ck
                    };
                    (0, cookie_store_1.writeCookieStore)(instance, user, userPassword, nowSession);
                    return [2 /*return*/, nowSession];
            }
        });
    });
}
exports.default = login;
