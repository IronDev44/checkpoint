import {fireEvent,render} from '@testing-library/react';
import {LibrarySection} from './App';
jest.mock('./firebase',()=>({auth:{currentUser:null},db:{}}));
jest.mock('./services/accountData',()=>({accountsEnabled:false,accountStorage:{getItem:()=>null,setItem:()=>{}},collection:jest.fn(),doc:jest.fn()}));
test('shelves regroup all games when their available width changes and keep the last row partly filled',()=>{
 const games=Array.from({length:45},(_,i)=>({id:String(i),name:`Game ${i}`,playedPlatforms:['PC']}));
 let width=252;
 const descriptor=Object.getOwnPropertyDescriptor(HTMLElement.prototype,'clientWidth');
 Object.defineProperty(HTMLElement.prototype,'clientWidth',{configurable:true,get(){return this.classList.contains('shelf3d-level-games')?width:0;}});
 const realStyle=window.getComputedStyle;
 const style=jest.spyOn(window,'getComputedStyle').mockImplementation(el=>el.classList.contains('shelf3d-level-games')?{paddingLeft:'6px',paddingRight:'6px',columnGap:'4px',getPropertyValue:()=> '20px'}:realStyle(el));
 const onOpenDetail=jest.fn();
 let view;
 try{
  view=render(<LibrarySection title="Collection" games={games} libraryCardMode="shelf" setLibraryCardMode={()=>{}} onOpenDetail={onOpenDetail}/>);
  const counts=()=>[...view.container.querySelectorAll('.shelf3d-level-games')].map(row=>row.children.length);
  expect(counts()).toEqual([10,10,10,10,5]);
  width=492;fireEvent(window,new Event('resize'));expect(counts()).toEqual([20,20,5]);
  expect(view.container.querySelectorAll('.shelf3d-case')).toHaveLength(45);
  fireEvent.click(view.container.querySelectorAll('.shelf3d-case')[44]);expect(onOpenDetail).toHaveBeenCalledWith(games[44]);
  width=108;fireEvent(window,new Event('resize'));expect(counts()).toHaveLength(12);
  expect(view.container.querySelectorAll('.shelf3d-case')).toHaveLength(45);
 }finally{view?.unmount();style.mockRestore();if(descriptor)Object.defineProperty(HTMLElement.prototype,'clientWidth',descriptor);else delete HTMLElement.prototype.clientWidth;}
});


test('Recent restores addition order after switching to alphabetical sorting',()=>{
 const games=[{id:'old',name:'A classic',status:'collection',createdAt:'2020-01-01',updatedAt:'2030-01-01'},{id:'new',name:'Z new addition',status:'collection',createdAt:'2026-10-18'}];
 const view=render(<LibrarySection title="Collection" games={games} libraryCardMode="compact" setLibraryCardMode={()=>{}}/>);
 const names=()=>[...view.container.querySelectorAll('.grid-title')].map(el=>el.textContent);
 expect(names()).toEqual(['Z new addition','A classic']);
 fireEvent.click(view.getByRole('button',{name:'A-Z',exact:true}));expect(names()).toEqual(['A classic','Z new addition']);
 fireEvent.click(view.getByRole('button',{name:'Récent',exact:true}));expect(names()).toEqual(['Z new addition','A classic']);
});
