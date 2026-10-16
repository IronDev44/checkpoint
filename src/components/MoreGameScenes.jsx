import "./MoreGameEffects.css";

function Ambient({ light, boost, kind="dust" }) {
  return <div className={`gx-ambient gx-${kind}`} aria-hidden="true">{Array.from({length:light?4:boost?30:18},(_,i)=><i key={i} style={{"--x":`${i*61.803%100}%`,"--y":`${i*37.719%100}%`,"--wait":`${-i*.37}s`,"--drift":`${(i%2?1:-1)*(30+i%5*12)}px`}}/>)}</div>;
}

function HollowScene({light,boost}) {
  return <div className="gu-world gx-hollow-world" aria-hidden="true">
    <svg className="gx-cavern" viewBox="0 0 1000 800" preserveAspectRatio="xMidYMid slice" fill="none" stroke="#667eaa"><path d="M120 850V290Q120 100 300 85V850M880 850V290Q880 100 700 85V850M325 850V350Q325 170 500 155Q675 170 675 350V850" strokeWidth="12"/>{!light&&<g strokeWidth="3"><path d="M90 850Q160 540 65 365M160 850Q255 610 190 475M910 850Q840 540 935 365M840 850Q745 610 810 475M170 615L97 540M835 615L900 540"/></g>}</svg>
    <svg className="gu-hero gx-knight" viewBox="0 0 360 400"><path d="M140 234Q90 275 85 349L142 325L160 365L183 337L210 363L223 326L280 344Q259 265 218 235Z" fill="#171d31" stroke="#586781" strokeWidth="3"/><path d="M145 228L137 382M206 230L220 383" stroke="#080e1c" strokeWidth="14"/><path d="M105 107Q70 47 82 16Q99 62 131 74Q180 56 229 74Q261 62 278 16Q290 47 255 107Q269 170 238 217Q181 261 123 217Q92 173 105 107Z" fill="#e5edf1" stroke="#a7bbc9" strokeWidth="3"/><ellipse cx="139" cy="153" rx="19" ry="32" fill="#101626"/><ellipse cx="221" cy="153" rx="19" ry="32" fill="#101626"/><path d="M112 278L260 371L285 369L122 268Z" fill="#afc1ce" stroke="#e5edf3" strokeWidth="3"/><path d="M113 267L101 284M123 273L109 293" stroke="#5f7289" strokeWidth="6"/></svg>
    <svg className="gx-soul-sweep" viewBox="0 0 1000 800" preserveAspectRatio="none"><path d="M-200 620Q380 120 1200 420" fill="none" stroke="#e0f5ff" strokeWidth="70"/></svg><Ambient kind="soul" light={light} boost={boost}/>
  </div>;
}

function HadesScene({light,boost}) {
  return <div className="gu-world gx-hades-world" aria-hidden="true">
    <svg className="gx-greek-pillars" viewBox="0 0 1000 800" preserveAspectRatio="none" fill="none" stroke="#b1856744"><path d="M70 800V110H180V800M820 800V110H930V800M45 110H205M795 110H955M55 90H195M805 90H945" strokeWidth="12"/><path d="M100 790V155M150 790V155M850 790V155M900 790V155" strokeWidth="4"/></svg>
    <svg className="gu-hero gx-laurel" viewBox="0 0 360 400"><path d="M84 316Q-12 179 110 62M276 316Q372 179 250 62" fill="none" stroke="#b8d18a" strokeWidth="7"/>{[false,true].map(flip=><g key={String(flip)} transform={flip?'translate(360 0) scale(-1 1)':undefined}>{Array.from({length:light?4:8},(_,i)=><path key={i} d="M0 0Q-48 -29 -38 -51Q1 -42 0 0Q40 -24 36 -51Q-2 -36 0 0" transform={`translate(${70-Math.sin(i*.43)*17} ${290-i*(light?57:29)}) rotate(${-40+i*9})`} fill={i%2?'#a8bc76':'#ca7357'} stroke="#251523" strokeWidth="2"/>)}</g>)}<path d="M125 118Q180 83 235 118L251 190L220 229L218 277H142L140 229L109 190Z" fill="#e0d5b0" stroke="#fae5be" strokeWidth="4"/><path d="M126 163L166 171L150 202L125 192ZM234 163L194 171L210 202L235 192Z" fill="#342332"/><path d="M180 198L193 221H167Z" fill="#50333b"/><path d="M154 241V267M172 238V267M190 238V267M208 241V267" stroke="#705052" strokeWidth="4"/><path d="M154 92Q138 63 154 40Q155 70 180 64Q180 32 209 25Q191 68 215 90Z" fill="#9bbf84"/><path d="M133 305L180 323L227 305" fill="none" stroke="#c86f52" strokeWidth="9"/></svg>
    <div className="gx-green-flames">{Array.from({length:light?3:7},(_,i)=><i key={i} style={{left:`${i*(light?38:17)-10}%`,animationDelay:`${-i*.29}s`}}/>)}</div><Ambient kind="cinders" light={light} boost={boost}/>
  </div>;
}

function ResidentScene({light,boost}) {
  return <div className="gu-world gx-resident-world" aria-hidden="true">
    <div className="gx-safe-lamp"><i/></div><div className="gx-safe-desk"/>
    <svg className="gu-hero gx-typewriter" viewBox="0 0 440 360"><path className="gx-save-paper" d="M133 21H307V179H133Z" fill="#e1d4b4" stroke="#aa997c" strokeWidth="3"/><g className="gx-paper-ink" fill="#6e6755"><text x="220" y="65" textAnchor="middle" fontFamily="monospace" fontSize="16" letterSpacing="2">CHECKPOINT</text><path d="M155 87H282M155 100H274M155 113H285" stroke="#9e937a" strokeWidth="2"/></g><rect x="93" y="137" width="255" height="27" rx="10" fill="#303e32" stroke="#78816a" strokeWidth="4"/><path d="M124 154H318L357 211L383 305Q214 338 57 305L83 211Z" fill="#344337" stroke="#8a9479" strokeWidth="4"/><path d="M95 205H345L361 289Q222 314 77 289Z" fill="#1c2820" stroke="#59684f" strokeWidth="3"/><circle cx="151" cy="183" r="24" fill="#17251c" stroke="#82906f" strokeWidth="4"/><circle cx="288" cy="183" r="24" fill="#17251c" stroke="#82906f" strokeWidth="4"/><path d="M153 183H285" stroke="#aba189" strokeWidth="5"/>{Array.from({length:3},(_,row)=><g key={row}>{Array.from({length:light?5:9},(_,column)=><circle key={column} cx={106+column*(light?55:27.5)+(row%2?5:0)} cy={228+row*23} r="7" fill="#c4c3a4" stroke="#636f57" strokeWidth="2"/>)}</g>)}<path d="M140 302H305" stroke="#c0baa0" strokeWidth="8"/><path d="M94 147H68V131M346 150H374" fill="none" stroke="#b2aa8e" strokeWidth="6"/></svg>
    <div className="gx-save-line"><span>CHECKPOINT</span><i/></div><Ambient kind="safe-dust" light={light} boost={boost}/>
  </div>;
}

function CodecScene({light,boost,id}) {
  return <div className="gu-world gx-codec-world" aria-hidden="true">
    <svg className="gx-tactical-map" viewBox="0 0 1000 800" preserveAspectRatio="none" fill="none" stroke="#719e6355"><path d="M0 330H200V180H420V340H650V140H1000M0 620H130V450H330V650H580V480H800V680H1000M500 0V180M500 340V800" strokeWidth="3"/>{!light&&<path d="M15 355H225V205H395V365H675V165H1000M0 595H105V425H355V625H555V455H825V655H1000" strokeWidth="1"/>}</svg>
    <svg className="gu-hero gx-codec" viewBox="0 0 520 290"><defs><clipPath id={`${id}-radar`}><circle cx="108" cy="142" r="65"/></clipPath></defs><rect x="16" y="26" width="488" height="238" rx="7" fill="#0c241b" stroke="#9db98b" strokeWidth="3"/><path d="M16 66H504M16 224H504M204 66V224M317 66V224" fill="none" stroke="#607f55" strokeWidth="2"/><text x="260" y="52" textAnchor="middle" fill="#bdd5a0" fontSize="16" fontFamily="monospace" letterSpacing="5">CODEC</text><g clipPath={`url(#${id}-radar)`} fill="none" stroke="#789a65"><circle cx="108" cy="142" r="65" fill="#102f21"/><circle cx="108" cy="142" r="42"/><circle cx="108" cy="142" r="20"/><path d="M108 77V207M43 142H173"/><path className="gx-radar-beam" d="M108 142L70 88L127 78Z" fill="#bdd78845" stroke="none"/></g><path d="M220 107H300M220 178H300" stroke="#739862" strokeWidth="3"/><text x="260" y="148" textAnchor="middle" fill="#cbe0a7" fontSize="21" fontFamily="monospace">140.85</text><text x="260" y="203" textAnchor="middle" fill="#8eae77" fontSize="10" fontFamily="monospace" letterSpacing="3">RÉCEPTION</text>{Array.from({length:light?6:12},(_,i)=><rect key={i} className="gx-signal-bar" x={338+i*(light?24:12)} y="100" width="6" height="82" fill="#9bbf7c" style={{"--bar":.2+(i*7%9)*.08,"--wait":`${-i*.14}s`}}/>)}<text x="260" y="249" textAnchor="middle" fill="#a8bf88" fontSize="11" fontFamily="monospace" letterSpacing="3">FRÉQUENCE OUVERTE</text></svg>
    <div className="gx-codec-alert">!</div><div className="gx-codec-scan"/><Ambient kind="signal-dust" light={light} boost={boost}/>
  </div>;
}

export const MORE_GAME_SCENES = {hollow:HollowScene,hades:HadesScene,resident:ResidentScene,codec:CodecScene};
