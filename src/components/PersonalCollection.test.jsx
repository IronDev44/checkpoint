import React,{useState} from 'react';
import {render,screen,fireEvent,within} from '@testing-library/react';
import PersonalLists from './PersonalLists';
import ContentPreferences from './ContentPreferences';
import GameJourneyEditor from './GameJourneyEditor';
const games=[{id:'a',name:'Halo',image:'/test.png'},{id:'b',name:'Portal'}];
test('create, fill, order, rename and undo removal of a private list without modifying games',()=>{
 const onOpen=jest.fn();function Fixture(){const [value,setValue]=useState([]);return <PersonalLists value={value} games={games} onChange={setValue} onOpen={onOpen}/>;}render(<Fixture/>);
 fireEvent.change(screen.getByLabelText('Nom de la nouvelle liste'),{target:{value:'À faire en coop'}});fireEvent.click(screen.getByText('Créer une liste'));
 fireEvent.change(screen.getByPlaceholderText('Rechercher un jeu dans ma bibliothèque'),{target:{value:'Halo'}});fireEvent.click(screen.getByText('Halo · Ajouter'));expect(screen.getByText('Halo · Ajouté')).toBeDisabled();
 fireEvent.change(screen.getByPlaceholderText('Rechercher un jeu dans ma bibliothèque'),{target:{value:'Portal'}});fireEvent.click(screen.getByText('Portal · Ajouter'));fireEvent.click(screen.getByLabelText('Monter Portal'));
 expect(within(screen.getByRole('list')).getAllByRole('listitem')[0]).toHaveTextContent('Portal');
 fireEvent.change(screen.getByLabelText('Nom de la liste'),{target:{value:'Vacances ensemble'}});fireEvent.click(screen.getByText('Renommer la liste'));expect(screen.getByRole('heading',{name:'Vacances ensemble'})).toBeInTheDocument();
 fireEvent.change(screen.getByLabelText('Couverture'),{target:{value:'a'}});fireEvent.click(screen.getByLabelText('Retirer Halo de la liste'));expect(screen.getByLabelText('Couverture')).toHaveValue('');
 fireEvent.click(screen.getByText('Supprimer cette liste'));fireEvent.click(screen.getByText('Annuler la suppression'));fireEvent.click(screen.getByRole('button',{name:/Vacances ensemble/}));fireEvent.click(screen.getByText('Portal'));expect(onOpen).toHaveBeenCalledWith(games[1]);expect(games).toEqual([{id:'a',name:'Halo',image:'/test.png'},{id:'b',name:'Portal'}]);
});
test('content choices preserve home layout order and keep access to options',()=>{
 const onChange=jest.fn();render(<ContentPreferences value={{homeLayout:{order:['quiz','collection'],hidden:[]}}} onChange={onChange}/>);
 fireEvent.click(screen.getByText('Préférences de contenu'));expect(screen.getByRole('checkbox',{name:/Options/})).toBeDisabled();fireEvent.click(screen.getByRole('checkbox',{name:'Social',exact:true}));expect(onChange).toHaveBeenCalledWith('hiddenTabs',['social']);fireEvent.click(screen.getByRole('checkbox',{name:'Quiz de la semaine'}));expect(onChange).toHaveBeenCalledWith('homeLayout',expect.objectContaining({order:expect.arrayContaining(['quiz','collection']),hidden:['quiz']}));
});
test('private stop note is optional, saved with selected state and failures remain editable',async()=>{
 const onSave=jest.fn().mockResolvedValue(false);render(<GameJourneyEditor game={{id:'a',status:'en cours',progressStatus:'in_progress'}} onSave={onSave}/>);fireEvent.change(screen.getByLabelText('Ma progression'),{target:{value:'abandoned'}});fireEvent.change(screen.getByRole('textbox'),{target:{value:'Trop difficile pour moi'}});fireEvent.click(screen.getByText('Enregistrer ma progression'));expect(await screen.findByText('Modification non enregistrée. Réessaie.')).toBeInTheDocument();expect(onSave).toHaveBeenCalledWith('a','abandoned','Trop difficile pour moi');expect(screen.getByRole('textbox')).toHaveValue('Trop difficile pour moi');
});
