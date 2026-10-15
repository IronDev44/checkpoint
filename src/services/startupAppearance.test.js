import { readStartupAppearance, saveStartupAppearance } from "./startupAppearance";

beforeEach(() => localStorage.clear());
test("remembers only the visual options needed before sign-in", () => {
  saveStartupAppearance({ theme:"theme-kart", effects:"boost", light:true, email:"private@example.com", uid:"secret" });
  expect(readStartupAppearance()).toEqual({ theme:"theme-kart", effects:"boost", light:true });
  expect(localStorage.getItem("checkpoint-startup-appearance")).not.toMatch(/email|uid|secret/);
});
test("reads legacy theme preferences without examining account data", () => {
  const storage = { getItem:jest.fn(key => key === "checkpoint-theme" ? "theme-matrix" : null) };
  expect(readStartupAppearance(storage).theme).toBe("theme-matrix");
  expect(storage.getItem.mock.calls.flat()).toEqual(["checkpoint-startup-appearance", "checkpoint-theme"]);
});
test("invalid or unavailable storage never blocks the intro", () => {
  localStorage.setItem("checkpoint-startup-appearance", "invalid json");
  expect(readStartupAppearance().theme).toBe("theme-indigo");
  expect(readStartupAppearance({ getItem:()=>{throw new Error("denied");} }).theme).toBe("theme-indigo");
  expect(()=>saveStartupAppearance({ theme:"theme-kart" }, { setItem:()=>{throw new Error("denied");} })).not.toThrow();
});
