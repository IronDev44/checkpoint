import {useState} from 'react';
import {fireEvent,render,screen} from '@testing-library/react';
import LibraryBulkEditor from './LibraryBulkEditor';
const games=[{id:'one',name:'Halo'},{id:'two',name:'Portal'}];
function Harness({onApply}){const [active,setActive]=useState(false);return <LibraryBulkEditor games={games} active={active} onActiveChange={setActive} onApply={onApply}/>;}
test('bulk editing requires a selection and an explicit change, and retains only failures for a retry',async()=>{
 const onApply=jest.fn().mockResolvedValue({updated:1,failedIds:['two']});render(<Harness onApply={onApply}/>);
 fireEvent.click(screen.getByRole('button',{name:'Modifier plusieurs jeux'}));
 expect(screen.getByRole('button',{name:'Appliquer à 0 jeu'})).toBeDisabled();
 fireEvent.click(screen.getByRole('button',{name:'Tout sélectionner'}));
 expect(screen.getByRole('button',{name:'Appliquer à 2 jeux'})).toBeDisabled();
 fireEvent.change(screen.getByLabelText('Statut'),{target:{value:'completed'}});
 fireEvent.click(screen.getByRole('button',{name:'Appliquer à 2 jeux'}));
 expect(await screen.findByText(/1 jeu mis à jour. 1 à réessayer/)).toBeVisible();
 expect(onApply).toHaveBeenCalledWith(['one','two'],{status:'completed',platform:'',format:''});
 expect(screen.getByRole('checkbox',{name:'Halo'})).not.toBeChecked();
 expect(screen.getByRole('checkbox',{name:'Portal'})).toBeChecked();
});
