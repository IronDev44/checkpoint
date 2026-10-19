import {ALL_THEME_CATALOG} from '../data/themeCatalog';
import {THEME_REWARD_LEVELS,getThemeUnlockLevel,isCheckpointTheme,CHECKPOINT_PREMIUM_THEME as premium,CHECKPOINT_ULTIMATE_THEME as ultimate,earnThemeUnlocks,mergeThemeUnlocks,canUseTheme,resolveThemeRewards} from './themeRewards';
test('51 distinct themes include a starter and exactly one reward for every even level through 100',()=>{
 expect(ALL_THEME_CATALOG).toHaveLength(51);expect(new Set(ALL_THEME_CATALOG.map(t=>t.id)).size).toBe(51);
 expect(Object.keys(THEME_REWARD_LEVELS)).toHaveLength(50);
 expect(Object.values(THEME_REWARD_LEVELS).sort((a,b)=>a-b)).toEqual(Array.from({length:50},(_,i)=>(i+1)*2));
 expect(getThemeUnlockLevel(premium)).toBe(50);expect(getThemeUnlockLevel(ultimate)).toBe(100);expect(getThemeUnlockLevel('theme-checkpoint')).toBe(0);
});
test.each(Object.entries(THEME_REWARD_LEVELS))('%s unlocks exactly at level %s and stays earned after a level drop',(id,level)=>{
 expect(earnThemeUnlocks([],level-1)).not.toContain(id);expect(earnThemeUnlocks([],level)).toContain(id);
 expect(canUseTheme(id,[])).toBe(false);expect(canUseTheme(id,earnThemeUnlocks([],level))).toBe(true);expect(earnThemeUnlocks([id],1)).toContain(id);
});
test('invalid levels cannot earn rewards, merges preserve valid cloud unlocks only',()=>{
 [NaN,Infinity,undefined,'50',1].forEach(level=>expect(earnThemeUnlocks([],level)).toEqual([]));
 expect(mergeThemeUnlocks([premium],['theme-indigo',premium,'unknown'])).toEqual([premium,'theme-indigo']);expect(mergeThemeUnlocks(null,{})).toEqual([]);
});
test('only the three signature themes use the Checkpoint presentation',()=>{
 expect(canUseTheme('theme-checkpoint',[])).toBe(true);expect(isCheckpointTheme('theme-checkpoint')).toBe(true);expect(isCheckpointTheme(premium)).toBe(true);expect(isCheckpointTheme(ultimate)).toBe(true);expect(isCheckpointTheme('theme-indigo')).toBe(false);
});
test('restoration waits for account readiness, then gates locked selections and retains earned selections',()=>{
 const pending=resolveThemeRewards({theme:premium,unlockedThemes:[],level:1,ready:false});expect(pending.theme).toBe(premium);expect(pending.justUnlocked).toBe(false);
 expect(resolveThemeRewards({...pending,level:49,ready:true}).theme).toBe('theme-checkpoint');expect(resolveThemeRewards({...pending,level:50,ready:true}).theme).toBe(premium);
 expect(resolveThemeRewards({theme:'theme-masseffect',unlockedThemes:['theme-masseffect'],level:1,ready:true}).theme).toBe('theme-masseffect');
 expect(resolveThemeRewards({theme:'theme-masseffect',unlockedThemes:[],level:1,ready:true}).theme).toBe('theme-checkpoint');
});
test('multiple milestones earned in one load do not change an available selection and notify once',()=>{
 const earned=resolveThemeRewards({theme:'theme-checkpoint',unlockedThemes:[],level:50,ready:true});expect(earned.unlockedThemes).toHaveLength(25);expect(earned.theme).toBe('theme-checkpoint');expect(earned.newlyUnlocked).toContain(premium);
 expect(resolveThemeRewards({...earned,level:30,ready:true}).justUnlocked).toBe(false);
});
test('all themes unlock only for the authenticated configured owner after loading',()=>{
 const {ownerUid}=require('./accountConfig'),state={theme:'theme-ori',unlockedThemes:[],level:1,ready:true};
 const owner=resolveThemeRewards({...state,accountUid:ownerUid});
 expect(owner.unlockedThemes).toHaveLength(50);expect(owner.theme).toBe('theme-ori');
 ALL_THEME_CATALOG.forEach(theme=>expect(canUseTheme(theme.id,owner.unlockedThemes)).toBe(true));
 expect(resolveThemeRewards({...owner,level:1,ready:true,accountUid:ownerUid}).justUnlocked).toBe(false);
 expect(resolveThemeRewards({...state,accountUid:'other',isOwner:true,displayName:'Créateur'}).unlockedThemes).toEqual([]);
 expect(resolveThemeRewards({...state,accountUid:undefined}).unlockedThemes).toEqual([]);
 expect(resolveThemeRewards({...state,accountUid:'other',level:2}).unlockedThemes).toEqual(['theme-indigo']);
 expect(resolveThemeRewards({...state,accountUid:ownerUid,ready:false}).unlockedThemes).toEqual([]);
});
