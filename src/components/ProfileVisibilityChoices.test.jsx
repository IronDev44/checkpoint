import {render,screen,fireEvent,waitFor,act} from '@testing-library/react';
import ProfileVisibilityChoices from './ProfileVisibilityChoices';
test('waits for a visibility change and prevents competing clicks',async()=>{
 let finish;const change=jest.fn(()=>new Promise(resolve=>{finish=resolve;}));
 const view=render(<ProfileVisibilityChoices value="prive" onChange={change}/>);
 fireEvent.click(screen.getByRole('button',{name:'Public',exact:true}));
 expect(screen.getByRole('button',{name:'Enregistrement…'})).toBeDisabled();
 fireEvent.click(screen.getByRole('button',{name:'Amis uniquement'}));expect(change).toHaveBeenCalledTimes(1);
 expect(screen.getByRole('button',{name:'Privé'})).toHaveAttribute('aria-pressed','true');
 await act(async()=>finish({ok:true}));view.rerender(<ProfileVisibilityChoices value="public" onChange={change}/>);
 expect(screen.getByRole('button',{name:'Public',exact:true})).toHaveAttribute('aria-pressed','true');
});
test('keeps the current visibility after failure and permits retry',async()=>{
 const change=jest.fn().mockResolvedValueOnce({ok:false,message:'Choisis ton identifiant.'}).mockRejectedValueOnce(Error('Hors ligne'));
 render(<ProfileVisibilityChoices value="private" onChange={change}/>);
 fireEvent.click(screen.getByRole('button',{name:'Public',exact:true}));expect(await screen.findByRole('alert')).toHaveTextContent('Choisis ton identifiant.');
 expect(screen.getByRole('button',{name:'Privé'})).toHaveAttribute('aria-pressed','true');
 fireEvent.click(screen.getByRole('button',{name:'Public',exact:true}));await waitFor(()=>expect(screen.getByRole('alert')).toHaveTextContent('Hors ligne'));
});
