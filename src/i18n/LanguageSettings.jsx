import {useEffect,useState} from 'react';
import {LANGUAGES,readLanguagePreference,selectLanguage,suggestedLanguage,useLanguage} from './language';
import './language.css';

const copy={
 fr:{title:'Choisis ta langue',body:'Tu pourras la changer à tout moment dans les options.',continue:'Continuer',label:'Langue de l’application',saved:'Langue enregistrée',error:'Le chargement a échoué. Réessaie.',loading:'Chargement…'},
 en:{title:'Choose your language',body:'You can change it at any time in settings.',continue:'Continue',label:'App language',saved:'Language saved',error:'Could not load this language. Try again.',loading:'Loading…'},
 es:{title:'Elige tu idioma',body:'Puedes cambiarlo cuando quieras en los ajustes.',continue:'Continuar',label:'Idioma de la aplicación',saved:'Idioma guardado',error:'No se pudo cargar el idioma. Inténtalo de nuevo.',loading:'Cargando…'},
 de:{title:'Wähle deine Sprache',body:'Du kannst sie jederzeit in den Einstellungen ändern.',continue:'Weiter',label:'Sprache der App',saved:'Sprache gespeichert',error:'Die Sprache konnte nicht geladen werden. Versuche es erneut.',loading:'Wird geladen…'},
 it:{title:'Scegli la lingua',body:'Puoi cambiarla in qualsiasi momento nelle impostazioni.',continue:'Continua',label:'Lingua dell’app',saved:'Lingua salvata',error:'Impossibile caricare la lingua. Riprova.',loading:'Caricamento…'},
 pt:{title:'Escolhe o teu idioma',body:'Podes alterá-lo a qualquer momento nas definições.',continue:'Continuar',label:'Idioma da aplicação',saved:'Idioma guardado',error:'Não foi possível carregar o idioma. Tenta novamente.',loading:'A carregar…'},
};
export function LanguageGate({children}){
 const [initial]=useState(readLanguagePreference),[ready,setReady]=useState(false),[choice,setChoice]=useState(()=>initial?.language||suggestedLanguage());
 const [busy,setBusy]=useState(Boolean(initial)),[error,setError]=useState('');
 useEffect(()=>{if(!initial)return;let active=true;selectLanguage(initial.language,{explicit:false}).then(()=>{if(active)setReady(true);}).catch(()=>{if(active){setError(copy[initial.language].error);setBusy(false);}});return()=>{active=false;};},[initial]);
 if(ready)return children;
 const labels=copy[choice];
 async function confirm(){setBusy(true);setError('');try{await selectLanguage(choice);setReady(true);}catch{setError(labels.error);setBusy(false);}}
 return <main className="checkpoint-language-welcome" lang={choice}><section aria-labelledby="language-welcome-title">
  <p className="checkpoint-language-brand">CHECKPOINT</p><h1 id="language-welcome-title">{labels.title}</h1><p>{labels.body}</p>
  <fieldset disabled={busy}><legend>{labels.label}</legend><div className="checkpoint-language-grid">{LANGUAGES.map(item=><label key={item.code} className={choice===item.code?'selected':''}><input type="radio" name="checkpoint-language" value={item.code} checked={choice===item.code} onChange={()=>{setChoice(item.code);setError('');}}/><span lang={item.code}>{item.name}</span></label>)}</div></fieldset>
  {error&&<p role="alert">{error}</p>}<button type="button" onClick={confirm} disabled={busy}>{busy?labels.loading:labels.continue}</button>
 </section></main>;
}
export default function LanguageSettings(){
 const {language}=useLanguage(),[busy,setBusy]=useState(false),[message,setMessage]=useState('');const labels=copy[language];
 async function change(event){const next=event.target.value;setBusy(true);setMessage('');try{await selectLanguage(next,{explicit:false});setMessage(copy[next].saved);}catch{setMessage(labels.error);}finally{setBusy(false);}}
 return <section className="search-panel options-panel checkpoint-language-settings"><h2 className="panel-title">{labels.label}</h2><label htmlFor="checkpoint-language-select">{labels.title}</label><select id="checkpoint-language-select" value={language} disabled={busy} onChange={change}>{LANGUAGES.map(item=><option value={item.code} key={item.code} lang={item.code}>{item.name}</option>)}</select>{message&&<p role="status">{message}</p>}</section>;
}
