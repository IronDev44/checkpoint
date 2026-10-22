import {render,screen,fireEvent,waitFor} from '@testing-library/react';
import '@testing-library/jest-dom';
import HardwareEditionEditor from './HardwareEditionEditor';
test('saves bounded edition fields and status atomically without changing the technical model',async()=>{
 const save=jest.fn(async()=>true),close=jest.fn();render(<HardwareEditionEditor item={{name:'DualSense'}} onSave={save} onClose={close}/>);fireEvent.change(screen.getByLabelText('Type d’édition'),{target:{value:'collector'}});fireEvent.change(screen.getByLabelText(/Nom de l’édition/),{target:{value:'  Édition test  '}});fireEvent.change(screen.getByLabelText(/Couleur \/ coloris/),{target:{value:'Doré'}});fireEvent.change(screen.getByLabelText('Statut'),{target:{value:'wishlist'}});fireEvent.click(screen.getByRole('button',{name:'Ajouter cette édition'}));await waitFor(()=>expect(close).toHaveBeenCalledTimes(1));expect(save).toHaveBeenCalledWith({kind:'collector',name:'Édition test',color:'Doré'},'wishlist');
});
test('save failure keeps the form and data; editing does not silently change the status',async()=>{
 const save=jest.fn(async()=>false),close=jest.fn();render(<HardwareEditionEditor item={{name:'DualSense',status:'vendu',edition:{kind:'limited',color:'Bleu'}}} editing onSave={save} onClose={close}/>);expect(screen.queryByLabelText('Statut')).toBeNull();fireEvent.click(screen.getByRole('button',{name:'Enregistrer l’édition'}));expect(await screen.findByRole('alert')).toHaveTextContent('L’enregistrement n’a pas abouti');expect(close).not.toHaveBeenCalled();expect(screen.getByLabelText(/Couleur \/ coloris/)).toHaveValue('Bleu');
});
