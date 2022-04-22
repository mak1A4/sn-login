import { AxiosInstance } from "axios";
import snlogin from "../src/index";

async function testLogin(snClient: AxiosInstance, instance: string): Promise<boolean> {
    let response = await snClient.get("/stats.do");
    return response.data.toString().indexOf("Instance name: " + instance) >= 0
}

test("Login with passwd", async () => {
    let instance = process.env.SN_INSTANCE as string;
    let user = process.env.SN_USER as string;
    let password = process.env.SN_PASS as string;
    let loginResponse = await snlogin(instance, user, { "password": password });
    let wclient = loginResponse.wclient;

    expect(await testLogin(wclient, instance)).toBe(true);
});

test("Login without passwd", async () => {
    let instance = process.env.SN_INSTANCE as string;
    let user = process.env.SN_USER as string;
    let loginResponse = await snlogin(instance, user);
    let wclient = loginResponse.wclient;

    expect(await testLogin(wclient, instance)).toBe(true);
});