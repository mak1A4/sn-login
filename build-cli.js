const fs = require('fs');
fs.copyFileSync("./dist/cli.js", "./bin/sn-login");
fs.chmodSync("./bin/sn-login", 0755);