import {render,screen,fireEvent,waitFor,within} from '@testing-library/react';
import '@testing-library/jest-dom';
import {HardwareTab} from './App';
const item={id:'one',type:'controller',catalogId:'sony-controllers',variantId:'sony-playstation-main',versionId:'dualsense',name:'DualSense',parentName:'Manettes PlayStation',variantName:'PlayStation',brand:'Sony',status:'possédé',ratings:{comfort:8},rating:8,review:'Mon avis',favorite:true};
const request={id:'one'};
beforeEach(()=>{window.matchMedia=jest.fn(()=>({matches:false,addEventListener:jest.fn(),removeEventListener:jest.fn()}));jest.spyOn(window,'scrollTo').mockImplementation(()=>{});Element.prototype.scrollIntoView=jest.fn();});
afterEach(()=>jest.restoreAllMocks());
test('a catalog photo selection creates the matching edition with its image, without changing model IDs',async()=>{
 const add=jest.fn(async()=>true);
 render(<HardwareTab hardware={[item]} games={[]} initialHardwareRequest={request} onAddHardware={add}/>);
 fireEvent.click(await screen.findByRole('button',{name:'Ajouter une autre édition'}));
 const dialog=within(screen.getByRole('dialog'));
 fireEvent.click(dialog.getByText(/Couleurs et éditions/));
 fireEvent.click(dialog.getByRole('button',{name:/Cosmic Red Rouge/}));
 fireEvent.click(dialog.getByRole('button',{name:'Ajouter cette édition'}));
 await waitFor(()=>expect(add).toHaveBeenCalledTimes(1));
 expect(add.mock.calls[0][0]).toMatchObject({versionId:'dualsense',catalogId:'sony-controllers',edition:{kind:'standard',name:'Cosmic Red',color:'Rouge',photoId:'dualsense-cosmic-red'},image:'/images/hardware/editions/cutouts/dualsense-cosmic-red.webp',catalogImage:'/images/controllers/dualsense.png',ratings:{}});
});
test('wishlist and historical controller editions remain visible',async()=>{
 render(<HardwareTab hardware={[{...item,status:'wishlist',edition:{kind:'limited',name:'À retrouver',color:'Rose'}},{...item,id:'old',status:'historique',edition:{kind:'standard',color:'Gris'}}]} games={[]} initialHardwareRequest={request} onAddHardware={jest.fn()}/>);
 expect(await screen.findByText('Wishlist manettes')).toBeVisible();
 expect(screen.getByText('Mes anciennes manettes')).toBeVisible();
 expect(screen.getAllByText('Édition limitée · À retrouver · Rose').some(node=>node.classList.contains('hardware-edition-badge'))).toBe(true);
});
test('an existing item can be described as collector without overwriting ratings, status or model IDs',async()=>{
 const update=jest.fn(async()=>true);render(<HardwareTab hardware={[item]} games={[]} initialHardwareRequest={request} onAddHardware={jest.fn()} onUpdateHardwareEdition={update}/>);fireEvent.click(await screen.findByRole('button',{name:'Modifier la couleur / l’édition'}));fireEvent.change(within(screen.getByRole('dialog')).getByLabelText('Type d’édition'),{target:{value:'collector'}});fireEvent.change(screen.getByLabelText(/Couleur \/ coloris/),{target:{value:'Rouge'}});fireEvent.click(screen.getByText('Enregistrer l’édition'));await waitFor(()=>expect(update).toHaveBeenCalledWith('one',{kind:'collector',name:'',color:'Rouge'}));expect(item.review).toBe('Mon avis');expect(item.rating).toBe(8);
});
test('another color creates a distinct item while preserving the technical version and resetting personal ratings',async()=>{
 const add=jest.fn(async()=>true);render(<HardwareTab hardware={[item]} games={[]} initialHardwareRequest={request} onAddHardware={add}/>);fireEvent.click(await screen.findByRole('button',{name:'Ajouter une autre édition'}));fireEvent.change(screen.getByLabelText(/Couleur \/ coloris/),{target:{value:'Bleu'}});fireEvent.click(screen.getByText('Ajouter cette édition'));await waitFor(()=>expect(add).toHaveBeenCalledTimes(1));expect(add.mock.calls[0][0]).toMatchObject({versionId:'dualsense',catalogId:'sony-controllers',edition:{kind:'standard',name:'',color:'Bleu'},ratings:{},rating:0,review:'',favorite:false});expect(add.mock.calls[0][0].id).toBeUndefined();
});
test('adding an identical edition is blocked, while a different color is accepted',async()=>{
 const add=jest.fn(async()=>true);render(<HardwareTab hardware={[{...item,edition:{kind:'standard',color:'Bleu'}}]} games={[]} initialHardwareRequest={request} onAddHardware={add}/>);fireEvent.click(await screen.findByRole('button',{name:'Ajouter une autre édition'}));fireEvent.change(screen.getByLabelText(/Couleur \/ coloris/),{target:{value:' bleu '}});fireEvent.click(screen.getByText('Ajouter cette édition'));expect(await screen.findByRole('alert')).toHaveTextContent('déjà dans ta collection');expect(add).not.toHaveBeenCalled();fireEvent.change(screen.getByLabelText(/Couleur \/ coloris/),{target:{value:'Rouge'}});fireEvent.click(screen.getByText('Ajouter cette édition'));await waitFor(()=>expect(add).toHaveBeenCalledTimes(1));
});
test('multiple colors do not inflate model completion and edition descriptions are visible on cards',()=>{
 render(<HardwareTab hardware={[{...item,id:'console-one',type:'console',catalogId:'ps5',variantId:'ps5-standard',versionId:'ps5-standard-disc',edition:{kind:'collector',name:'Test',color:'Blanc'}},{...item,id:'console-two',type:'console',catalogId:'ps5',variantId:'ps5-standard',versionId:'ps5-standard-disc',edition:{kind:'standard',color:'Noir'}}]} games={[]} onAddHardware={jest.fn()}/>);
 expect(screen.getByText(/^1 \/ \d+ versions$/)).toBeVisible();
 expect(screen.getAllByText('Collector · Test · Blanc')[0]).toBeVisible();
 expect(screen.getAllByText('Noir',{exact:true}).length).toBeGreaterThan(0);
});
