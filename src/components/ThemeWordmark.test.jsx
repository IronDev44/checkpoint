import {render,screen} from '@testing-library/react';
import ThemeWordmark from './ThemeWordmark';
import {ArcaneIntro} from './ArcaneEffects';
import {GameUniverseIntro,GameUniverseTransition} from './GameUniverseEffects';
import {getThemeTypography,THEME_TYPOGRAPHY} from '../data/themeTypography';
import {ALL_THEME_CATALOG} from '../data/themeCatalog';

test('custom titles preserve their readable name and explicitly selected theme',()=>{
 const view=render(<h1><ThemeWordmark theme="theme-tamer">Checkpoint</ThemeWordmark></h1>);
 expect(screen.getByRole('heading',{name:'Checkpoint'})).toBeInTheDocument();
 expect(screen.getByText('Checkpoint')).toHaveAttribute('data-wordmark-theme','theme-tamer');
 view.rerender(<h1><ThemeWordmark theme="theme-cubic">Checkpoint</ThemeWordmark></h1>);
 expect(screen.getByText('Checkpoint')).toHaveClass('theme-typography--voxel');
});

test('neutral, premium and existing 2077 signatures keep their separate rendering',()=>{
 for(const theme of ['theme-checkpoint','theme-checkpointpremium','theme-checkpointultimate','theme-checkpoint2077','unknown'])expect(getThemeTypography(theme)).toBeNull();
 const view=render(<ThemeWordmark theme="unknown">Checkpoint</ThemeWordmark>);
 expect(screen.getByText('Checkpoint')).not.toHaveClass('theme-wordmark');
 view.unmount();
 const known=new Set(ALL_THEME_CATALOG.map(t=>t.id));
 expect(Object.keys(THEME_TYPOGRAPHY).every(theme=>known.has(theme))).toBe(true);
});

test('startup titles use their theme without depending on the current body theme',()=>{
 document.body.dataset.theme='theme-checkpoint';
 const view=render(<ArcaneIntro progress={45}/>);
 expect(screen.getByRole('heading',{name:'Checkpoint'}).querySelector('.theme-wordmark')).toHaveAttribute('data-wordmark-theme','theme-arcane');
 expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow','45');
 view.rerender(<GameUniverseIntro theme="theme-elden" progress={100} effects="calm"/>);
 expect(screen.getByRole('heading',{name:'CHECKPOINT'}).querySelector('.theme-wordmark')).toHaveAttribute('data-wordmark-theme','theme-elden');
});

test('existing transition captions inherit typography without adding extra titles',()=>{
 const view=render(<GameUniverseTransition theme="theme-elden" effects="calm"/>);
 const caption=document.querySelector('.pc-transition-label');
 expect(caption).toHaveTextContent('GUIDÉ PAR LA GRÂCE');
 expect(caption.closest('.theme-typography--grace')).not.toBeNull();
 expect(document.querySelector('.theme-wordmark')).toBeNull();
 view.unmount();
});
