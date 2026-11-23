import { useLanguage } from "../i18n/language";import { LocalizedValue } from "../i18n/Localized";import { useState } from 'react';
import { parseSpoilers } from '../services/spoilers';
import './SpoilerText.css';
function HiddenPart({ text }) {useLanguage();
  const [revealed, setRevealed] = useState(false);
  return <span className="spoiler-part"><button type="button" className="spoiler-toggle" aria-expanded={revealed} onClick={(event) => {event.stopPropagation();setRevealed((value) => !value);}}><LocalizedValue value={revealed ? 'Masquer le spoiler' : 'Révéler le spoiler'} /></button>{revealed && <span className="spoiler-revealed"><LocalizedValue value={text} /></span>}</span>;
}
export default function SpoilerText({ text = '', whole = false }) {useLanguage();
  const parts = whole ? [{ text: String(text), spoiler: true }] : parseSpoilers(text);
  return <span className="spoiler-text">{parts.map((part, index) => part.spoiler ? <HiddenPart key={`${index}:${part.text}`} text={part.text} /> : <span key={index}><LocalizedValue value={part.text} /></span>)}</span>;
}
