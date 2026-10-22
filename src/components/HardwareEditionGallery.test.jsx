import {render,screen,fireEvent,waitFor} from '@testing-library/react';
import '@testing-library/jest-dom';
import HardwareEditionEditor from './HardwareEditionEditor';
import HardwareEditionGallery from './HardwareEditionGallery';
const pad={name:'DualSense',type:'controller',catalogId:'sony-controllers',versionId:'dualsense'};
test('the illustrated list changes the preview without writing until explicit save',async()=>{
 const save=jest.fn(async()=>true),close=jest.fn();render(<HardwareEditionEditor item={pad} editing onSave={save} onClose={close}/>);
 fireEvent.click(screen.getByText(/Voir les versions en photo/));
 fireEvent.click(screen.getByRole('button',{name:/Cosmic Red Rouge/}));
 expect(save).not.toHaveBeenCalled();
 expect(screen.getByLabelText(/Nom de l’édition/)).toHaveValue('Cosmic Red');
 expect(document.querySelector('.hardware-edition-photo-preview img')).toHaveAttribute('src','/images/hardware/editions/dualsense-cosmic-red.webp');
 fireEvent.click(screen.getByRole('button',{name:'Enregistrer l’édition'}));
 await waitFor(()=>expect(save).toHaveBeenCalledWith({kind:'standard',name:'Cosmic Red',color:'Rouge',photoId:'dualsense-cosmic-red'},'possédé'));
});
test('unknown models disclose the missing photo instead of presenting an unrelated color',()=>{
 render(<HardwareEditionGallery item={{name:'Unknown',type:'console',versionId:'unknown'}} onChoose={jest.fn()}/>);
 expect(screen.getByText(/Pas encore de photos/)).toBeVisible();
 expect(screen.queryByRole('img')).toBeNull();
});
