import {render,screen,fireEvent,waitFor,within} from '@testing-library/react';
import {GameDetailModal,HomeTab} from '../App';
import {GameService} from '../services/gameService';
import React from 'react';
import {HOME_BLOCKS} from '../services/homeLayout';

jest.mock('../services/gameService',()=>({GameService:{rawg:jest.fn(async()=>({results:[]})),igdb:jest.fn(async()=>({results:[]}))}}));
beforeEach(()=>{jest.spyOn(window,'scrollTo').mockImplementation(()=>{});});
afterEach(()=>jest.restoreAllMocks());
test('dismissing an explained discovery replaces it and keeps a reversible preference',async()=>{
 const candidates=['The Witcher 3: Wild Hunt','Portal 2','Mass Effect 2','BioShock 2','Halo 2'].map((name,i)=>({id:i+100,name,rating:4,ratings_count:500,genres:[{name:'RPG'}]}));
 GameService.rawg.mockResolvedValue({results:candidates});
 const owned=[{id:'one',name:'The Witcher 2: Assassins of Kings',status:'collection',rating:9,genreNames:['RPG']}];
 const updates=jest.fn();function Home(){const [homeLayout,setLayout]=React.useState({hidden:Object.keys(HOME_BLOCKS).filter(id=>id!=='radar')});return <HomeTab games={owned} hardware={[]} badges={[]} level={1} totalXP={0} progress={{percent:0,currentXP:0,xpToNext:100}} setActiveTab={()=>{}} onOpenDetail={()=>{}} dealPreferences={{homeLayout}} onHomeLayoutChange={value=>{updates(value);setLayout(value);}}/>;}
 render(<Home/>);
 fireEvent.click(screen.getByRole('button',{name:/Découvertes.*Ouvrir/}));
 expect(await screen.findByText('Tu as aimé The Witcher 2: Assassins of Kings. Ce jeu appartient aussi à la série The Witcher.')).toBeVisible();
 fireEvent.click(screen.getByRole('button',{name:'Ça ne m’intéresse pas · The Witcher 3: Wild Hunt'}));
 expect(updates).toHaveBeenCalledWith(expect.objectContaining({dismissedGames:['100']}));expect(screen.queryByText('The Witcher 3: Wild Hunt')).toBeNull();expect(screen.getByText('Halo 2')).toBeVisible();
 fireEvent.click(screen.getByRole('button',{name:'Rétablir les suggestions masquées (1)'}));expect(screen.getByText('The Witcher 3: Wild Hunt')).toBeVisible();
});
test('game sheets separate progress, reviews, collection and catalogue information',async()=>{
 const progress=jest.fn().mockResolvedValue(true),navigate=jest.fn();
 const game={id:'one',name:'Halo',status:'collection',completed:true,rating:8,platformNames:['PC']};
 const props={game,onClose:()=>{},onSetProgressStatus:progress,onNavigateGame:navigate,canGoNext:true};
 const view=render(<GameDetailModal {...props}/>);
 expect(screen.getByRole('tab',{name:'Ma partie'})).toHaveAttribute('aria-selected','true');
 expect(screen.queryByRole('slider',{name:'Note'})).toBeNull();
 expect(screen.queryByRole('button',{name:'Supprimer ce jeu'})).toBeNull();
 fireEvent.change(screen.getByLabelText('Ma progression'),{target:{value:'paused'}});
 fireEvent.click(screen.getByRole('button',{name:'Enregistrer ma progression'}));
 await waitFor(()=>expect(progress).toHaveBeenCalledWith('one','paused',''));
 fireEvent.click(screen.getByRole('tab',{name:'Mon avis'}));
 expect(screen.getAllByRole('slider',{name:'Note'}).some(slider=>!slider.closest('details:not([open])'))).toBe(true);
 fireEvent.click(screen.getByText('Mon avis et son partage'));
 fireEvent.change(screen.getByRole('textbox',{name:'Ton avis personnel'}),{target:{value:'Un souvenir à garder.'}});
 fireEvent.click(screen.getByRole('tab',{name:'Collection'}));expect(screen.queryByRole('textbox',{name:'Ton avis personnel'})).toBeNull();
 fireEvent.click(screen.getByRole('tab',{name:'Mon avis'}));expect(screen.getByRole('textbox',{name:'Ton avis personnel'})).toHaveValue('Un souvenir à garder.');
 fireEvent.keyDown(screen.getByRole('tab',{name:'Mon avis'}),{key:'ArrowRight'});
 expect(screen.getByRole('tab',{name:'Collection'})).toHaveAttribute('aria-selected','true');expect(navigate).not.toHaveBeenCalled();
 fireEvent.click(screen.getByText('Retirer ce jeu de Checkpoint'));expect(screen.getByRole('button',{name:'Supprimer ce jeu'})).toBeVisible();
 fireEvent.click(screen.getByRole('tab',{name:'Infos'}));expect(screen.getByText('DLC & Extensions')).toBeVisible();
 view.rerender(<GameDetailModal {...props} game={{...game,id:'two',name:'Portal'}}/>);
 expect(screen.getByRole('tab',{name:'Ma partie'})).toHaveAttribute('aria-selected','true');
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


test('a game without a RAWG link never suggests another franchise title as an extension',()=>{
 GameService.rawg.mockClear();
 render(<GameDetailModal game={{id:'igdb:1',name:'DRAGON BALL: Sparking! ZERO',status:'collection',rawgId:'igdb:1'}} onClose={()=>{}}/>);
 fireEvent.click(screen.getByRole('tab',{name:'Infos'}));
 expect(screen.getByText('Les extensions ne sont pas renseignées pour ce jeu.')).toBeVisible();
 expect(GameService.rawg).not.toHaveBeenCalled();
 expect(screen.getByText('Aucune date enregistrée pour ce jeu.')).toBeVisible();
 expect(within(screen.getByRole('tabpanel',{name:'Infos'})).queryByText('Non renseigné')).toBeNull();
});
test('only explicitly linked additions appear and a failed catalogue request can be retried',async()=>{
 GameService.rawg.mockClear();
 GameService.rawg.mockRejectedValueOnce(new Error('Offline')).mockResolvedValueOnce({results:[{id:20,name:'Extension liée'},{id:20,name:'Extension liée'},{id:10,name:'Jeu parent'}]});
 render(<GameDetailModal game={{id:'one',name:'Jeu parent',status:'collection',rawgId:10}} onClose={()=>{}}/>);
 fireEvent.click(screen.getByRole('tab',{name:'Infos'}));
 expect(await screen.findByText('Impossible de charger les extensions pour le moment.')).toBeVisible();
 fireEvent.click(screen.getByRole('button',{name:'Réessayer'}));
 expect(await screen.findByText('Extension liée')).toBeVisible();
 expect(screen.getAllByText('Extension liée')).toHaveLength(1);
 expect(GameService.rawg).toHaveBeenCalledTimes(2);
 expect(GameService.rawg.mock.calls.every(([path])=>path==='/games/10/additions')).toBe(true);
});


test('the review adapts to the saved progress and never asks for the status again',()=>{
 const game={id:'one',name:'Halo',status:'collection',completed:true,progressStatus:'completed',rating:8};
 const props={game,onClose:()=>{},onSetProgressStatus:jest.fn()};
 const view=render(<GameDetailModal {...props}/>);
 fireEvent.click(screen.getByRole('tab',{name:'Mon avis'}));
 expect(screen.getByText('Note globale')).toBeVisible();
 expect(screen.queryByText('Ton expérience avec ce jeu')).toBeNull();
 expect(screen.queryByRole('combobox',{name:'Ma progression'})).toBeNull();
 view.rerender(<GameDetailModal {...props} game={{...game,completed:false,progressStatus:'paused',ratingExperience:'completed'}}/>);
 expect(screen.getByText('Ressenti général · Avis partiel')).toBeVisible();
 expect(screen.queryByText('Note globale')).toBeNull();
 view.rerender(<GameDetailModal {...props} game={{...game,completed:false,progressStatus:'tried',ratingExperience:'completed'}}/>);
 expect(screen.getByText('Ton ressenti (facultatif)')).toBeVisible();
 expect(screen.queryByText('Notes détaillées par critère')).toBeNull();
 expect(screen.getByText('Mes impressions (facultatif)')).toBeVisible();
});
