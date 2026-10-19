import {publicProfileView} from './publicProfilePrivacy';
import {diffPrivateSettings} from './privateSettings';
const profile={displayName:'Alex',visibility:'public',ownerUid:'alice',privateSecret:'nope',publicSections:{photos:false,essential:false,identityGames:false,hardware:false,activity:false},setupPhotos:[{src:'PHOTO_SECRET'}],collectionPhotos:[{src:'COLLECTION_SECRET'}],identityGames:[{name:'FOUNDER_SECRET'}],identityTitle:{title:'FOUNDER_SECRET'},favoriteGames:[{name:'FAVORITE_SECRET'}],currentHardware:[{name:'HARDWARE_SECRET'}],showcase:{hardwareHighlights:[{name:'SETUP_SECRET'}]},gamingTimeline:[{type:'hardware',title:'TIMELINE_SECRET'}],recentActivity:[{title:'ACTIVITY_SECRET'}],playerAnalysis:{description:'ANALYSIS_SECRET'}};
test('hidden sections and undeclared private fields are absent, not just hidden in CSS',()=>{
 const result=publicProfileView(profile);const text=JSON.stringify(result);expect(text).not.toContain('SECRET');expect(text).not.toContain('privateSecret');expect(result.displayName).toBe('Alex');expect(result.publicSections.activity).toBe(false);
});
test('authoritative privacy flags cannot be expanded by a stale public copy',()=>{const result=publicProfileView({...profile,publicSections:{}},{publicSections:profile.publicSections});expect(JSON.stringify(result)).not.toContain('SECRET');});
test('hardware cannot leak through a showcase, timeline or activity when its section is disabled',()=>{
 const result=publicProfileView({...profile,publicSections:{hardware:false,essential:true},gamingTimeline:[{type:'hardware',title:'HARDWARE_SECRET'},{type:'goty',title:'Public game'}],recentActivity:[{type:'Matériel noté',title:'HARDWARE_SECRET'},{type:'Note',title:'Public review'}]});expect(JSON.stringify(result)).not.toContain('HARDWARE_SECRET');expect(result.recentActivity).toHaveLength(1);expect(result.gamingTimeline).toHaveLength(1);expect(result.showcase.hardwareHighlights).toEqual([]);
});
test('settings write only the changed leaf fields and preserve other-device choices',()=>{
 const before={appOptions:{homeLayout:{hidden:[]},notifications:{polls:true,monthly:true}},socialProfile:{bio:'old',publicSections:{photos:true}}};
 const after={...before,appOptions:{...before.appOptions,notifications:{...before.appOptions.notifications,polls:false}},updatedAt:'new'};
 expect(diffPrivateSettings(before,after)).toEqual({'appOptions.notifications.polls':false});expect(before.appOptions.notifications.polls).toBe(true);
});
