import { AxiosInstance } from 'axios';
export * as credentialStore from "./cred-store";
export * as cookieStore from "./cookie-store";
export interface NowSession {
    userToken: string;
    httpClient: AxiosInstance;
}
declare function login(instance: string, user: string, password?: string): Promise<NowSession>;
export default login;
