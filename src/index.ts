import axios, { AxiosInstance } from 'axios';
import { CookieJar } from 'tough-cookie';
import { wrapper } from 'axios-cookiejar-support';
import { URLSearchParams } from "url";

export interface LoginData {
    token: string,
    wclient: AxiosInstance,
    cookieJar?: CookieJar
}

export default async function (instance: string, user?: string, pass?: string): Promise<LoginData> {

    let jar = new CookieJar();
    const snClient = wrapper(axios.create({ jar }));

    let instanceUrl = `https://${instance}.service-now.com/login.do`;
    let loginFormData = new URLSearchParams({
        "user_name": user, "user_password": pass,
        "remember_me": "true", "sys_action": "sysverb_login"
    } as any).toString();
    let loginResponse = await snClient.post(instanceUrl, loginFormData, {
        headers: {
            "Connection": "keep-alive",
            "Cache-Control": "max-age=0",
            "Content-Type": "application/x-www-form-urlencoded"
        }
    });
    var responseBody = loginResponse.data;
    var ck = responseBody.split("var g_ck = '")[1].split('\'')[0];
    
    return {
        "token": ck,
        "cookieJar": jar,
        "wclient": snClient
    };
}