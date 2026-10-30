import {reportSocialNetworkIssue} from './socialDiagnostics';
import {auth} from '../firebase';
jest.mock('../firebase',()=>({auth:{currentUser:null}}));
const originalFetch=global.fetch;
afterEach(()=>{global.fetch=originalFetch;auth.currentUser=null;});
test('network diagnostics contain only a fixed operation and status, and repeats are throttled',async()=>{
 auth.currentUser={uid:'diagnostic-test',getIdToken:async()=> 'token'};global.fetch=jest.fn().mockResolvedValue({ok:true});
 await reportSocialNetworkIssue('search',Error('A secret message from private-profile'));
 expect(fetch).toHaveBeenCalledTimes(1);expect(JSON.parse(fetch.mock.calls[0][1].body)).toEqual({operation:'search',status:0});
 await reportSocialNetworkIssue('search',Error('again'));expect(fetch).toHaveBeenCalledTimes(1);
 await reportSocialNetworkIssue('friendships',Object.assign(Error('expected failure'),{status:409}));expect(fetch).toHaveBeenCalledTimes(1);
 await reportSocialNetworkIssue('a-private-pseudo',Error('unknown'));expect(fetch).toHaveBeenCalledTimes(1);
});
