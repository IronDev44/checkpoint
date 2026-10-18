import {act,fireEvent,render,screen} from '@testing-library/react';
import ProgressSync,{useProgressSync} from './ProgressSync';
import {syncGamingProgress} from '../services/progressSync';
import {auth} from '../firebase';
jest.mock('../services/progressSync',()=>({syncGamingProgress:jest.fn()}));
jest.mock('../firebase',()=>({auth:{currentUser:{uid:'alice'}}}));
jest.mock('../services/accountConfig',()=>({accountsEnabled:true,d1Enabled:true}));
function Harness({quiz={totalXP:0},restore}){const state=useProgressSync(quiz,{}, {},restore);return <ProgressSync {...state}/>;}
beforeEach(()=>{jest.useFakeTimers();auth.currentUser={uid:'alice'};syncGamingProgress.mockReset();});
afterEach(()=>{jest.useRealTimers();});
const tick=async()=>{await act(async()=>{jest.advanceTimersByTime(500);});};
test('restores canonical server progress and exposes successful synchronization',async()=>{
 const merged={quiz:{totalXP:120},goals:{},trials:{}};syncGamingProgress.mockResolvedValue(merged);const restore=jest.fn();
 render(<Harness restore={restore}/>);await tick();
 expect(restore).toHaveBeenCalledWith(merged);expect(screen.getByText('Progression synchronisée')).toBeVisible();
});
test('offline progress stays local and can be retried explicitly',async()=>{
 syncGamingProgress.mockRejectedValueOnce(new Error('offline')).mockResolvedValueOnce({quiz:{totalXP:120}});
 const restore=jest.fn();render(<Harness quiz={{totalXP:120}} restore={restore}/>);await tick();
 expect(restore).not.toHaveBeenCalled();expect(screen.getByText('Progression gardée sur cet appareil')).toBeVisible();
 fireEvent.click(screen.getByRole('button',{name:'Réessayer la synchronisation'}));await tick();expect(restore).toHaveBeenCalledWith({quiz:{totalXP:120}});
});
test('a response to an older local revision cannot erase a newer reward',async()=>{
 let finish;syncGamingProgress.mockImplementationOnce(()=>new Promise(resolve=>{finish=resolve;})).mockResolvedValueOnce({quiz:{totalXP:270}});
 const restore=jest.fn();const view=render(<Harness restore={restore}/>);await tick();
 view.rerender(<Harness quiz={{totalXP:120}} restore={restore}/>);
 await act(async()=>{finish({quiz:{totalXP:150}});});expect(restore).not.toHaveBeenCalled();
 await tick();expect(restore).toHaveBeenCalledWith({quiz:{totalXP:270}});
});
test('a changed account cannot receive the previous account’s pending data',async()=>{
 render(<Harness restore={jest.fn()}/>);auth.currentUser={uid:'bob'};await tick();expect(syncGamingProgress).not.toHaveBeenCalled();
});
