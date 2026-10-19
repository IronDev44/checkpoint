import {useState} from 'react';
import {parseSpoilers} from '../services/spoilers';
import './SpoilerText.css';
function HiddenPart({text}){
 const [revealed,setRevealed]=useState(false);
 return <span className="spoiler-part"><button type="button" className="spoiler-toggle" aria-expanded={revealed} onClick={event=>{event.stopPropagation();setRevealed(value=>!value);}}>{revealed?'Masquer le spoiler':'Révéler le spoiler'}</button>{revealed&&<span className="spoiler-revealed">{text}</span>}</span>;
}
export default function SpoilerText({text='',whole=false}){
 const parts=whole?[{text:String(text),spoiler:true}]:parseSpoilers(text);
 return <span className="spoiler-text">{parts.map((part,index)=>part.spoiler?<HiddenPart key={`${index}:${part.text}`} text={part.text}/>:<span key={index}>{part.text}</span>)}</span>;
}
