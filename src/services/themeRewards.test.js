import { CHECKPOINT_PREMIUM_THEME as premium, CHECKPOINT_ULTIMATE_THEME as ultimate, earnThemeUnlocks, mergeThemeUnlocks, canUseTheme, resolveThemeRewards } from "./themeRewards";

test("premium unlocks at level 50, never at 49 or from an invalid level", () => {
  [1,49,NaN,Infinity,undefined,"50"].forEach(level=>expect(earnThemeUnlocks([],level)).toEqual([]));
  expect(earnThemeUnlocks([],50)).toEqual([premium]);
  expect(earnThemeUnlocks([],99)).toEqual([premium]);
  expect(earnThemeUnlocks([],100)).toEqual([premium,ultimate]);
});
test("earned rewards survive collection changes and late cloud settings", () => {
  expect(earnThemeUnlocks([premium],12)).toEqual([premium]);
  expect(mergeThemeUnlocks([premium],[])).toEqual([premium]);
  expect(mergeThemeUnlocks([],[premium,premium,"unknown"])).toEqual([premium]);
  expect(mergeThemeUnlocks(null,{premium:true})).toEqual([]);
});
test("only the reward theme is gated, other saved theme choices remain usable", () => {
  expect(canUseTheme(premium,[])).toBe(false);
  expect(canUseTheme(premium,[premium])).toBe(true);
  expect(canUseTheme("theme-checkpoint",[])).toBe(true);
  expect(canUseTheme("theme-indigo",[])).toBe(true);
});

test("restoration waits for account settings, collection and trial progress before resolving access", () => {
  const pending=resolveThemeRewards({theme:premium,unlockedThemes:[],level:1,ready:false});
  expect(pending.theme).toBe(premium);
  expect(pending.justUnlocked).toBe(false);
  expect(resolveThemeRewards({...pending,level:49,ready:true}).theme).toBe("theme-checkpoint");
  const restored=resolveThemeRewards({...pending,level:50,ready:true});
  expect(restored.theme).toBe(premium);
  expect(restored.unlockedThemes).toEqual([premium]);
});
test("earning a reward does not replace a chosen theme and notification happens only once", () => {
  const earned=resolveThemeRewards({theme:"theme-xbox",unlockedThemes:[],level:50,ready:true});
  expect(earned.theme).toBe("theme-xbox"); expect(earned.justUnlocked).toBe(true);
  const later=resolveThemeRewards({...earned,level:40,ready:true});
  expect(later.justUnlocked).toBe(false); expect(later.unlockedThemes).toEqual([premium]);
});


test("ultimate is gated at 100 and stays earned across cloud restoration and level changes", () => {
  expect(canUseTheme(ultimate, [premium])).toBe(false);
  expect(resolveThemeRewards({theme:ultimate,unlockedThemes:[premium],level:99,ready:true}).theme).toBe("theme-checkpoint");
  const reward=resolveThemeRewards({theme:"theme-xbox",unlockedThemes:[premium],level:100,ready:true});
  expect(reward.newlyUnlocked).toEqual([ultimate]);
  expect(reward.theme).toBe("theme-xbox");
  expect(mergeThemeUnlocks([],reward.unlockedThemes)).toEqual([premium,ultimate]);
  expect(canUseTheme(ultimate,earnThemeUnlocks(reward.unlockedThemes,2))).toBe(true);
  expect(resolveThemeRewards({...reward,level:2,ready:true}).justUnlocked).toBe(false);
});

test("only the authenticated configured owner receives early ultimate access", () => {
  const {ownerUid}=require('./accountConfig');
  const state={theme:"theme-checkpoint",unlockedThemes:[],level:1,ready:true};
  expect(resolveThemeRewards({...state,accountUid:ownerUid}).unlockedThemes).toEqual([ultimate]);
  expect(resolveThemeRewards({...state,accountUid:"another-player"}).unlockedThemes).toEqual([]);
  expect(resolveThemeRewards({...state,accountUid:undefined}).unlockedThemes).toEqual([]);
  expect(resolveThemeRewards({...state,accountUid:ownerUid,ready:false}).unlockedThemes).toEqual([]);
  expect(resolveThemeRewards({...state,accountUid:ownerUid}).theme).toBe("theme-checkpoint");
});
