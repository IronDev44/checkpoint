import {StrictMode,useRef,useState} from 'react';
import {act,fireEvent,render,screen,waitFor} from '@testing-library/react';
import {LanguageGate} from './LanguageSettings';
import {LocalizedElement,LocalizedMessage,LocalizedValue} from './Localized';
import {getIntlLocale,getLanguage,LANGUAGE_KEY,readLanguagePreference,selectLanguage,suggestedLanguage,translateText} from './language';

beforeEach(async()=>{localStorage.clear();await selectLanguage('fr',{remember:false,explicit:false});});
afterEach(async()=>{await act(async()=>{await selectLanguage('fr',{remember:false,explicit:false});});});

test('suggestions use supported browser languages and corrupted preferences are ignored',()=>{
 expect(suggestedLanguage(['ja-JP','es-MX'])).toBe('es');
 expect(suggestedLanguage(['pt-BR'])).toBe('pt');
 expect(suggestedLanguage(['ja-JP'])).toBe('fr');
 localStorage.setItem(LANGUAGE_KEY,'{"language":"xx","confirmed":true}');expect(readLanguagePreference()).toBeNull();
 localStorage.setItem(LANGUAGE_KEY,'broken');expect(readLanguagePreference()).toBeNull();
});

test('the first visit asks before mounting the account screen, and remembers the choice',async()=>{
 const child=<h1><LocalizedMessage source="Bibliothèque"/></h1>;
 const first=render(<LanguageGate>{child}</LanguageGate>);
 expect(screen.queryByRole('heading',{name:'Bibliothèque'})).toBeNull();
 fireEvent.click(screen.getByRole('radio',{name:'English'}));
 fireEvent.click(screen.getByRole('button',{name:'Continue'}));
 expect(await screen.findByRole('heading',{name:'Library'})).toBeInTheDocument();
 expect(document.documentElement.lang).toBe('en');expect(readLanguagePreference().language).toBe('en');
 first.unmount();render(<StrictMode><LanguageGate>{child}</LanguageGate></StrictMode>);
 expect(await screen.findByRole('heading',{name:'Library'})).toBeInTheDocument();
 expect(screen.queryByRole('radio')).toBeNull();
});

test('language changes keep the same input node, typed content and storage values',async()=>{
 function Form(){const [value,setValue]=useState('En cours');const input=useRef();return <><LocalizedElement __as="input" ref={input} aria-label="Rechercher un jeu" placeholder="Rechercher un jeu" value={value} onChange={event=>setValue(event.target.value)}/><LocalizedMessage source="Bibliothèque"/></>;}
 render(<Form/>);const input=screen.getByRole('textbox');fireEvent.change(input,{target:{value:'Dragon Quest — mon avis'}});
 await act(async()=>{await selectLanguage('en');});
 expect(screen.getByRole('textbox')).toBe(input);expect(input).toHaveValue('Dragon Quest — mon avis');
 expect(input).toHaveAttribute('aria-label','Search for a game');expect(screen.getByText('Library')).toBeInTheDocument();
});

test('messages translate complete phrases while preserving dynamic values and React content',async()=>{
 render(<><LocalizedMessage source="Choix {{0}} sur {{1}}" values={[<strong key="count">2</strong>,8]}/><LocalizedValue value={'Un nom de jeu inventé <script>alert(1)</script>'}/></>);
 await act(async()=>{await selectLanguage('en');});
 expect(screen.getByText('2',{selector:'strong'})).toBeInTheDocument();
 expect(document.body).toHaveTextContent('Choice 2 of 8');expect(document.querySelector('script')).toBeNull();
 expect(document.body).toHaveTextContent('Un nom de jeu inventé <script>alert(1)</script>');
});

test('the latest language choice wins a concurrent load and date locale follows the choice',async()=>{
 await act(async()=>{await Promise.all([selectLanguage('de'),selectLanguage('fr')]);});
 expect(getLanguage()).toBe('fr');
 await act(async()=>{await selectLanguage('es');});expect(getIntlLocale()).toBe('es-ES');
 expect(translateText('  Bibliothèque ')).toBe('  Biblioteca ');
});

test('blocked local storage does not prevent using the selected language for this visit',async()=>{
 const spy=jest.spyOn(Storage.prototype,'setItem').mockImplementation(()=>{throw Error('blocked');});
 try{await act(async()=>{await selectLanguage('it');});expect(getLanguage()).toBe('it');expect(document.documentElement.lang).toBe('it');}finally{spy.mockRestore();}
});

test('structured accessible names translate UI copy and preserve a game name matching a UI label',async()=>{
 render(<LocalizedElement __as="button" __messages={{'aria-label':{source:'Ajouter {{0}} aux favoris',values:['Accueil'],preserve:[0]}}}>Star</LocalizedElement>);
 await act(async()=>{await selectLanguage('en');});
 expect(screen.getByRole('button').getAttribute('aria-label')).toContain('Accueil');
 expect(screen.getByRole('button').getAttribute('aria-label')).not.toContain('Ajouter');
 expect(screen.getByRole('button')).not.toHaveAttribute('__messages');
});
