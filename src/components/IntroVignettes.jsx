import "./IntroVignettes.css";

// These establishing shots belong only to startup. Their matching tab effects
// retain the book, portal, cabinet, capsule or crystal that made them recognisable.
export default function IntroVignette({kind}) {
  return <div className={`iv-scene iv-${kind}`} data-intro-vignette={kind} aria-hidden="true">
    {kind==="arcane"&&<><div className="iv-letter"><i/><span>H</span></div><div className="iv-letter-trail"/></>}
    {kind==="multiverse"&&<><div className="iv-comic-panels">{["★","◉","ϟ","⌁"].map((s,i)=><i key={i} style={{"--n":i}}><span>{s}</span></i>)}</div><div className="iv-comic-title">UNE NOUVELLE HISTOIRE</div></>}
    {kind==="arcade"&&<div className="iv-crt"><div className="iv-crt-glass"><span>PLAYER ONE</span><b>INSERT COIN</b><i>▰ ▰ ▰</i></div><div className="iv-crt-controls"><i/><i/><i/></div></div>}
    {kind==="carbon"&&<svg viewBox="0 0 360 240" fill="none"><g stroke="#b6dfec">{[0,1,2,3,4,5].map(i=><g key={i} transform={`rotate(${i*60} 180 120)`}><path d="M180 120V17M180 49L155 30M180 49L205 30M180 77L139 50M180 77L221 50" strokeWidth="2"/><path d="M180 95L147 77M180 95L213 77" stroke="#52798e"/></g>)}</g><circle cx="180" cy="120" r="91" stroke="#7eacbe33" strokeDasharray="3 12"/></svg>}
    {kind==="mint"&&<div className="iv-chip"><div className="iv-chip-pins"/><div className="iv-chip-core"><span>CHECKPOINT</span><b>01</b><div><i/><i/><i/><i/></div></div><small>POWER ON / READY</small></div>}
    {kind==="tokyo"&&<div className="iv-tokyo-sign"><div className="iv-tokyo-gate"><i/><i/></div><span>東京</span><b>夜の入り口</b><div className="iv-tokyo-lantern left"/><div className="iv-tokyo-lantern right"/></div>}
    {kind==="tamer"&&<div className="iv-dex"><div className="iv-dex-lights"><i/><i/><i/></div><div className="iv-dex-screen"><svg viewBox="0 0 140 100" fill="none"><path d="M18 80V54H37V69H53V44H74V60H94V27H112V11H126" stroke="#80bd91" strokeWidth="2"/><circle cx="110" cy="33" r="17" stroke="#aec3a1"/><path d="M110 12V54M89 33H131" stroke="#aec3a155"/></svg><span>TON VOYAGE COMMENCE</span></div><div className="iv-dex-buttons"><i/><i/><i/></div></div>}
    {kind==="crystal"&&<svg className="iv-ff-world" viewBox="0 0 360 240" fill="none"><circle cx="180" cy="132" r="88" fill="#14223b" stroke="#5389b4"/><path d="M110 82L144 60L168 77L164 106L190 128L175 158L143 150L137 119L119 113ZM219 83L246 99L255 133L235 153L224 186L203 175L211 148L197 120Z" fill="#376b8b"/><path d="M94 131H267M104 96Q180 118 256 96M108 171Q180 148 252 171M180 44Q102 132 180 220Q258 132 180 44" stroke="#8dc7df55"/><path d="M312 11Q260 25 207 81" stroke="#c6f1ff" strokeWidth="3"/><path d="M335 12Q265 9 207 81Q257 35 310 39" fill="#68c0e62e"/><circle cx="207" cy="81" r="7" fill="#c9f1ff"/></svg>}
    {kind==="steamdeck"&&<div className="iv-deck-library"><div className="iv-deck-cards"><i/><i/><i/></div><div className="iv-deck-logo"><i/><b/></div><span>TA BIBLIOTHÈQUE PREND VIE</span></div>}
  </div>;
}
