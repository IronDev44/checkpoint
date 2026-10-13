import { collection as firebaseCollection, doc as firebaseDoc, d1Enabled } from "./d1Data";
import { auth } from "../firebase";

import { accountsEnabled } from "./accountConfig";
export { accountsEnabled } from "./accountConfig";
const privateCollections = new Set(["games", "hardware", "playerProgress", "playerPrivateSettings", "gameCollections"]);
function scopedPath(parts) {
  if (d1Enabled || !accountsEnabled || !privateCollections.has(parts[0])) return parts;
  if (!auth.currentUser) throw new Error("Connecte-toi pour accéder à ta collection.");
  return ["users", auth.currentUser.uid, ...parts];
}
export const collection = (db, ...parts) => firebaseCollection(db, ...scopedPath(parts));
export const doc = (db, ...parts) => firebaseDoc(db, ...scopedPath(parts));
function storageKey(key) {
  if (!accountsEnabled) return key;
  if (!auth.currentUser) throw new Error("Aucun compte connecté.");
  return `checkpoint-account:${auth.currentUser.uid}:${key}`;
}
export const accountStorage = {
  getItem: key => window.localStorage.getItem(storageKey(key)),
  setItem: (key, value) => window.localStorage.setItem(storageKey(key), value),
  removeItem: key => window.localStorage.removeItem(storageKey(key)),
};
