"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserToken = exports.writeCookieStore = exports.getCookieJar = exports.checkUserSessionValid = exports.decrypt = exports.encrypt = void 0;
var os = require("os");
var fs = require("fs");
var path = require("path");
var crypto = require("crypto");
var luxon_1 = require("luxon");
var tough_cookie_1 = require("tough-cookie");
function encrypt(text, key) {
    var iv = crypto.randomBytes(16);
    var keyHash = crypto.createHash('sha256').update(String(key)).digest("hex");
    var cipher = crypto.createCipheriv("aes-256-ctr", Buffer.from(keyHash, "hex"), iv);
    var encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return iv.toString("hex") + ':' + encrypted.toString("hex");
}
exports.encrypt = encrypt;
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
exports.decrypt = decrypt;
function checkUserSessionValid(instance, jar) {
    var INSTANCE_NAME = "".concat(instance, ".service-now.com");
    var instanceURL = "https://".concat(INSTANCE_NAME);
    var glideSessionStore = jar.getCookiesSync(instanceURL).find(function (c) { return c.key === "glide_session_store"; });
    if (glideSessionStore && glideSessionStore.expires) {
        var sessionExpires = luxon_1.DateTime.fromISO(glideSessionStore.expires);
        var nowDateTime = luxon_1.DateTime.now();
        return nowDateTime < sessionExpires;
    }
    return false;
}
exports.checkUserSessionValid = checkUserSessionValid;
function getCookieJar(instance, user, password) {
    var INSTANCE_NAME = "".concat(instance, ".service-now.com");
    var instanceURL = "https://".concat(INSTANCE_NAME);
    var jar = new tough_cookie_1.CookieJar();
    var cookieFilePath = path.join(os.tmpdir(), "".concat(instance, ":").concat(user, "_cookie.json"));
    if (fs.existsSync(cookieFilePath)) {
        try {
            var encryptedCookieStr = fs.readFileSync(cookieFilePath, 'utf8');
            var decryptedCookieStr = decrypt(encryptedCookieStr, password);
            var cookieObj = JSON.parse(decryptedCookieStr);
            cookieObj.cookieJar.cookies.forEach(function (c) {
                var cookie = new tough_cookie_1.Cookie(c);
                jar.setCookieSync(cookie, instanceURL);
            });
        }
        catch (err) {
            jar = new tough_cookie_1.CookieJar();
        }
    }
    return jar;
}
exports.getCookieJar = getCookieJar;
function writeCookieStore(instance, user, password, login) {
    var _a;
    var cookieFilePath = path.join(os.tmpdir(), "".concat(instance, ":").concat(user, "_cookie.json"));
    var cookieObjStr = JSON.stringify({
        "cookieJar": (_a = login.httpClient.defaults.jar) === null || _a === void 0 ? void 0 : _a.toJSON(),
        "token": login.userToken
    });
    var encryptedCookieObj = encrypt(cookieObjStr, password);
    fs.writeFileSync(cookieFilePath, encryptedCookieObj, "utf-8");
}
exports.writeCookieStore = writeCookieStore;
function getUserToken(instance, user, password) {
    var cookieStorePath = path.join(os.tmpdir(), "".concat(instance, ":").concat(user, "_cookie.json"));
    if (fs.existsSync(cookieStorePath)) {
        try {
            var encryptedCookieStr = fs.readFileSync(cookieStorePath, 'utf8');
            var decryptedCookieStr = decrypt(encryptedCookieStr, password);
            var cookieObj = JSON.parse(decryptedCookieStr);
            return cookieObj.token;
        }
        catch (err) {
            throw "Couldn't decrypt cookie store";
        }
    }
    else {
        throw "Couldn't get user token, no cookie store found";
    }
}
exports.getUserToken = getUserToken;
