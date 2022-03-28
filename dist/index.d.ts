import { AxiosInstance } from 'axios';
import { CookieJar } from 'tough-cookie';
interface loginReturnType {
    token: string;
    cookieJar: CookieJar;
    wclient: AxiosInstance;
}
export default function (instance?: string, user?: string, pass?: string): Promise<loginReturnType>;
export {};
