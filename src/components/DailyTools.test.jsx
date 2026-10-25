import React from 'react';
import {render,screen,fireEvent,waitFor,within} from '@testing-library/react';
import HomeLayout,{HomeBlock} from './HomeLayout';
import QuickGameActions from './QuickGameActions';
import ImportReview from './ImportReview';
import PersonalSearch from './PersonalSearch';
import FriendComparison from './FriendComparison';
import {normalizeHomeLayout} from '../services/homeLayout';
import {planGameImport} from '../services/importPlan';
import {searchPersonalSpace} from '../services/personalSearch';
const game={id:'one',name:'Portal',rating:8,status:'collection',steamAppId:1};
test('dismissing an activity persists its preference and undo restores it',()=>{
 const changes=jest.fn();function Home(){const [value,setValue]=React.useState({});return <HomeLayout value={value} onChange={next=>{changes(next);setValue(next);}}><HomeBlock id="quiz"><p>Quiz</p></HomeBlock></HomeLayout>;}
 render(<Home/>);fireEvent.click(screen.getByRole('button',{name:'Masquer l’activité : Quiz de la semaine'}));
 expect(changes).toHaveBeenCalledWith(expect.objectContaining({hidden:['quiz']}));expect(screen.queryByRole('button',{name:/Quiz de la semaine.*Ouvrir/})).toBeNull();
 fireEvent.click(screen.getByRole('button',{name:'Annuler',exact:true}));expect(screen.getByRole('button',{name:/Quiz de la semaine.*Ouvrir/})).toBeVisible();
});
test('invalid layout keys cannot hide the level or erase future blocks',()=>{expect(normalizeHomeLayout({order:['quiz','quiz','unknown'],hidden:['level','quiz']})).toMatchObject({hidden:['quiz']});expect(normalizeHomeLayout({order:['quiz']}).order[0]).toBe('quiz');expect(normalizeHomeLayout({order:['quiz']}).order).toContain('collection');});
test('home rearrangement and hiding keeps the level pinned and emits preferences',()=>{
 const onChange=jest.fn();render(<HomeLayout value={{groupActivities:false,order:['quiz','collection'],hidden:['collection']}} onChange={onChange}><h2>Mon niveau</h2><HomeBlock id="collection"><h2>Collection</h2></HomeBlock><HomeBlock id="quiz"><h2>Quiz</h2></HomeBlock></HomeLayout>);
 expect(screen.queryByRole('heading',{name:'Collection'})).toBeNull();expect(screen.getAllByRole('heading').map(e=>e.textContent)).toEqual(['Mon niveau','Quiz']);
 fireEvent.click(screen.getByText('Personnaliser l’accueil'));fireEvent.click(screen.getByLabelText('Ma collection'));expect(onChange).toHaveBeenCalledWith(expect.objectContaining({hidden:[]}));
});
test('quick actions do not open the parent card and wait for the save result',async()=>{
 const parent=jest.fn(),progress=jest.fn(async()=>true),rate=jest.fn(async()=>true);render(<div onClick={parent}><QuickGameActions game={game} rating={8} onProgress={progress} onRate={rate}/></div>);
 fireEvent.click(screen.getByRole('button',{name:'Actions rapides pour Portal'}));fireEvent.click(screen.getByRole('button',{name:'Marquer terminé'}));await waitFor(()=>expect(progress).toHaveBeenCalledWith('one','completed'));await waitFor(()=>expect(screen.queryByRole('dialog')).toBeNull());expect(parent).not.toHaveBeenCalled();
 fireEvent.click(screen.getByRole('button',{name:'Actions rapides pour Portal'}));fireEvent.change(screen.getByLabelText('Ma note / 10'),{target:{value:'9.5'}});fireEvent.click(screen.getByRole('button',{name:'Enregistrer ma note'}));await waitFor(()=>expect(rate).toHaveBeenCalledWith('one',9.5));
});
test('an unsuccessful quick save leaves the controls open',async()=>{
 render(<QuickGameActions game={game} onProgress={async()=>false} onRate={jest.fn()}/>);fireEvent.click(screen.getByRole('button',{name:'Actions rapides pour Portal'}));fireEvent.click(screen.getByRole('button',{name:'Passer en cours'}));expect(await screen.findByRole('alert')).toHaveTextContent('Réessaie');expect(screen.getByRole('dialog')).toBeVisible();
});
test('import matching preserves editions, excludes repeated source IDs and refuses ambiguous merges',()=>{
 const rows=planGameImport([game,{id:'a',name:'Same'},{id:'b',name:'Same'}],[{name:'Portal',steamAppId:1},{name:'Portal',steamAppId:2},{name:'Portal',steamAppId:1},{name:'Same',steamAppId:3},{steamAppId:4}],'steam');
 expect(rows.map(r=>r.type)).toEqual(['update','add','skip','skip','skip']);expect(rows[0].existing).toBe(game);
});
test('review is read only until confirmation and imports only selected eligible rows',async()=>{
 const confirm=jest.fn(async()=>true),close=jest.fn();render(<ImportReview games={[game]} incoming={[{name:'Portal',steamAppId:1},{name:'Halo',steamAppId:2},{name:'Halo',steamAppId:2}]} provider="steam" onConfirm={confirm} onClose={close}/>);
 expect(confirm).not.toHaveBeenCalled();const boxes=screen.getAllByRole('checkbox');expect(boxes[2]).toBeDisabled();fireEvent.click(boxes[0]);fireEvent.click(screen.getByRole('button',{name:'Confirmer l’import'}));await waitFor(()=>expect(confirm).toHaveBeenCalledWith([{name:'Halo',steamAppId:2}]));expect(close).toHaveBeenCalled();
});
test('personal search normalizes accents, searches all categories and keeps IDs scoped by type',()=>{
 const data={games:[{id:'1',name:'Écho',platformNames:['PC']}],hardware:[{id:'1',name:'Écran',brand:'Sony'}],series:[{name:'Halo'}],friends:[{displayName:'Jules',handle:'echo'}]};
 expect(searchPersonalSpace('echo',data).map(r=>r.kind)).toEqual(['games','friends']);expect(searchPersonalSpace('sony',data,'hardware')[0].item.name).toBe('Écran');expect(searchPersonalSpace(' ',data)).toEqual([]);
});
test('personal search opens the chosen local result and can hand off to the catalogue',async()=>{
 const select=jest.fn(async()=>{}),catalog=jest.fn();render(<PersonalSearch games={[game]} hardware={[]} series={[]} friends={[]} onSelect={select} onCatalog={catalog}/>);fireEvent.click(screen.getByRole('button',{name:'Rechercher dans mon espace'}));fireEvent.change(screen.getByLabelText('Jeu, matériel, série ou ami'),{target:{value:'Portal'}});fireEvent.click(within(document.querySelector('.personal-search-results')).getByRole('button'));await waitFor(()=>expect(select).toHaveBeenCalledWith(expect.objectContaining({kind:'games',item:game})));await waitFor(()=>expect(screen.queryByRole('dialog')).toBeNull());
});
test('friend comparison filters disagreements and opens the private matching record',()=>{
 const open=jest.fn();render(<FriendComparison games={[game]} profile={{visibility:'public',displayName:'Jules',favoriteGames:[{name:'Portal',rating:4}]}} onOpenGame={open}/>);fireEvent.click(screen.getByRole('button',{name:'Avis différents'}));expect(screen.getByText('4 point(s) d’écart')).toBeVisible();fireEvent.click(screen.getByRole('button',{name:'Voir ma fiche'}));expect(open).toHaveBeenCalledWith(game);
});

test('title-only import matches require a deliberate selection and non-Latin titles remain eligible',()=>{
 const rows=planGameImport([{id:'old',name:'Portal'}],[{name:'Portal',steamAppId:10},{name:'ゼルダ',steamAppId:11}],'steam');expect(rows[0].needsConfirmation).toBe(true);expect(rows[1].type).toBe('add');
 render(<ImportReview games={[{id:'old',name:'Portal'}]} incoming={[{name:'Portal',steamAppId:10}]} provider="steam" onConfirm={jest.fn()} onClose={jest.fn()}/>);
 expect(screen.getByRole('checkbox')).not.toBeChecked();expect(screen.getByRole('button',{name:'Confirmer l’import'})).toBeDisabled();
});

test('home activities are lazy until opened and the grouping can be disabled',()=>{
 const mounted=jest.fn();function Activity(){mounted();return <h3>Contenu du quiz</h3>;}
 const onChange=jest.fn();render(<HomeLayout onChange={onChange}><h2>Niveau</h2><HomeBlock id="quiz"><Activity/></HomeBlock></HomeLayout>);expect(screen.getByText('Pour toi')).toBeInTheDocument();expect(mounted).not.toHaveBeenCalled();fireEvent.click(screen.getByRole('button',{name:/Quiz de la semaine.*Ouvrir/}));expect(within(screen.getByRole('dialog',{name:'Quiz de la semaine'})).getByText('Contenu du quiz')).toBeVisible();fireEvent.click(screen.getByRole('button',{name:'Fermer',exact:true}));expect(screen.queryByRole('dialog')).toBeNull();fireEvent.click(screen.getByText('Personnaliser l’accueil'));fireEvent.click(screen.getByLabelText('Regrouper les activités dans « Pour toi »'));expect(onChange).toHaveBeenCalledWith(expect.objectContaining({groupActivities:false}));
});

test('opening a game from a home activity closes its overlay before navigating',()=>{
 const navigate=jest.fn();function Activity({onOpen}){return <button onClick={()=>onOpen(game)}>Ouvrir Portal</button>;}
 render(<HomeLayout><HomeBlock id="picker"><Activity onOpen={navigate}/></HomeBlock></HomeLayout>);
 fireEvent.click(screen.getByRole('button',{name:/À quoi je joue.*Ouvrir/}));
 const dialog=screen.getByRole('dialog',{name:'À quoi je joue ?'});
 fireEvent.click(within(dialog).getByRole('button',{name:'Ouvrir Portal'}));
 expect(navigate).toHaveBeenCalledWith(game);expect(screen.queryByRole('dialog')).toBeNull();
});
