import { credentialStore } from "../src/index";

const INSTANCE: string = "test_instance";
const USER: string = "test_user";
const USER_PASS: string = "test_pass";

test("Store instance credentials", async () => {
    await credentialStore.storeInstanceCredentials(INSTANCE, USER, USER_PASS);
    let userCred = await credentialStore.getInstanceCredentials(INSTANCE, USER);
    expect(userCred.password).toBe(USER_PASS);
});

test("Find all instance credentials", async () => {
    let result = await credentialStore.getAllInstanceCredentials(INSTANCE);
    let foundCreds = result.length > 0;
    expect(foundCreds).toBe(true);
});

test("Get instance credentials", async () => {
    let userCred = await credentialStore.getInstanceCredentials(INSTANCE, USER);
    expect(userCred.password).toBe(USER_PASS);
});

test("Delete instance credentials", async () => {
    await credentialStore.deleteInstanceCredentials(INSTANCE, USER);
    let userCred = await credentialStore.getInstanceCredentials(INSTANCE, USER);
    expect(userCred.password).toBeNull();
});