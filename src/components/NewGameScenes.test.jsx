import React from 'react';
import {render,screen,fireEvent} from '@testing-library/react';
import {NEW_GAME_THEMES} from '../data/newGameThemes';
import {GameUniverseIntro,GameUniverseTransition} from './GameUniverseEffects';
import {readStartupAppearance} from '../services/startupAppearance';
test.each(NEW_GAME_THEMES)('$label has a distinct intro, transition and lighter scene, and restores on launch',config=>{
 const close=jest.fn(),view=render(<GameUniverseIntro theme={config.id} progress={45} onRequestClose={close}/>);
 expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow','45');expect(document.querySelector('.ng-intro svg')).not.toBeNull();const intro=document.querySelector('.ng-scene').innerHTML;
 fireEvent.click(screen.getByRole('button',{name:/Passer/}));expect(close).toHaveBeenCalled();
 view.rerender(<GameUniverseTransition theme={config.id}/>);expect(document.querySelector('.ng-transition svg')).not.toBeNull();expect(document.querySelector('.ng-scene').innerHTML).not.toEqual(intro);
 const complete=document.querySelectorAll('.ng-scene svg *').length;view.rerender(<GameUniverseTransition theme={config.id} light/>);expect(document.querySelector('.ng-light')).not.toBeNull();expect(document.querySelectorAll('.ng-scene svg *').length).toBeLessThanOrEqual(complete);
 expect(readStartupAppearance({getItem:key=>key==='checkpoint-theme'?config.id:null}).theme).toBe(config.id);
});
