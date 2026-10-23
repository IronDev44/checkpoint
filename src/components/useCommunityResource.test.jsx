import {render,screen,fireEvent,act,waitFor} from '@testing-library/react';
import useCommunityResource from './useCommunityResource';
const pending=()=>{let resolve;const promise=new Promise(r=>{resolve=r;});return {promise,resolve};};
function Probe({request}){const {data,refresh,mutate}=useCommunityResource(request,'items');return <><p>{data.join(',')}</p><button onClick={refresh}>Actualiser</button><button onClick={()=>mutate('save',{id:'a'})}>Sauver</button></>;}
test('a late refresh cannot erase a successful vote',async()=>{
 const old=pending(),request=jest.fn().mockResolvedValueOnce({items:['initial']}).mockReturnValueOnce(old.promise).mockResolvedValueOnce({ok:true}).mockResolvedValue({items:['saved']});
 render(<Probe request={request}/>);await screen.findByText('initial');fireEvent.click(screen.getByText('Actualiser'));fireEvent.click(screen.getByText('Sauver'));await screen.findByText('saved');
 await act(async()=>old.resolve({items:['stale']}));expect(screen.getByText('saved')).toBeVisible();expect(screen.queryByText('stale')).toBeNull();
});
test('a pending write from another account cannot reload the old account into the new view',async()=>{
 const writing=pending(),oldRequest=jest.fn().mockResolvedValueOnce({items:['Alice']}).mockReturnValueOnce(writing.promise),newRequest=jest.fn().mockResolvedValue({items:['Bob']});
 const view=render(<Probe request={oldRequest}/>);await screen.findByText('Alice');fireEvent.click(screen.getByText('Sauver'));view.rerender(<Probe request={newRequest}/>);await screen.findByText('Bob');
 await act(async()=>writing.resolve({ok:true}));await waitFor(()=>expect(oldRequest).toHaveBeenCalledTimes(2));expect(screen.getByText('Bob')).toBeVisible();expect(screen.queryByText('Alice')).toBeNull();
});
