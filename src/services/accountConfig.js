// Public deployment defaults: these identifiers are not credentials.
// Builds on Cloudflare do not have the ignored local environment file.
export const accountsEnabled = process.env.REACT_APP_ACCOUNTS_ENABLED !== "false";
export const d1Enabled = process.env.REACT_APP_DATA_BACKEND !== "firestore";
export const ownerUid = process.env.REACT_APP_OWNER_UID || "pAcrkmTs1tN8Kfv9C2IdNICKLOi2";
