import {render,screen,fireEvent,waitFor} from '@testing-library/react';
import QuickCollectionAdd from './QuickCollectionAdd';

beforeEach(()=>jest.spyOn(window,'scrollTo').mockImplementation(()=>{}));
afterEach(()=>jest.restoreAllMocks());
test.each([
 ['Je commence','en cours','in_progress',false],
 ['Déjà terminé','collection','completed',true],
 ['Pour plus tard','collection','not_started',false],
])('the quick choice %s writes the right progress without imposing a rating',async(label,status,progressStatus,completed)=>{
 const save=jest.fn(async()=>true),close=jest.fn();
 render(<QuickCollectionAdd game={{name:'Halo',rawgId:123,rating:0}} onSave={save} onClose={close}/>);
 fireEvent.click(screen.getByRole('button',{name:new RegExp(`^${label}`)}));
 await waitFor(()=>expect(close).toHaveBeenCalledTimes(1));
 expect(save).toHaveBeenCalledWith(expect.objectContaining({name:'Halo',rawgId:123,status,progressStatus,completed,rating:0}));
});
test('failure retains the choice window and allows a retry; cancel never adds a game',async()=>{
 const save=jest.fn().mockResolvedValueOnce(false).mockResolvedValueOnce(true),close=jest.fn();
 render(<QuickCollectionAdd game={{name:'Halo'}} onSave={save} onClose={close}/>);
 fireEvent.click(screen.getByRole('button',{name:/^Je commence/}));
 expect(await screen.findByRole('alert')).toHaveTextContent('Le jeu n’a pas été ajouté');
 expect(close).not.toHaveBeenCalled();
 fireEvent.click(screen.getByRole('button',{name:/^Je commence/}));
 await waitFor(()=>expect(close).toHaveBeenCalledTimes(1));
 expect(save).toHaveBeenCalledTimes(2);
});
test('closing without a choice does not write anything',()=>{
 const save=jest.fn(),close=jest.fn();render(<QuickCollectionAdd game={{name:'Halo'}} onSave={save} onClose={close}/>);
 fireEvent.click(screen.getByRole('button',{name:'Fermer'}));
 expect(save).not.toHaveBeenCalled();expect(close).toHaveBeenCalledTimes(1);
});
