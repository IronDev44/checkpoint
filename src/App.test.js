import {render,screen,fireEvent} from '@testing-library/react';
import {PublicProfilePreview,LibrarySection} from './App';

test('the public preview does not reveal disabled sections through its hero or secondary blocks',()=>{
 const hidden={photos:false,essential:false,identityGames:false,hardware:false,activity:false};
 render(<PublicProfilePreview profile={{displayName:'Alex',visibility:'public',publicSections:hidden,setupPhotos:[{src:'HIDDEN_PHOTO'}],identityGames:[{id:'one',name:'HIDDEN_FOUNDER',image:'HIDDEN_COVER'}],favoriteGames:[{id:'two',name:'HIDDEN_FAVORITE',favoriteReason:'HIDDEN_REASON'}],sanctuaryGames:[{name:'HIDDEN_SANCTUARY'}],currentHardware:[{name:'HIDDEN_HARDWARE'}],gamingTimeline:[{type:'hardware',title:'HIDDEN_TIMELINE'}],playerAnalysis:{summary:'HIDDEN_ANALYSIS'},recentActivity:[{text:'HIDDEN_ACTIVITY'}]}}/>);
 expect(screen.getAllByRole('heading',{name:'Alex'})[0]).toBeInTheDocument();expect(document.body.innerHTML).not.toContain('HIDDEN_');
});

test('large libraries render progressively while filtering and sorting the entire collection',()=>{
 const games=Array.from({length:120},(_,index)=>({id:String(index),name:`Game ${String(index).padStart(3,'0')}`,status:'collection',rating:8,image:'/checkpoint-icon-192.png',createdAt:new Date(2020,0,index+1).toISOString()}));
 const view=render(<LibrarySection title="Collection" games={games} libraryCardMode="compact" setLibraryCardMode={jest.fn()} onToggleFavorite={jest.fn()} onOpenDetail={jest.fn()}/>);expect(view.container.querySelectorAll('.game-grid-item')).toHaveLength(48);expect(screen.getByText('120 jeux')).toBeInTheDocument();fireEvent.click(screen.getByText('Afficher les jeux suivants'));expect(view.container.querySelectorAll('.game-grid-item')).toHaveLength(96);fireEvent.change(screen.getByRole('combobox',{name:'Trier la bibliothèque'}),{target:{value:'alphabetical'}});expect(view.container.querySelectorAll('.game-grid-item')).toHaveLength(48);expect(view.container.querySelector('.game-grid-item')).toHaveTextContent('Game 000');
});
