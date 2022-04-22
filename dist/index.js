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
var os = require("os");
var fs = require("fs");
var path = require("path");
var crypto = require("crypto");
var axios_1 = require("axios");
var tough_cookie_1 = require("tough-cookie");
var axios_cookiejar_support_1 = require("axios-cookiejar-support");
var url_1 = require("url");
var keytar_1 = require("keytar");
function encrypt(text, key) {
    var iv = crypto.randomBytes(16);
    var keyHash = crypto.createHash('sha256').update(String(key)).digest("hex");
    var cipher = crypto.createCipheriv("aes-256-ctr", Buffer.from(keyHash, "hex"), iv);
    var encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return iv.toString("hex") + ':' + encrypted.toString("hex");
}
function decrypt(text, key) {
    var textParts = text.split(":");
    var iv = Buffer.from(textParts.shift(), "hex");
    var encryptedText = Buffer.from(textParts.join(":"), "hex");
    var keyHash = crypto.createHash('sha256').update(String(key)).digest("hex");
    var decipher = crypto.createDecipheriv("aes-256-ctr", Buffer.from(keyHash, "hex"), iv);
    var decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
}
function testLogin(snClient, instance) {
    return __awaiter(this, void 0, void 0, function () {
        var response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, snClient.get("/stats.do")];
                case 1:
                    response = _a.sent();
                    return [2 /*return*/, response.data.toString().indexOf("Instance name: " + instance) >= 0];
            }
        });
    });
}
function login(instance, user, pass, mfa) {
    return __awaiter(this, void 0, void 0, function () {
        var INSTANCE_NAME, instanceURL, userPassword, password, jar, cookieFilePath, encryptedCookieStr, decryptedCookieStr, cookieObj, wclient, snClient, loginFormData, loginResponse, responseBody, ck, loginSuccessful, cookieObjStr, encryptedCookieObj;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    INSTANCE_NAME = "".concat(instance, ".service-now.com");
                    instanceURL = "https://".concat(INSTANCE_NAME);
                    userPassword = pass;
                    if (!!userPassword) return [3 /*break*/, 2];
                    return [4 /*yield*/, (0, keytar_1.getPassword)(INSTANCE_NAME, user)];
                case 1:
                    password = _a.sent();
                    if (password)
                        userPassword = password;
                    else
                        throw "Couldn't find user password";
                    _a.label = 2;
                case 2:
                    jar = new tough_cookie_1.CookieJar();
                    cookieFilePath = path.join(os.tmpdir(), "".concat(instance, ":").concat(user, "_cookie.json"));
                    if (!fs.existsSync(cookieFilePath)) return [3 /*break*/, 4];
                    encryptedCookieStr = fs.readFileSync(cookieFilePath, 'utf8');
                    decryptedCookieStr = decrypt(encryptedCookieStr, userPassword);
                    cookieObj = JSON.parse(decryptedCookieStr);
                    cookieObj.cookieJar.cookies.forEach(function (c) {
                        var cookie = new tough_cookie_1.Cookie(c);
                        jar.setCookieSync(cookie, instanceURL);
                    });
                    wclient = (0, axios_cookiejar_support_1.wrapper)(axios_1.default.create({ jar: jar, baseURL: instanceURL }));
                    return [4 /*yield*/, testLogin(wclient, instance)];
                case 3:
                    if (_a.sent()) {
                        return [2 /*return*/, {
                                "token": cookieObj.token,
                                "cookieJar": jar,
                                "wclient": wclient
                            }];
                    }
                    _a.label = 4;
                case 4:
                    snClient = (0, axios_cookiejar_support_1.wrapper)(axios_1.default.create({ jar: jar, baseURL: instanceURL }));
                    if (mfa)
                        userPassword += mfa;
                    loginFormData = new url_1.URLSearchParams({
                        "user_name": user, "user_password": userPassword,
                        "remember_me": "true", "sys_action": "sysverb_login"
                    }).toString();
                    return [4 /*yield*/, snClient.post("/login.do", loginFormData, {
                            headers: {
                                "Connection": "keep-alive",
                                "Cache-Control": "max-age=0",
                                "Content-Type": "application/x-www-form-urlencoded"
                            }
                        })];
                case 5:
                    loginResponse = _a.sent();
                    responseBody = loginResponse.data;
                    ck = responseBody.split("var g_ck = '")[1].split('\'')[0];
                    snClient.defaults.headers.common["X-UserToken"] = ck;
                    return [4 /*yield*/, testLogin(snClient, instance)];
                case 6:
                    loginSuccessful = _a.sent();
                    if (!loginSuccessful)
                        throw "Login failed, MFA required?";
                    cookieObjStr = JSON.stringify({
                        "cookieJar": jar.toJSON(),
                        "token": ck
                    });
                    encryptedCookieObj = encrypt(cookieObjStr, userPassword);
                    fs.writeFileSync(cookieFilePath, encryptedCookieObj, "utf-8");
                    return [2 /*return*/, {
                            "token": ck,
                            "cookieJar": jar,
                            "wclient": snClient
                        }];
            }
        });
    });
}
exports.default = login;
