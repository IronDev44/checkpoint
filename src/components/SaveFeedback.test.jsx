import {act,renderHook,waitFor} from '@testing-library/react';
import {useSaveFeedback} from './SaveFeedback';
const deferred=()=>{let resolve;const promise=new Promise(done=>{resolve=done;});return {promise,resolve};};
const operation=extra=>({key:'games:1',isCurrent:()=>true,success:'Enregistré',...extra});

test('pending, successful saves, and undo are exposed only at the right time',async()=>{
 const task=deferred();const undo=jest.fn();const {result}=renderHook(()=>useSaveFeedback());
 let job;act(()=>{job=result.current.run(operation({write:()=>task.promise,undo}));});
 expect(result.current.pending).toBe(1);expect(result.current.receipt).toBeNull();
 await act(async()=>{task.resolve();await job;});
 expect(result.current.pending).toBe(0);expect(result.current.receipt.message).toBe('Enregistré');
 await act(async()=>{await result.current.undo();});expect(undo).toHaveBeenCalledTimes(1);
});

test('writes to a document stay ordered, while other documents can save independently',async()=>{
 const first=deferred();const calls=[];const {result}=renderHook(()=>useSaveFeedback());
 let jobs;act(()=>{jobs=[result.current.run(operation({write:()=>{calls.push('first');return first.promise;}})),result.current.run(operation({write:async()=>{calls.push('second');}})),result.current.run(operation({key:'hardware:1',write:async()=>{calls.push('hardware');}}))];});
 await waitFor(()=>expect(calls).toEqual(['first','hardware']));
 await act(async()=>{first.resolve();await Promise.all(jobs);});expect(calls).toEqual(['first','hardware','second']);
});

test('a failed edit can be retried, but a superseded edit cannot overwrite a newer choice',async()=>{
 const write=jest.fn().mockRejectedValueOnce(new Error('offline')).mockResolvedValue(undefined);
 let current=true;const {result}=renderHook(()=>useSaveFeedback());
 await act(async()=>{await result.current.run(operation({write,isCurrent:()=>current}));});
 expect(result.current.failures).toHaveLength(1);
 act(()=>{result.current.retry();});await waitFor(()=>expect(result.current.failures).toHaveLength(0));
 expect(write).toHaveBeenCalledTimes(2);
 write.mockRejectedValueOnce(new Error('offline'));
 await act(async()=>{await result.current.run(operation({write,isCurrent:()=>current}));});
 current=false;act(()=>{result.current.retry();});expect(write).toHaveBeenCalledTimes(3);
});

test('queued writes are cancelled when their account component unmounts',async()=>{
 const first=deferred();const next=jest.fn();const {result,unmount}=renderHook(()=>useSaveFeedback());
 let jobs;act(()=>{jobs=[result.current.run(operation({write:()=>first.promise})),result.current.run(operation({write:next}))];});
 await act(async()=>{await Promise.resolve();});unmount();first.resolve();await Promise.all(jobs);expect(next).not.toHaveBeenCalled();
});

test('queued acknowledgements reach inline editors instead of pretending to be synchronized',async()=>{
 const {result}=renderHook(()=>useSaveFeedback());let acknowledgement;await act(async()=>{acknowledgement=await result.current.run(operation({write:async()=>({queued:true})}));});expect(acknowledgement).toEqual({queued:true});expect(result.current.receipt.message).toContain('synchronisation en attente');
});
test('a background preference save does not erase the previous undo action',async()=>{
 const undo=jest.fn();const {result}=renderHook(()=>useSaveFeedback());await act(async()=>{await result.current.run(operation({write:async()=>{},undo}));});await act(async()=>{await result.current.run(operation({key:'settings',quiet:true,write:async()=>{}}));});expect(result.current.receipt.undo).toBe(undo);
});
