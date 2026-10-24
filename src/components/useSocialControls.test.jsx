import {renderHook,act,waitFor} from '@testing-library/react';
import useSocialControls from './useSocialControls';
import {socialControlsRequest} from '../services/friendships';
jest.mock('../services/friendships',()=>({socialControlsRequest:jest.fn()}));
beforeEach(()=>socialControlsRequest.mockReset());
test('a focus event during a save cannot overwrite the saved controls or leave them locked',async()=>{
 let finish;const initial={preferences:{invitations:true},blocked:[]},saved={preferences:{invitations:false},blocked:[]};
 socialControlsRequest.mockResolvedValueOnce(initial).mockImplementationOnce(()=>new Promise(resolve=>{finish=resolve;}));
 const {result}=renderHook(()=>useSocialControls({accountUid:'alice',enabled:true,onBlocked:jest.fn()}));
 await waitFor(()=>expect(result.current.data).toEqual(initial));
 let task;act(()=>{task=result.current.act('preferences',{preferences:{invitations:false}});});
 act(()=>window.dispatchEvent(new Event('focus')));
 expect(socialControlsRequest).toHaveBeenCalledTimes(2);
 await act(async()=>{finish(saved);await task;});
 expect(result.current.data).toEqual(saved);expect(result.current.busy).toBe(false);
});
