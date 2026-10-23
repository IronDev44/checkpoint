import {render,screen,fireEvent,waitFor,act} from '@testing-library/react';
import PhysicalGameScanner from './PhysicalGameScanner';
const code='045496590420',zelda={id:1,name:'The Legend of Zelda: Breath of the Wild',platformNames:['Nintendo Switch']};
const search=jest.fn(),lookup=jest.fn();
beforeEach(()=>{search.mockReset().mockResolvedValue({results:[zelda]});lookup.mockReset().mockResolvedValue({items:[{title:`${zelda.name} (Nintendo Switch)`}],source:'UPCitemdb'});jest.spyOn(window,'scrollTo').mockImplementation(()=>{});});
afterEach(()=>jest.restoreAllMocks());
const identify=async()=>{fireEvent.change(screen.getByLabelText('Code-barres'),{target:{value:code}});fireEvent.click(screen.getByRole('button',{name:'Identifier la boîte'}));fireEvent.click(await screen.findByRole('button',{name:/The Legend of Zelda: Breath of the Wild Nintendo Switch/}));};
test('scan identification requires title and edition confirmation before saving a physical copy',async()=>{
 const onSave=jest.fn().mockResolvedValue(true),close=jest.fn();render(<PhysicalGameScanner games={[]} onSave={onSave} onClose={close} lookup={lookup} search={search}/>);await identify();expect(onSave).not.toHaveBeenCalled();fireEvent.change(screen.getByLabelText('Édition · facultatif'),{target:{value:'Collector'}});fireEvent.click(screen.getByRole('button',{name:'Ajouter ce jeu physique'}));await waitFor(()=>expect(close).toHaveBeenCalled());expect(onSave).toHaveBeenCalledWith({game:zelda,targetId:undefined,physical:expect.objectContaining({physicalBarcode:code,physicalPlatform:'Nintendo Switch',physicalEdition:'Collector',physicalOwned:true})});
});
test('an existing game must be selected explicitly and only the physical fields are saved',async()=>{
 const existing={...zelda,id:'owned',rating:9,review:'Mon avis',completed:true},save=jest.fn().mockResolvedValue(true);render(<PhysicalGameScanner games={[existing]} onSave={save} onClose={()=>{}} lookup={lookup} search={search}/>);await identify();expect(screen.getByRole('button',{name:'Ajouter ce jeu physique'})).toBeDisabled();fireEvent.change(screen.getByLabelText('Fiche dans ma bibliothèque'),{target:{value:'owned'}});fireEvent.click(screen.getByRole('button',{name:'Associer cette boîte à ma fiche'}));await waitFor(()=>expect(save).toHaveBeenCalled());const payload=save.mock.calls[0][0];expect(payload.targetId).toBe('owned');expect(payload.physical.rating).toBeUndefined();expect(existing.review).toBe('Mon avis');
});
test('known barcodes bypass the provider and an existing physical edition cannot be replaced accidentally',async()=>{
 const existing={...zelda,id:'owned',physicalBarcode:code,physicalOwned:true},save=jest.fn();render(<PhysicalGameScanner games={[existing]} onSave={save} onClose={()=>{}} onOpenGame={()=>{}} lookup={lookup} search={search}/>);await identify();expect(lookup).not.toHaveBeenCalled();expect(screen.getByRole('button',{name:'Ouvrir cette fiche'})).toBeVisible();expect(screen.queryByRole('button',{name:'Associer cette boîte à ma fiche'})).toBeNull();expect(save).not.toHaveBeenCalled();
});
test('provider failure leaves manual title search usable without inventing a barcode match',async()=>{
 lookup.mockRejectedValue(new Error('Catalogue indisponible'));render(<PhysicalGameScanner games={[]} onSave={()=>{}} onClose={()=>{}} lookup={lookup} search={search}/>);fireEvent.change(screen.getByLabelText('Code-barres'),{target:{value:code}});fireEvent.click(screen.getByRole('button',{name:'Identifier la boîte'}));expect(await screen.findByRole('alert')).toHaveTextContent('Catalogue indisponible');fireEvent.change(screen.getByLabelText('Rechercher le jeu par son nom'),{target:{value:'Zelda'}});fireEvent.click(screen.getByRole('button',{name:'Rechercher le jeu'}));expect(await screen.findByRole('button',{name:/The Legend of Zelda/})).toBeVisible();
});
test('stopping the camera while its module starts also stops a late arriving stream',async()=>{
 const descriptor=Object.getOwnPropertyDescriptor(navigator,'mediaDevices');Object.defineProperty(navigator,'mediaDevices',{configurable:true,value:{getUserMedia:jest.fn()}});
 let finish;const started=new Promise(resolve=>{finish=resolve;}),stop=jest.fn();
 try{
  render(<PhysicalGameScanner onSave={()=>{}} onClose={()=>{}} lookup={lookup} search={search} startCamera={jest.fn(()=>started)}/>);
  fireEvent.click(screen.getByRole('button',{name:'Activer la caméra'}));fireEvent.click(screen.getByRole('button',{name:'Arrêter la caméra'}));
  await act(async()=>finish({stop,ready:Promise.resolve()}));expect(stop).toHaveBeenCalled();expect(lookup).not.toHaveBeenCalled();expect(screen.getByRole('button',{name:'Activer la caméra'})).toBeVisible();
 }finally{if(descriptor)Object.defineProperty(navigator,'mediaDevices',descriptor);else delete navigator.mediaDevices;}
});
