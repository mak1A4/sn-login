import snlogin from "../src/index";
import * as dotenv from 'dotenv';

(async () => {

    dotenv.config();

    let instance = process.env.SN_INSTANCE as string;
    let user = process.env.SN_USER as string;
    let loginResponse = await snlogin(instance, user);
    let wclient = loginResponse.wclient;

    let testUrl = `https://${instance}.service-now.com/sys.scripts.do`;
    let postFormData = new URLSearchParams({
        "script": "gs.print('$$TEST_PASSED$$')",
        "sysparm_ck": loginResponse.token,
        "sys_scope": "global",
        "runscript": "Run script",
        "quota_managed_transaction": "on",
        "record_for_rollback": "on"
    } as any).toString();

    var testResponse = await wclient.post(testUrl, postFormData, {
        headers: {
            "X-UserToken": loginResponse.token,
            "Connection": "keep-alive",
            "Cache-Control": "max-age=0",
            "User-Agent": "SN-Node Client",
            "Content-Type": "application/x-www-form-urlencoded"
        }
    });
    console.log(testResponse.data);
})();