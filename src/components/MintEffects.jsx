import "./MintEffects.css";

function CircuitBoard() {
  return <svg className="mint-circuit-board" viewBox="0 0 320 220" fill="none" aria-hidden="true"><g stroke="#91dfd2" strokeWidth="2"><path d="M0 35H75L105 65H130M0 110H110M0 185H75L105 155H130M320 35H245L215 65H190M320 110H210M320 185H245L215 155H190M90 0V35L130 75M230 0V35L190 75M90 220V185L130 145M230 220V185L190 145" /></g><g stroke="#dca582" strokeWidth="2"><path d="M25 0V60L80 115V220M295 0V60L240 115V220" /><circle cx="25" cy="60" r="5" /><circle cx="295" cy="60" r="5" /></g><rect x="110" y="60" width="100" height="100" rx="12" fill="#1b2933" stroke="#b5efe3" strokeWidth="3" /><rect x="122" y="72" width="76" height="76" rx="6" stroke="#91dfd24d" /><path d="M148 90L132 110L148 130M172 90L188 110L172 130" stroke="#dca582" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" /><path className="mint-circuit-pulse" d="M0 110H110M210 110H320M90 0V35L130 75M230 220V185L190 145" stroke="#e5fff7" strokeWidth="4" strokeDasharray="16 160" /></svg>;
}
export function MintIntro({ progress }) {
  return <div className="mint-boot"><main className="mint-boot-content"><CircuitBoard /><span className="mint-kicker">TOUT EST CONNECTÉ</span><h1>Checkpoint</h1><p>Tes jeux, tes souvenirs, ton univers.</p><div className="mint-progress" role="progressbar" aria-label="Chargement de Checkpoint" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress}><span style={{width:progress+"%"}} /></div><small>Mise en connexion <strong>{progress}%</strong></small></main></div>;
}
export function MintTransition({ effects }) {
  return <div className={"mint-tab-transition effects-"+effects} aria-hidden="true"><div className="mint-transition-field" /><div className="mint-transition-board"><CircuitBoard /></div><div className="mint-signal-grid">{Array.from({length:effects==="calm"?6:effects==="boost"?30:18},(_,i)=><i key={i} style={{"--signal-x":(i*37%96)+"%","--signal-y":(i*23%94)+"%","--signal-delay":i%5*12+"ms"}} />)}</div></div>;
}
