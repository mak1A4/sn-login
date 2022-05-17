import * as os from 'os';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import { DateTime } from "luxon";
import { Cookie, CookieJar } from 'tough-cookie';
import { NowSession } from './index';

export function encrypt(text: string, key: string): string {
    let iv = crypto.randomBytes(16);
    let keyHash = crypto.createHash('sha256').update(String(key)).digest("hex");
    let cipher = crypto.createCipheriv("aes-256-ctr", Buffer.from(keyHash, "hex"), iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return iv.toString("hex") + ':' + encrypted.toString("hex");
}

export function decrypt(text: string, key: string): string {
    let textParts = text.split(":");
    let iv = Buffer.from(textParts.shift() as string, "hex");
    let encryptedText = Buffer.from(textParts.join(":"), "hex");
    let keyHash = crypto.createHash('sha256').update(String(key)).digest("hex");
    let decipher = crypto.createDecipheriv("aes-256-ctr", Buffer.from(keyHash, "hex"), iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
}

export function checkUserSessionValid(instance: string, jar: CookieJar): boolean {

    const INSTANCE_NAME = `${instance}.service-now.com`;
    let instanceURL: string = `https://${INSTANCE_NAME}`;

    let glideSessionStore = jar.getCookiesSync(instanceURL).find((c) => c.key === "glide_session_store");
    if (glideSessionStore && glideSessionStore.expires) {
        let sessionExpires = DateTime.fromISO(glideSessionStore.expires as string);
        let nowDateTime = DateTime.now();
        return nowDateTime < sessionExpires;
    }
    return false;
}

export function getCookieJar(instance: string, user: string, password: string): CookieJar {

    const INSTANCE_NAME = `${instance}.service-now.com`;
    let instanceURL: string = `https://${INSTANCE_NAME}`;

    let jar = new CookieJar();
    let cookieFilePath = path.join(os.tmpdir(), `${instance}:${user}_cookie.json`);
    if (fs.existsSync(cookieFilePath)) {
        try {
            let encryptedCookieStr = fs.readFileSync(cookieFilePath, 'utf8');
            let decryptedCookieStr = decrypt(encryptedCookieStr, password);
            let cookieObj = JSON.parse(decryptedCookieStr);
            cookieObj.cookieJar.cookies.forEach((c: any) => {
                var cookie = new Cookie(c);
                jar.setCookieSync(cookie, instanceURL);
            });
        } catch (err) {
            jar = new CookieJar();
        }
    }
    return jar;
}

export function writeCookieStore(instance: string, user: string, password: string, login: NowSession): void {

    let cookieFilePath = path.join(os.tmpdir(), `${instance}:${user}_cookie.json`);
    let cookieObjStr = JSON.stringify({
        "cookieJar": login.httpClient.defaults.jar?.toJSON(),
        "token": login.userToken
    });
    let encryptedCookieObj = encrypt(cookieObjStr, password);
    fs.writeFileSync(cookieFilePath, encryptedCookieObj, "utf-8");
}

export function getUserToken(instance: string, user: string, password: string): string {

    let cookieStorePath = path.join(os.tmpdir(), `${instance}:${user}_cookie.json`);
    if (fs.existsSync(cookieStorePath)) {
        try {
            let encryptedCookieStr = fs.readFileSync(cookieStorePath, 'utf8');
            let decryptedCookieStr = decrypt(encryptedCookieStr, password);
            let cookieObj = JSON.parse(decryptedCookieStr);
            return cookieObj.token;
        } catch (err) {
            throw "Couldn't decrypt cookie store";
        }
    } else {
        throw "Couldn't get user token, no cookie store found";
    }
}