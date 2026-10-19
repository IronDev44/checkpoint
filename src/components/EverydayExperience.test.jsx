import {render,screen,fireEvent} from '@testing-library/react';
import {FirstSteps,ProfileSection} from './EverydayExperience';

test('first steps lead from adding a game to its platform and review, without forcing completion',()=>{
 const search=jest.fn(),open=jest.fn();const game={id:'1',name:'Halo',status:'collection'};
 const view=render(<FirstSteps onSearch={search} onOpenGame={open}/>);
 fireEvent.click(screen.getByRole('button',{name:'Ajouter mon premier jeu'}));expect(search).toHaveBeenCalledTimes(1);
 view.rerender(<FirstSteps games={[game]} onSearch={search} onOpenGame={open}/>);
 fireEvent.click(screen.getByRole('button',{name:'Choisir ma plateforme'}));expect(open).toHaveBeenCalledWith(game);
 view.rerender(<FirstSteps games={[{...game,playedPlatforms:['PC']}]} onOpenGame={open}/>);
 expect(screen.getByRole('button',{name:'Donner mon premier avis'})).toBeVisible();
 view.rerender(<FirstSteps games={[{...game,playedPlatforms:['PC'],rating:7}]} onOpenGame={open}/>);
 expect(view.container).toBeEmptyDOMElement();
});

test('profile sections keep their content accessible without loading it until opened',()=>{
 const view=render(<ProfileSection title="Mes statistiques" summary="Mon parcours"><p>Détail des jeux</p></ProfileSection>);
 const toggle=screen.getByRole('button',{name:/Mes statistiques/});expect(toggle).toHaveAttribute('aria-expanded','false');expect(screen.queryByText('Détail des jeux')).toBeNull();
 fireEvent.click(toggle);expect(screen.getByText('Détail des jeux')).toBeVisible();fireEvent.click(toggle);expect(screen.queryByText('Détail des jeux')).toBeNull();
});
