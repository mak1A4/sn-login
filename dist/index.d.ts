import { AxiosInstance } from 'axios';
import { CookieJar } from 'tough-cookie';
export * as credentialStore from "./cred-store";
export * as cookieStore from "./cookie-store";
export interface NowSession {
    userToken: string;
    httpClient: AxiosInstance;
    getCookieJar(): CookieJar;
}
declare function login(instance: string, user: string, password?: string): Promise<NowSession>;
export default login;
