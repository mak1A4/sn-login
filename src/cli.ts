#!/usr/bin/env node
import { findCredentials, getPassword, setPassword } from 'keytar';
import minimist = require('minimist');

(async (argv: string[]) => {
    let parm = minimist(argv.slice(2));
    if (parm._[0] !== "find" && parm._[0] !== "set") {
        console.log(`Supported Commands: find --instance "mydevinstance" --user "admin"`);
        console.log(`                    set --instance "mydevinstance" --user "admin" --pass "123"`);
        return;
    }
    if (!parm.instance) {
        console.log("instance parameter is required");
        return;
    }
    let instanceUrl = `${parm.instance}.service-now.com`
    switch (parm._[0]) {
        case "find":
            if (!parm.user) {
                let credList = await findCredentials(instanceUrl);
                let printCredStr = credList.map((x) => {
                    return "user: " + x.account + ", password: " + x.password;
                }).join("\n");
                console.log(printCredStr);
            } else {
                let userPass = await getPassword(instanceUrl, parm.user);
                console.log("password: " + userPass);
            }
            break;
        case "set":
            if (!parm.user || !parm.pass) {
                console.log("user and pass parameter are required");
                return;
            }
            setPassword(instanceUrl, parm.user, parm.pass);
            console.log(instanceUrl);
            console.log(`Password for user [${parm.user}] has been set`);
    }

})(process.argv);