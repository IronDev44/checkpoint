import {useEffect,useState} from 'react';
import {RELEASE_NOTES,FEATURE_TUTORIALS} from '../data/releaseNotes';
import {readReleaseProgress,markReleasesRead,markFeatureGuidesSeen,RELEASE_PROGRESS_EVENT} from '../services/releaseProgress';
import {TAB_TUTORIALS} from '../data/tabTutorials';
import {TutorialDialog} from './TabTutorials';
import ToolDialog from './ToolDialog';
import './ReleaseNotes.css';

export function useReleaseProgress(){
 const [progress,setProgress]=useState(readReleaseProgress);
 useEffect(()=>{const refresh=()=>setProgress(readReleaseProgress());window.addEventListener(RELEASE_PROGRESS_EVENT,refresh);window.addEventListener('focus',refresh);return()=>{window.removeEventListener(RELEASE_PROGRESS_EVENT,refresh);window.removeEventListener('focus',refresh);};},[]);
 return progress;
}
export function ReleaseNotesContent(){
 const [guide,setGuide]=useState(null);
 return <div className="release-notes-list"><p>Les nouveautés et améliorations de Checkpoint, avec les guides pour les découvrir.</p>{RELEASE_NOTES.map(release=><article key={release.id} className="release-note"><header><time dateTime={release.date}>{new Date(`${release.date}T12:00:00Z`).toLocaleDateString('fr-FR',{day:'numeric',month:'long',year:'numeric',timeZone:'UTC'})}</time><h3>{release.title}</h3><p>{release.summary}</p></header>{release.changes.map(change=><section key={change.title}><h4>{change.title}</h4><p>{change.text}</p><small>{change.where}</small></section>)}{release.fixes?.length>0&&<details><summary>Améliorations et corrections</summary><ul>{release.fixes.map(fix=><li key={fix}>{fix}</li>)}</ul></details>}<div className="release-note-guides">{FEATURE_TUTORIALS.filter(g=>g.releaseId===release.id).map(g=><button key={g.id} type="button" className="option-pill" onClick={()=>setGuide(g)}>Voir le guide · {TAB_TUTORIALS[g.tab].label}</button>)}</div></article>)}{guide&&<TutorialDialog key={guide.id} guide={{...guide,label:TAB_TUTORIALS[guide.tab].label,update:true}} onClose={()=>{markFeatureGuidesSeen([guide.id]);setGuide(null);}}/>}</div>;
}
export function ReleaseNotesDialog({onClose}){
 return <ToolDialog title="Nouveautés de Checkpoint" wide onClose={onClose} footer={<button type="button" className="option-pill" onClick={()=>{markReleasesRead(RELEASE_NOTES.map(r=>r.id));onClose();}}>J’ai lu les nouveautés</button>}><ReleaseNotesContent/></ToolDialog>;
}
export default function ReleaseNotes(){
 const [open,setOpen]=useState(false);const progress=useReleaseProgress();
 const unread=RELEASE_NOTES.filter(r=>!progress.read.includes(r.id));
 return <><div className={`release-notes-entry ${unread.length?'has-new':''}`}><div><strong>{unread.length?'Du nouveau dans Checkpoint':'Les nouveautés de Checkpoint'}</strong><p>{unread[0]?.summary||'Retrouve les ajouts et améliorations de l’app.'}</p></div><button type="button" className="option-pill" onClick={()=>setOpen(true)}>Voir les nouveautés</button>{unread.length>0&&<button type="button" className="release-notes-dismiss" onClick={()=>markReleasesRead(RELEASE_NOTES.map(r=>r.id))}>Marquer comme lu</button>}</div>{open&&<ReleaseNotesDialog onClose={()=>setOpen(false)}/>}</>;
}
