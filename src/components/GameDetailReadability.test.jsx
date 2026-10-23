import {render,screen,fireEvent} from '@testing-library/react';
import {GameDetailModal,HomeTab} from '../App';
import {GameService} from '../services/gameService';

jest.mock('../services/gameService',()=>({GameService:{rawg:jest.fn(async()=>({results:[]})),igdb:jest.fn(async()=>({results:[]}))}}));
beforeEach(()=>{jest.spyOn(window,'scrollTo').mockImplementation(()=>{});});
afterEach(()=>jest.restoreAllMocks());
test('a completed game keeps the essential actions visible and secondary editing folded',()=>{
 const progress=jest.fn();
 render(<GameDetailModal game={{id:'one',name:'Halo',status:'collection',completed:true,rating:8,platformNames:['PC']}} onClose={()=>{}} onSetProgressStatus={progress}/>);
 expect(screen.getByRole('button',{name:'Commencer / reprendre'})).toBeVisible();
 fireEvent.click(screen.getByRole('button',{name:'Déjà terminé'}));
 expect(progress).toHaveBeenCalledWith('one','completed');
 expect(screen.getByText('Notes détaillées par critère')).toBeVisible();
 expect(screen.getByRole('textbox',{name:'Ton avis personnel',hidden:true})).not.toBeVisible();
 fireEvent.click(screen.getByText('Mon avis et son partage'));
 expect(screen.getByRole('textbox',{name:'Ton avis personnel'})).toBeVisible();
 expect(screen.getByRole('button',{name:'Fermer la fiche du jeu'})).toBeVisible();
});
test('the empty home gives a concrete first action without empty personal statistics or activities',()=>{
 render(<HomeTab games={[]} hardware={[]} badges={[]} level={1} totalXP={0} progress={{percent:0,currentXP:0,xpToNext:100}} setActiveTab={()=>{}} onOpenDetail={()=>{}}/>);
 expect(screen.getByRole('button',{name:'Ajouter mon premier jeu'})).toBeVisible();
 expect(screen.queryByText('Ta collection en bref')).toBeNull();
 expect(screen.queryByText('Radar découverte')).toBeNull();
 expect(screen.queryByText('Pulse en attente')).toBeNull();
 expect(screen.queryByRole('button',{name:/Bilan du mois/})).toBeNull();
 expect(GameService.rawg).not.toHaveBeenCalledWith('/games',expect.objectContaining({genres:expect.anything()}));
});
