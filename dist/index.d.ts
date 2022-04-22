import { AxiosInstance } from 'axios';
import { CookieJar } from 'tough-cookie';
export interface LoginData {
    token: string;
    wclient: AxiosInstance;
    cookieJar: CookieJar;
}
export interface AuthInfo {
    password?: string;
    mfaToken?: string;
}
declare function login(instance: string, user: string, auth?: AuthInfo): Promise<LoginData>;
export default login;
