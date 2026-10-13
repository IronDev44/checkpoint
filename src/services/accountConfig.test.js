const keys = ["REACT_APP_ACCOUNTS_ENABLED", "REACT_APP_DATA_BACKEND", "REACT_APP_OWNER_UID"];
const original = Object.fromEntries(keys.map(key => [key, process.env[key]]));
afterEach(() => { keys.forEach(key => { if (original[key] === undefined) delete process.env[key]; else process.env[key] = original[key]; }); jest.resetModules(); });
test("a build without local configuration keeps accounts and D1 enabled", () => {
  keys.forEach(key => delete process.env[key]); jest.resetModules();
  const config = require("./accountConfig");
  expect(config.accountsEnabled).toBe(true);
  expect(config.d1Enabled).toBe(true);
  expect(config.ownerUid).toBe("pAcrkmTs1tN8Kfv9C2IdNICKLOi2");
});
test("an explicit rollback configuration is respected", () => {
  process.env.REACT_APP_ACCOUNTS_ENABLED="false";
  process.env.REACT_APP_DATA_BACKEND="firestore";
  process.env.REACT_APP_OWNER_UID="configured-owner"; jest.resetModules();
  const config=require("./accountConfig");
  expect(config.accountsEnabled).toBe(false);
  expect(config.d1Enabled).toBe(false);
  expect(config.ownerUid).toBe("configured-owner");
});
