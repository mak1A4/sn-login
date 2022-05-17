import * as OTPAuth from 'otpauth';
import axios, { AxiosInstance } from 'axios';
import { wrapper } from 'axios-cookiejar-support';
import { URLSearchParams } from "url";
import { getInstanceCredentials, getInstanceMultiFactorKey } from "./cred-store";
import { getCookieJar, writeCookieStore, checkUserSessionValid, getUserToken } from "./cookie-store";

export * as credentialStore from "./cred-store";
export * as cookieStore from "./cookie-store";

export interface NowSession {
    userToken: string,
    httpClient: AxiosInstance
}

function getMultiFactorToken(mfaKey: string): string {
    let totp = new OTPAuth.TOTP({
        "secret": mfaKey,
        "digits": 6,
        "period": 30
    })
    return totp.generate();
}

async function login(instance: string, user: string, password?: string): Promise<NowSession> {

    const INSTANCE_NAME = `${instance}.service-now.com`;
    let instanceURL: string = `https://${INSTANCE_NAME}`;

    let userPassword = password;
    if (!userPassword) {
        let iCred = await getInstanceCredentials(instance, user);
        if (iCred.password) userPassword = iCred.password;
        else throw "Couldn't find user password";
    }

    let jar = getCookieJar(instance, user, userPassword);
    if (checkUserSessionValid(instance, jar)) {
        let axiosClient = wrapper(axios.create({ jar, baseURL: instanceURL }));
        let userToken = getUserToken(instance, user, userPassword);
        return {
            "httpClient": axiosClient,
            "userToken": userToken
        };
    }

    const httpClient = wrapper(axios.create({ jar, baseURL: instanceURL }));

    let loginPassword = userPassword;
    let mfaKeyResult = await getInstanceMultiFactorKey(instance, user);
    if (mfaKeyResult.mfaKey) {
        loginPassword += getMultiFactorToken(mfaKeyResult.mfaKey);
    }
    let loginFormData = new URLSearchParams({
        "user_name": user, "user_password": loginPassword,
        "remember_me": "true", "sys_action": "sysverb_login"
    } as any).toString();
    let loginResponse = await httpClient.post("/login.do", loginFormData, {
        headers: {
            "Connection": "keep-alive",
            "Cache-Control": "max-age=0",
            "Content-Type": "application/x-www-form-urlencoded"
        }
    });
    let responseBody = loginResponse.data;
    if (responseBody.indexOf('id="sysverb_login"') >= 0) {
        throw "Login failed";
    }

    let ck = responseBody.split("var g_ck = '")[1].split('\'')[0];
    httpClient.defaults.headers.common["X-UserToken"] = ck;

    let nowSession = {
        "httpClient": httpClient,
        "userToken": ck
    };
    writeCookieStore(instance, user, userPassword, nowSession);
    return nowSession;
}
export default login;