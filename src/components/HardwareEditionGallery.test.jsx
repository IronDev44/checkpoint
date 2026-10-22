import {render,screen,fireEvent,waitFor,within} from '@testing-library/react';
import '@testing-library/jest-dom';
import HardwareEditionEditor from './HardwareEditionEditor';
import HardwareEditionGallery from './HardwareEditionGallery';
const pad={name:'DualSense',type:'controller',catalogId:'sony-controllers',versionId:'dualsense'};
test('the illustrated list changes the preview without writing until explicit save',async()=>{
 const save=jest.fn(async()=>true),close=jest.fn();render(<HardwareEditionEditor item={pad} editing onSave={save} onClose={close}/>);
 fireEvent.click(screen.getByText(/Couleurs et éditions/));
 fireEvent.click(screen.getByRole('button',{name:/Cosmic Red Rouge/}));
 expect(save).not.toHaveBeenCalled();
 expect(screen.getByLabelText(/Nom de l’édition/)).toHaveValue('Cosmic Red');
 expect(screen.getByRole('img',{name:/Cosmic Red.*Rouge/})).toHaveAttribute('src','/images/hardware/editions/cutouts/dualsense-cosmic-red.webp');
 fireEvent.click(screen.getByRole('button',{name:'Enregistrer l’édition'}));
 await waitFor(()=>expect(save).toHaveBeenCalledWith({kind:'standard',name:'Cosmic Red',color:'Rouge',photoId:'dualsense-cosmic-red'},'possédé'));
});

test('a documented collector without a photo is searchable and saves its edition without borrowing a photo',async()=>{
 const save=jest.fn(async()=>true);
 render(<HardwareEditionEditor item={{name:'New Nintendo 3DS XL',type:'console',catalogId:'ds-3ds',versionId:'new-3ds-xl'}} editing onSave={save} onClose={()=>{}}/>);
 fireEvent.click(screen.getByText(/Couleurs et éditions/));
 fireEvent.change(screen.getByLabelText('Rechercher une édition ou une couleur'),{target:{value:'hyrule'}});
 expect(screen.queryByRole('button',{name:/Samus/})).toBeNull();
 const choice=screen.getByRole('button',{name:/Hyrule Edition Or · Photo à compléter/});
 expect(within(choice).queryByRole('img')).toBeNull();
 fireEvent.click(choice);
 expect(choice).toHaveAttribute('aria-pressed','true');
 expect(screen.getByLabelText(/Nom de l’édition/)).toHaveValue('Hyrule Edition');
 expect(screen.getByRole('img',{name:/Hyrule Edition.*Or/})).toHaveAttribute('src','/images/consoles/new-3ds-xl.png');
 fireEvent.click(screen.getByRole('button',{name:'Enregistrer l’édition'}));
 await waitFor(()=>expect(save).toHaveBeenCalledWith({kind:'limited',name:'Hyrule Edition',color:'Or'},'possédé'));
});

test('search handles accents, reports missing matches and disabled choices stay disabled',()=>{
 render(<HardwareEditionGallery item={{type:'console',catalogId:'ds-3ds',versionId:'2ds'}} disabled onChoose={jest.fn()}/>);
 fireEvent.click(screen.getByText(/Couleurs et éditions/));
 fireEvent.change(screen.getByLabelText('Rechercher une édition ou une couleur'),{target:{value:'pokemon'}});
 expect(screen.getByRole('button',{name:/Pokémon Red/})).toBeDisabled();
 fireEvent.change(screen.getByLabelText('Rechercher une édition ou une couleur'),{target:{value:'absent'}});
 expect(screen.getByRole('status')).toHaveTextContent('Aucune édition ne correspond');
 expect(screen.queryAllByRole('button')).toHaveLength(0);
});
test('unknown models disclose the missing photo instead of presenting an unrelated color',()=>{
 render(<HardwareEditionGallery item={{name:'Unknown',type:'console',versionId:'unknown'}} onChoose={jest.fn()}/>);
 expect(screen.getByText(/Pas encore de photos/)).toBeVisible();
 expect(screen.queryByRole('img')).toBeNull();
});

test('archive provenance is disclosed and an older collector remains searchable by title',()=>{
 const choose=jest.fn();
 render(<HardwareEditionGallery item={{type:'console',catalogId:'ps3',versionId:'ps3-slim-320'}} onChoose={choose}/>);
 fireEvent.click(screen.getByText(/Couleurs et éditions/));
 expect(screen.getByText(/archives de collectionneurs/)).toBeVisible();
 fireEvent.change(screen.getByLabelText('Rechercher une édition ou une couleur'),{target:{value:'xillia'}});
 const button=screen.getByRole('button',{name:/Tales of Xillia/});
 expect(within(button).queryByRole('img')).toBeNull();
 fireEvent.click(button);
 expect(choose).toHaveBeenCalledWith(expect.objectContaining({name:'Tales of Xillia',color:'Rouge / Noir / Or'}));
 expect(choose.mock.calls[0][0]).not.toHaveProperty('photoId');
 expect(screen.getByRole('link',{name:/Consolevariations/})).toHaveAttribute('href',expect.stringContaining('/collectibles/'));
});

test('ambiguous families explain why they need a precise model',()=>{
 render(<HardwareEditionGallery item={{type:'console',catalogId:'pc-handhelds',versionId:'aya-neo'}} onChoose={jest.fn()}/>);
 expect(screen.getByText(/AYANEO désigne plusieurs générations/)).toBeVisible();
 expect(screen.queryByRole('button')).toBeNull();
});

test('a confirmed base finish does not claim an exhaustive collector list',()=>{
 render(<HardwareEditionGallery item={{type:'console',catalogId:'apple-mac-gaming',versionId:'mac-mini-m4'}} onChoose={jest.fn()}/>);
 fireEvent.click(screen.getByText(/Couleurs et éditions/));
 expect(screen.getByText(/La finition de base est confirmée/)).toBeVisible();
 expect(screen.getByText(/Les autres coloris et éditions spéciales restent à compléter/)).toBeVisible();
});

test('an archive device photo retains attribution and its exact ID when selected',()=>{
 const choose=jest.fn();
 render(<HardwareEditionGallery item={{type:'controller',catalogId:'sony-controllers',versionId:'dualshock-4'}} onChoose={choose}/>);
 fireEvent.click(screen.getByText(/Couleurs et éditions/));
 fireEvent.change(screen.getByLabelText('Rechercher une édition ou une couleur'),{target:{value:'god of war'}});
 const button=screen.getByRole('button',{name:/God of War/});
 expect(within(button).getByRole('img')).toHaveAttribute('src',expect.stringContaining('/archive/'));
 fireEvent.click(button);
 expect(choose).toHaveBeenCalledWith(expect.objectContaining({name:'God of War',photoId:expect.stringMatching(/^cv-/)}));
 expect(screen.getByRole('link',{name:/Photo : Consolevariations/})).toHaveAttribute('href',expect.stringContaining('/collectibles/'));
});

test('a native transparent front view is labelled as cropped rather than background removal',()=>{
 const choose=jest.fn();
 render(<HardwareEditionGallery item={{type:'controller',catalogId:'8bitdo-controllers',versionId:'8bitdo-m30'}} onChoose={choose}/>);
 fireEvent.click(screen.getByText(/Couleurs et éditions/));
 expect(screen.getAllByRole('link',{name:/Photo : 8BitDo · vue recadrée/})).toHaveLength(2);
 fireEvent.click(screen.getByRole('button',{name:/Black Noir/}));
 expect(choose).toHaveBeenCalledWith({kind:'standard',name:'Black',color:'Noir',photoId:'8bitdo-m30-black'});
});
