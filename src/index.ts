import axios, { AxiosInstance } from 'axios';
import { CookieJar } from 'tough-cookie';
import { wrapper } from 'axios-cookiejar-support';
import { URLSearchParams } from "url";
import { findCredentials, getPassword, setPassword } from 'keytar';

export interface LoginData {
    token: string,
    wclient: AxiosInstance,
    cookieJar?: CookieJar
}

export default async function (instance: string, user?: string, pass?: string): Promise<LoginData> {

    const INSTANCE_NAME = `${instance}.service-now.com`;
    let credentials = await findCredentials(INSTANCE_NAME);
    let password = pass;
    if (credentials.length == 0 && instance && user && pass) {
        await setPassword(INSTANCE_NAME, user, pass);
    }
    else if (user) {
        pass = await getPassword(INSTANCE_NAME, user) as string;
    }

    let jar = new CookieJar();
    let instanceURL: string = `https://${INSTANCE_NAME}`;
    const snClient = wrapper(axios.create({ jar, baseURL: instanceURL}));

    let loginFormData = new URLSearchParams({
        "user_name": user, "user_password": password,
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
    
    return {
        "token": ck,
        "cookieJar": jar,
        "wclient": snClient
    };
}