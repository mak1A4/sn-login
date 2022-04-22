import * as os from 'os';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import axios, { AxiosInstance } from 'axios';
import { Cookie, CookieJar } from 'tough-cookie';
import { wrapper } from 'axios-cookiejar-support';
import { URLSearchParams } from "url";
import { getPassword } from 'keytar';

export interface LoginData {
    token: string,
    wclient: AxiosInstance,
    cookieJar: CookieJar
}

function encrypt(text: string, key: string): string {
    let iv = crypto.randomBytes(16);
    let keyHash = crypto.createHash('sha256').update(String(key)).digest("hex");
	let cipher = crypto.createCipheriv("aes-256-ctr", Buffer.from(keyHash, "hex"), iv);
	let encrypted = cipher.update(text);
	encrypted = Buffer.concat([encrypted, cipher.final()]);
	return iv.toString("hex") + ':' + encrypted.toString("hex");
}

function decrypt(text: string, key: string): string {
    let textParts = text.split(":");
	let iv = Buffer.from(textParts.shift() as string, "hex");
	let encryptedText = Buffer.from(textParts.join(":"), "hex");
    let keyHash = crypto.createHash('sha256').update(String(key)).digest("hex");
	let decipher = crypto.createDecipheriv("aes-256-ctr", Buffer.from(keyHash, "hex"), iv);
	let decrypted = decipher.update(encryptedText);
	decrypted = Buffer.concat([decrypted, decipher.final()]);
	return decrypted.toString();
}

async function testLogin(snClient: AxiosInstance, instance: string): Promise<boolean> {
    let response = await snClient.get("/stats.do");
    return response.data.toString().indexOf("Instance name: " + instance) >= 0
}

async function login(instance: string, user: string, mfa?: string): Promise<LoginData>;
async function login(instance: string, user: string, pass?: string, mfa?: string): Promise<LoginData>;
async function login(instance: string, user: string, pass?: string, mfa?: string): Promise<LoginData> {

    const INSTANCE_NAME = `${instance}.service-now.com`;
    let instanceURL: string = `https://${INSTANCE_NAME}`;

    let userPassword = pass;
    if (!userPassword) {
        let password = await getPassword(INSTANCE_NAME, user);
        if (password) userPassword = password;
        else throw "Couldn't find user password";
    }

    let jar = new CookieJar();
    let cookieFilePath = path.join(os.tmpdir(), `${instance}:${user}_cookie.json`);
    if (fs.existsSync(cookieFilePath)) {
        let encryptedCookieStr = fs.readFileSync(cookieFilePath, 'utf8');
        let decryptedCookieStr = decrypt(encryptedCookieStr, userPassword);
        let cookieObj = JSON.parse(decryptedCookieStr);
        cookieObj.cookieJar.cookies.forEach((c: any) => {
            var cookie = new Cookie(c);
            jar.setCookieSync(cookie, instanceURL);
        });
        let wclient = wrapper(axios.create({ jar, baseURL: instanceURL}));
        if (await testLogin(wclient, instance)) {
            return {
                "token": cookieObj.token,
                "cookieJar": cookieObj.cookieJar,
                "wclient": wclient
            };
        }
    }

    const snClient = wrapper(axios.create({ jar, baseURL: instanceURL}));

    if (mfa) userPassword += mfa;
    let loginFormData = new URLSearchParams({
        "user_name": user, "user_password": userPassword,
        "remember_me": "true", "sys_action": "sysverb_login"
    } as any).toString();
    let loginResponse = await snClient.post("/login.do", loginFormData, {
        headers: {
            "Connection": "keep-alive",
            "Cache-Control": "max-age=0",
            "Content-Type": "application/x-www-form-urlencoded"
        }
    });
    let responseBody = loginResponse.data;
    let ck = responseBody.split("var g_ck = '")[1].split('\'')[0];
    snClient.defaults.headers.common["X-UserToken"] = ck;
    
    let loginSuccessful = await testLogin(snClient, instance);
    if (!loginSuccessful) throw "Login failed, MFA required?";

    let cookieObjStr = JSON.stringify({
        "cookieJar": jar.toJSON(),
        "token": ck
    });
    let encryptedCookieObj = encrypt(cookieObjStr, userPassword);
    fs.writeFileSync(cookieFilePath, encryptedCookieObj, "utf-8");
    
    return {
        "token": ck,
        "cookieJar": jar,
        "wclient": snClient
    };
}
export default login;