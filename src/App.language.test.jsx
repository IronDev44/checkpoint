import {act,fireEvent,render,screen} from '@testing-library/react';
import {BottomTabs,LibrarySection} from './App';
import {selectLanguage} from './i18n/language';
jest.mock('./firebase',()=>({auth:{currentUser:null},db:{}}));
jest.mock('./services/accountData',()=>({accountsEnabled:false,accountStorage:{getItem:()=>null,setItem:()=>{}},collection:jest.fn(),doc:jest.fn()}));
beforeEach(async()=>{await selectLanguage('fr',{remember:false,explicit:false});});
afterEach(async()=>{await act(async()=>{await selectLanguage('fr',{remember:false,explicit:false});});});

test('translated navigation still selects the original tab IDs',async()=>{
 const choose=jest.fn();render(<BottomTabs activeTab="library" setActiveTab={choose}/>);
 const library=screen.getByRole('button',{name:'Bibliothèque'});
 await act(async()=>{await selectLanguage('en');});
 expect(screen.getByRole('button',{name:'Library'})).toBe(library);
 expect(library).toHaveAttribute('data-tab','library');
 fireEvent.click(screen.getByRole('button',{name:'Arena'}));expect(choose).toHaveBeenCalledWith('arena');
});

test('game names matching UI messages and collection status IDs stay unchanged',async()=>{
 const games=[{id:'one',name:'Accueil',status:'collection',progressStatus:'paused',playedPlatforms:['PC'],rating:8}];
 const view=render(<LibrarySection title="Collection" games={games} libraryCardMode="compact" setLibraryCardMode={()=>{}}/>);
 await act(async()=>{await selectLanguage('en');});
 expect(view.container.querySelector('.grid-title')).toHaveTextContent('Accueil');
 expect(games[0]).toEqual(expect.objectContaining({name:'Accueil',status:'collection',progressStatus:'paused',rating:8}));
 expect(screen.getByRole('combobox',{name:'Sort library'})).toHaveValue('recent');
});
