import {auth} from '../firebase';
import {normalizeArenaEnvelope} from './arenaState';
const url='/api/account-data?collection=playerProgress&id=arena';
async function request(method,body,signal){
 const user=auth.currentUser;if(!user)throw new Error('Connexion nécessaire.');const token=await user.getIdToken();if(auth.currentUser?.uid!==user.uid)throw new Error('Le compte a changé.');
 const response=await fetch(url,{method,signal,cache:'no-store',headers:{Authorization:`Bearer ${token}`,...(body?{'Content-Type':'application/json'}:{})},...(body?{body:JSON.stringify(body)}:{})});
 const result=await response.json();if(auth.currentUser?.uid!==user.uid)throw new Error('Le compte a changé.');return {response,result};
}
export async function readArenaState(signal){const {response,result}=await request('GET',null,signal);if(!response.ok)throw new Error(result.error||'Synchronisation indisponible.');if(!result.exists)return null;const state=normalizeArenaEnvelope(result.data);if(!state)throw new Error('La sauvegarde du tournoi est invalide.');return state;}
export async function writeArenaState(state,baseRevision,signal){const {response,result}=await request('POST',{mode:'arena',baseRevision,data:state},signal);if(response.status===409)return {conflict:true,state:Object.hasOwn(result,'data')?normalizeArenaEnvelope(result.data):await readArenaState(signal)};if(!response.ok)throw new Error(result.error||'Synchronisation indisponible.');const saved=normalizeArenaEnvelope(result.data);if(!saved)throw new Error('La sauvegarde reçue est invalide.');return {state:saved};}
