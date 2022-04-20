import { AxiosInstance } from 'axios';
import { CookieJar } from 'tough-cookie';
export interface LoginData {
    token: string;
    wclient: AxiosInstance;
    cookieJar?: CookieJar;
}
declare function login(instance: string, user: string, mfa?: string): Promise<LoginData>;
export default login;
