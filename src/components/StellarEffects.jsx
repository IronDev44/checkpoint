import "./StellarEffects.css";
function StarField({ count = 100 }) {
  return <div className="stellar-star-field" aria-hidden="true">{Array.from({length:count},(_,i)=><i key={i} style={{"--star-x":((i*61.803)%100)+"%","--star-y":((i*37.719)%100)+"%","--star-size":(1+i%3)+"px","--star-angle":(i/count*360)+"deg","--star-delay":(i%7*10)+"ms"}} />)}</div>;
}
export function StellarIntro({ progress }) {
  return <div className="stellar-boot"><StarField /><div className="stellar-horizon" aria-hidden="true" />
    <main className="stellar-boot-content"><span className="stellar-boot-kicker">UNE NOUVELLE AVENTURE T’ATTEND</span><h1>CHECKPOINT</h1><p>Explore ton univers gaming.</p>
      <div className="stellar-boot-progress" role="progressbar" aria-label="Chargement de Checkpoint" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress}><span style={{width:progress+"%"}} /></div>
      <small>Préparation du voyage <strong>{progress}%</strong></small>
    </main>
  </div>;
}
export function StellarTransition({ effects }) {
  return <div className={"stellar-tab-transition effects-"+effects} aria-hidden="true"><div className="stellar-jump-core" /><StarField count={effects === "calm" ? 32 : effects === "boost" ? 160 : 100} /></div>;
}
