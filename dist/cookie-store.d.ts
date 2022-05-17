import { CookieJar } from 'tough-cookie';
import { NowSession } from './index';
export declare function encrypt(text: string, key: string): string;
export declare function decrypt(text: string, key: string): string;
export declare function checkUserSessionValid(instance: string, jar: CookieJar): boolean;
export declare function getCookieJar(instance: string, user: string, password: string): CookieJar;
export declare function writeCookieStore(instance: string, user: string, password: string, login: NowSession): void;
export declare function getUserToken(instance: string, user: string, password: string): string;
