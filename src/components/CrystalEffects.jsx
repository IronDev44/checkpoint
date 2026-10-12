import "./CrystalEffects.css";

function Crystal() {
  return <svg className="ff-crystal" viewBox="0 0 160 240" fill="none" aria-hidden="true">
    <path d="M80 8L137 68L116 182L80 230L44 182L23 68Z" fill="#123d75" stroke="#a9e9ff" strokeWidth="2" />
    <path d="M80 8L58 68L80 230L102 68Z" fill="#b5f0ff" fillOpacity=".65" />
    <path d="M23 68H58L44 182Z" fill="#3b9ce1" /><path d="M137 68H102L116 182Z" fill="#6ccaff" />
    <path d="M80 8L23 68H58Z" fill="#78d7ff" /><path d="M80 8L137 68H102Z" fill="#d6f7ff" />
    <path d="M58 68H102L80 230Z" fill="#76bcfa" fillOpacity=".55" />
    <path d="M23 68H137M80 8L58 68L80 230L102 68L80 8M44 182L80 230L116 182" stroke="#d4f8ff" strokeOpacity=".75" strokeWidth="1.5" />
    <path d="M71 46L67 67L78 126" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
  </svg>;
}
function CrystalDust({ count }) {
  return <div className="ff-crystal-dust" aria-hidden="true">{Array.from({length:count},(_,i)=><i key={i} style={{"--dust-x":(i*61.803%100)+"%","--dust-y":(i*37.719%100)+"%","--dust-delay":i%6*10+"ms","--dust-angle":i*360/count+"deg"}} />)}</div>;
}
export function CrystalIntro({ progress }) {
  return <div className="ff-crystal-boot"><div className="ff-crystal-nebula" aria-hidden="true" /><CrystalDust count={38} />
    <main className="ff-crystal-boot-content"><div className="ff-crystal-altar"><div className="ff-crystal-altar-ring" /><Crystal /></div>
      <span className="ff-crystal-kicker">LE CRISTAL S’ÉVEILLE</span><h1>Checkpoint</h1><p>Chaque aventure écrit sa légende.</p>
      <div className="ff-crystal-progress" role="progressbar" aria-label="Chargement de Checkpoint" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress}><span style={{width:progress+"%"}} /></div>
      <small>Éveil des souvenirs <strong>{progress}%</strong></small>
    </main>
  </div>;
}
export function CrystalTransition({ effects }) {
  return <div className={"ff-crystal-transition effects-"+effects} aria-hidden="true"><div className="ff-crystal-invocation-glow" />
    <div className="ff-crystal-summon-circle"><i /><i /><i /></div>
    <div className="ff-crystal-summoned"><Crystal /></div>
    <div className="ff-crystal-shards">{Array.from({length:effects==="calm"?6:effects==="boost"?36:20},(_,i)=><i key={i} style={{"--shard-angle":i*137.5+"deg","--shard-distance":(90+i%6*35)+"px","--shard-delay":i%5*10+"ms"}} />)}</div>
    <CrystalDust count={effects==="calm"?8:effects==="boost"?80:45} />
  </div>;
}
