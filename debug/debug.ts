import snlogin, { LoginData } from "../src/index";
import * as dotenv from 'dotenv';

(async () => {

    dotenv.config();

    try {
        let instance = process.env.SN_INSTANCE as string;
        let user = process.env.SN_USER as string;
        let loginResponse = await snlogin(instance, user);

        let wclient = loginResponse.wclient;

        let postBodyObj = {
            "sysparm_processor": "CleanTemplateInputName",
            "sysparm_name": "createCleanName",
            "sysparm_label": "TestLoginSuccessful",
            "sysparm_scope": "global"
        } as any;
        let postFormData = new URLSearchParams(postBodyObj).toString();

        let response = await wclient.post("/xmlhttp.do", postFormData, {
            "headers": {
                "X-UserToken": loginResponse.token
            }
        });
        console.log(response.data);

    } catch (e: any) {
        console.error(e.toString());
    }

})();