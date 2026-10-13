import "./TreasureEffects.css";

function StrawHatEmblem() {
  return <svg className="treasure-crew-emblem" viewBox="0 0 220 220" fill="none" aria-hidden="true">
    <g stroke="#18263c" strokeWidth="5" strokeLinejoin="round">
      <path d="M36 141L183 200M37 200L184 141" stroke="#fff5de" strokeWidth="15" strokeLinecap="round" />
      <path d="M36 141L183 200M37 200L184 141" stroke="#18263c" strokeWidth="3" />
      <path d="M63 126C61 86 159 86 157 126C157 150 144 159 135 166V185C135 199 85 199 85 185V166C75 159 63 150 63 126Z" fill="#fff5de" />
      <ellipse cx="88" cy="133" rx="13" ry="16" fill="#18263c" /><ellipse cx="132" cy="133" rx="13" ry="16" fill="#18263c" />
      <path d="M110 153L103 165H117Z" fill="#18263c" />
      <path d="M85 177Q110 190 135 177M98 178V193M110 180V195M122 178V193" strokeWidth="3" />
      <path d="M65 86C65 24 155 24 155 86Z" fill="#f5c663" />
      <path d="M66 73H154V90H66Z" fill="#ef4f46" />
      <ellipse cx="110" cy="94" rx="89" ry="15" fill="#f5c663" />
      <path d="M37 94Q110 108 183 94M79 48L73 64M91 42L86 61M106 38V59M121 41L127 61M138 48L145 64" stroke="#c38e39" strokeWidth="2" />
    </g>
  </svg>;
}
function Waves() {
  return <div className="treasure-ocean" aria-hidden="true">{[0,1,2].map(i=><svg key={i} viewBox="0 0 1200 220" preserveAspectRatio="none"><path d="M0 70Q150 0 300 70T600 70T900 70T1200 70V220H0Z" /></svg>)}</div>;
}
function Ship() {
  return <svg className="treasure-adventure-ship" viewBox="0 0 360 260" fill="none" aria-hidden="true">
    <path d="M65 183H300L267 223H108Z" fill="#9d4d27" stroke="#402519" strokeWidth="5" />
    <path d="M85 184H284M111 207H265" stroke="#f4c36c" strokeWidth="5" />
    <path d="M181 23V182M112 97H270" stroke="#eac289" strokeWidth="7" />
    <path d="M190 50Q262 95 273 155H191Z" fill="#fff2d4" stroke="#3b3d46" strokeWidth="4" />
    <path d="M174 78Q115 126 99 156H174Z" fill="#ec5948" stroke="#3b3d46" strokeWidth="4" />
    <path d="M185 22L230 33L185 44Z" fill="#18263c" />
    <circle cx="229" cy="105" r="15" fill="#f5c663" /><path d="M208 105H250" stroke="#ea5148" strokeWidth="5" />
  </svg>;
}
export function TreasureIntro({ progress }) {
  return <div className="treasure-boot"><div className="treasure-sun" aria-hidden="true" /><div className="treasure-cloud cloud-one" aria-hidden="true" /><div className="treasure-cloud cloud-two" aria-hidden="true" /><Ship /><Waves />
    <main className="treasure-boot-content"><div className="treasure-emblem-frame"><StrawHatEmblem /></div><span className="treasure-kicker">ONE PIECE · CAP SUR GRAND LINE</span><h1>Checkpoint</h1><p>Ton équipage. Tes aventures. Tes trésors.</p>
      <div className="treasure-progress" role="progressbar" aria-label="Chargement de Checkpoint" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress}><span style={{width:progress+"%"}} /></div>
      <small>Prêt à prendre le large <strong>{progress}%</strong></small>
    </main>
  </div>;
}
export function TreasureTransition({ effects, direction="right" }) {
  return <div className={`treasure-tab-transition effects-${effects} direction-${direction}`} aria-hidden="true"><div className="treasure-transition-sea"><Waves /></div>
    <div className="treasure-pirate-flag"><div className="treasure-flag-seam" /><StrawHatEmblem /><span>CAP SUR L’AVENTURE</span></div>
    <div className="treasure-spray">{Array.from({length:effects==="calm"?0:effects==="boost"?42:22},(_,i)=><i key={i} style={{"--spray-x":(i*61.8%100)+"%","--spray-y":(15+i%7*10)+"%","--spray-turn":(i%2?1:-1)*20+"deg"}} />)}</div>
  </div>;
}
