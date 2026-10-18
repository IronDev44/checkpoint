import {fireEvent, render, screen, within} from '@testing-library/react';
import {TabTutorialEntry, TutorialLibrary, TutorialDialog} from './TabTutorials';
import {TAB_TUTORIALS} from '../data/tabTutorials';

const mockStore = new Map();
jest.mock('../services/accountData',()=>({accountStorage:{getItem:key=>mockStore.get(key) ?? null,setItem:(key,value)=>mockStore.set(key,value)}}));
beforeEach(()=>{mockStore.clear();});

test('the first visit opens the guide automatically and later visits have no tutorial controls',()=>{
 const view=render(<TabTutorialEntry tab="hardware"/>);
 expect(screen.getByRole('dialog')).toHaveTextContent('Trouver le bon modèle');
 fireEvent.click(screen.getByRole('button',{name:'Fermer le tutoriel'}));
 expect(view.container).toBeEmptyDOMElement();
 view.unmount();render(<TabTutorialEntry tab="hardware"/>);
 expect(screen.queryByRole('dialog')).toBeNull();
 expect(screen.queryByRole('button')).toBeNull();
});

test('a guide can be completed, replayed from the start, and closed without losing completion',()=>{
 render(<TabTutorialEntry tab="search"/>);
 expect(screen.getByRole('heading',{name:'Retrouver un titre'})).toHaveFocus();
 expect(document.body.style.overflow).toBe('hidden');
 expect(screen.getByRole('button',{name:'Précédent'})).toBeDisabled();
 fireEvent.click(screen.getByRole('button',{name:'Suivant'}));
 expect(screen.getByRole('heading',{name:'Affiner les résultats'})).toHaveFocus();
 fireEvent.click(screen.getByRole('button',{name:'Précédent'}));
 expect(screen.queryByText(/Tu peux revoir ce tutoriel/)).toBeNull();
 for(let i=0;i<3;i++)fireEvent.click(screen.getByRole('button',{name:'Suivant'}));
 expect(screen.getByText(/Tu peux revoir ce tutoriel quand tu veux dans Options/)).toBeVisible();
 fireEvent.click(screen.getByRole('button',{name:'J’ai compris'}));
 expect(JSON.parse(mockStore.get('checkpoint-tab-tutorials-v1')).search).toBe('completed');
 expect(document.body.style.overflow).toBe('');
 render(<TutorialLibrary/>);
 fireEvent.click(screen.getByRole('button',{name:/^Recherche .*Revoir le guide/}));
 expect(screen.getByRole('dialog')).toHaveTextContent('Étape 1 sur 4');
 fireEvent.keyDown(screen.getByRole('dialog'),{key:'Escape'});
 expect(screen.queryByRole('dialog')).toBeNull();
 expect(JSON.parse(mockStore.get('checkpoint-tab-tutorials-v1')).search).toBe('completed');
});

test('the help library opens every tab guide and marks completed guides for replay',()=>{
 mockStore.set('checkpoint-tab-tutorials-v1',JSON.stringify({home:'completed'}));
 render(<TutorialLibrary/>);
 const buttons=[...document.querySelectorAll('.tab-tutorial-choice')];
 expect(buttons).toHaveLength(14);
 expect(buttons[0]).toHaveTextContent('Revoir le guide');
 for(const [index,guide] of Object.values(TAB_TUTORIALS).entries()){
  fireEvent.click(buttons[index]);
  expect(within(screen.getByRole('dialog')).getByRole('heading',{name:guide.steps[0].title})).toBeVisible();
  fireEvent.click(screen.getByRole('button',{name:'Fermer le tutoriel'}));
 }
});

test('focus stays inside the guide and background scrolling is restored when it unmounts',()=>{
 const view=render(<TutorialDialog tab="series" onClose={()=>{}}/>);
 const last=screen.getByRole('button',{name:'Suivant'});last.focus();
 fireEvent.keyDown(last,{key:'Tab'});
 expect(screen.getByRole('button',{name:'Fermer le tutoriel'})).toHaveFocus();
 fireEvent.keyDown(document.activeElement,{key:'Tab',shiftKey:true});expect(last).toHaveFocus();
 view.unmount();expect(document.body.style.overflow).toBe('');
});

test('invalid saved preferences do not block the tutorials',()=>{
 mockStore.set('checkpoint-tab-tutorials-v1','broken json');
 render(<TabTutorialEntry tab="profile"/>);
 expect(screen.getByRole('dialog')).toHaveTextContent('Ton parcours de joueur');
});

test('the guide waits until the intro and welcome tour are finished',()=>{
 const view=render(<TabTutorialEntry tab="home" enabled={false}/>);
 expect(screen.queryByRole('dialog')).toBeNull();expect(mockStore.size).toBe(0);
 view.rerender(<TabTutorialEntry tab="home" enabled/>);
 expect(screen.getByRole('dialog')).toHaveTextContent('Ton point de départ');
 expect(JSON.parse(mockStore.get('checkpoint-tab-tutorials-v1')).home).toBe('dismissed');
});

test('visiting another tab opens its own guide without reopening the previous one',()=>{
 const view=render(<TabTutorialEntry key="search" tab="search"/>);
 fireEvent.click(screen.getByRole('button',{name:'Fermer le tutoriel'}));
 view.rerender(<TabTutorialEntry key="hardware" tab="hardware"/>);
 expect(screen.getByRole('dialog')).toHaveTextContent('Trouver le bon modèle');
 fireEvent.click(screen.getByRole('button',{name:'Fermer le tutoriel'}));
 view.rerender(<TabTutorialEntry key="search" tab="search"/>);
 expect(screen.queryByRole('dialog')).toBeNull();
});
