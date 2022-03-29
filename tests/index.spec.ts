//console.log(process.env.BASE_URL);
import snlogin from "../src/index";
const h2p = require('html2plaintext')

describe("Test Service-Now Login", () => {
    it("Execute a script in global scope must work", async () => {
        let loginResponse = await snlogin(process.env.SN_INSTANCE as string, process.env.SN_USER, process.env.SN_PASS);
        let wclient = loginResponse.wclient;

        let testUrl = "https://" + process.env.SN_INSTANCE + ".service-now.com/sys.scripts.do";
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
        var foundScriptResponse = h2p(testResponse.data).indexOf("$$TEST_PASSED$$") >= 0;
        console.log(h2p(testResponse.data));
        expect(foundScriptResponse).toBe(true);
    });
});