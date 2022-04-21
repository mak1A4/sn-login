import axios, { AxiosInstance } from 'axios';
import { CookieJar } from 'tough-cookie';
import { wrapper } from 'axios-cookiejar-support';
import { URLSearchParams } from "url";
import { getPassword } from 'keytar';

export interface LoginData {
    token: string,
    wclient: AxiosInstance,
    cookieJar?: CookieJar
}

async function login(instance: string, user: string): Promise<LoginData>;
async function login(instance: string, user: string, pass?: string): Promise<LoginData>;
async function login(instance: string, user: string, pass?: string): Promise<LoginData> {

    const INSTANCE_NAME = `${instance}.service-now.com`;
    let jar = new CookieJar();
    let instanceURL: string = `https://${INSTANCE_NAME}`;
    const snClient = wrapper(axios.create({ jar, baseURL: instanceURL}));

    let userPassword = pass;
    if (!userPassword) {
        let password = await getPassword(instance, user);
        if (password) userPassword = password;
        else throw "Couldn't find user password";
    }
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
    
    return {
        "token": ck,
        "cookieJar": jar,
        "wclient": snClient
    };
}
export default login;