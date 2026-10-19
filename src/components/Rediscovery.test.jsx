import React from 'react';
import {render,screen,fireEvent,waitFor} from '@testing-library/react';
import '@testing-library/jest-dom';
import Rediscover from './Rediscover';
import {FavoriteReasonEditor,FavoriteReasons} from './FavoriteReasons';
const game={id:'a',name:'Portal',favorite:true,status:'collection',completed:true,rating:9,completedAt:'2020-01-01'};
test('a personal reason is a draft until saved with an explicit public choice',async()=>{
 const onSave=jest.fn().mockResolvedValue(true);render(<FavoriteReasonEditor game={game} onSave={onSave}/>);fireEvent.change(screen.getByLabelText('Ta phrase pour Portal'),{target:{value:'Pour son humour'}});expect(onSave).not.toHaveBeenCalled();expect(screen.getByLabelText('Afficher cette phrase dans ma vitrine')).not.toBeChecked();fireEvent.click(screen.getByLabelText('Afficher cette phrase dans ma vitrine'));fireEvent.click(screen.getByText('Enregistrer ma phrase'));await waitFor(()=>expect(onSave).toHaveBeenCalledWith('a',{favoriteReason:'Pour son humour',favoriteReasonShared:true}));expect(await screen.findByRole('status')).toHaveTextContent('Phrase enregistrée.');
});
test('failed save retains a draft and permits retry',async()=>{
 const onSave=jest.fn().mockResolvedValueOnce(false).mockResolvedValue(true);render(<FavoriteReasonEditor game={game} onSave={onSave}/>);fireEvent.change(screen.getByLabelText('Ta phrase pour Portal'),{target:{value:'Une belle surprise'}});fireEvent.click(screen.getByText('Enregistrer ma phrase'));expect(await screen.findByRole('status')).toHaveTextContent('Tu peux réessayer');expect(screen.getByLabelText('Ta phrase pour Portal')).toHaveValue('Une belle surprise');fireEvent.click(screen.getByText('Enregistrer ma phrase'));await waitFor(()=>expect(screen.getByRole('status')).toHaveTextContent('Phrase enregistrée.'));
});
test('the public vitrine supports spoiler-safe personal phrases',()=>{
 render(<FavoriteReasons games={[{...game,favoriteReason:'Pour [spoiler]la fin[/spoiler]'}]}/>);expect(screen.getByText('Ses coups de cœur, avec ses mots')).toBeInTheDocument();expect(screen.queryByText('la fin')).not.toBeInTheDocument();fireEvent.click(screen.getByText('Révéler le spoiler'));expect(screen.getByText('la fin')).toBeInTheDocument();
});
test('rediscovery opens the original game, pins explicitly and limits three saved games',async()=>{
 const onOpen=jest.fn(),onPin=jest.fn().mockResolvedValue(true);const view=render(<Rediscover games={[game]} onOpen={onOpen} onPin={onPin}/>);fireEvent.click(screen.getByLabelText('Retrouver Portal'));expect(onOpen).toHaveBeenCalledWith(game);fireEvent.click(screen.getByText('Garder pour rejouer'));await waitFor(()=>expect(onPin).toHaveBeenCalledWith('a',true));
 view.rerender(<Rediscover games={[game,...Array.from({length:3},(_,i)=>({...game,id:String(i),name:`Épinglé ${i}`,rediscoverPinned:true}))]} onPin={onPin}/>);fireEvent.click(screen.getByText('Voir les 4 jeux à redécouvrir'));expect(screen.getByText('Garder pour rejouer')).toBeDisabled();expect(screen.getAllByText('Retirer de ma sélection')).toHaveLength(3);
});
test('a finished game without a date is labeled honestly and an empty collection explains eligibility',()=>{
 const view=render(<Rediscover games={[{...game,completedAt:null}]}/>);expect(screen.getByText('Date de fin non renseignée')).toBeInTheDocument();view.rerender(<Rediscover games={[]}/>);expect(screen.getByText(/Tes jeux terminés, notés au moins 8/)).toBeInTheDocument();
});
