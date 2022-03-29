import { AxiosInstance } from 'axios';
import { CookieJar } from 'tough-cookie';
export interface LoginData {
    token: string;
    wclient: AxiosInstance;
    cookieJar?: CookieJar;
}
export default function (instance: string, user?: string, pass?: string): Promise<LoginData>;
