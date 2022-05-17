import { AxiosInstance } from "axios";
import snlogin from "../src/index";

async function testLogin(snClient: AxiosInstance, token: string): Promise<boolean> {
    try {
        let postBodyObj = {
            "sysparm_processor": "CleanTemplateInputName",
            "sysparm_name": "createCleanName",
            "sysparm_label": "TestLoginSuccessful",
            "sysparm_scope": "global"
        } as any;
        let postFormData = new URLSearchParams(postBodyObj).toString();
    
        let response = await snClient.post("/xmlhttp.do", postFormData, {
            "headers": {
                "X-UserToken": token
            }
        });
        return response.data.indexOf(`answer="testloginsuccessful"`) >= 0;
    } catch (err) {
        return false;
    }
}

test("Login with passwd", async () => {
    let instance = process.env.SN_INSTANCE as string;
    let user = process.env.SN_USER as string;
    let password = process.env.SN_PASS as string;
    let loginResponse = await snlogin(instance, user, password);
    let wclient = loginResponse.httpClient;

    expect(await testLogin(wclient, loginResponse.userToken)).toBe(true);
});

test("Login without passwd", async () => {
    let instance = process.env.SN_INSTANCE as string;
    let user = process.env.SN_USER as string;
    let loginResponse = await snlogin(instance, user);
    let wclient = loginResponse.httpClient;

    expect(await testLogin(wclient, loginResponse.userToken)).toBe(true);
});

test("Login without passwd and mfa", async () => {
    let instance = process.env.SN_INSTANCE as string;
    let user = process.env.SN_MFA_USER as string;
    let loginResponse = await snlogin(instance, user);
    let wclient = loginResponse.httpClient;

    expect(await testLogin(wclient, loginResponse.userToken)).toBe(true);
});

test("Login failed", async () => {
    let instance = process.env.SN_INSTANCE as string;
    let user = process.env.SN_USER as string;
    try {
        let loginResponse = await snlogin(instance, user, "wrong_passwd");
        let wclient = loginResponse.httpClient;
        expect(await testLogin(wclient, loginResponse.userToken)).toBe(false);
    } catch(err) {
        expect(err).toBe("Login failed");
    }
});