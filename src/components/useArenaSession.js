import {useEffect,useState} from 'react';
import {ARENA_SESSION_KEY} from '../services/arenaState';
export default function useArenaSession(tournament,storage){
 const [session,setSession]=useState(()=>{try{return JSON.parse(storage.getItem(ARENA_SESSION_KEY)||'null');}catch{return null;}});
 const same=Boolean(session&&tournament&&session.id===tournament.id&&Number.isInteger(session.start)&&session.start>=0);
 const start=same?Math.min(session.start,tournament.choices):tournament?.choices||0;
 const count=Math.max(0,(tournament?.choices||0)-start);
 const paused=Boolean(tournament&&!tournament.winner&&same&&(session.paused||count>=10));
 const update=next=>{setSession(next);try{storage.setItem(ARENA_SESSION_KEY,JSON.stringify(next));}catch{/* The bracket remains independently saved. */}};
 useEffect(()=>{if(tournament&&!same)update({id:tournament.id,start:tournament.choices,paused:false});},[tournament,same]); // eslint-disable-line react-hooks/exhaustive-deps
 return {count,paused,pause:()=>update({id:tournament.id,start,paused:true}),resume:()=>update({id:tournament.id,start:tournament.choices,paused:false})};
}
