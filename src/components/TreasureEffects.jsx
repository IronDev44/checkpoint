import "./TreasureEffects.css";

function Compass() {
  return <svg className="treasure-compass" viewBox="0 0 180 180" fill="none" aria-hidden="true"><circle cx="90" cy="90" r="78" fill="#172c35" stroke="#cfa960" strokeWidth="7" /><circle cx="90" cy="90" r="63" stroke="#cfa960" strokeDasharray="2 9" strokeWidth="4" /><path d="M90 28L103 77L90 90L77 77Z" fill="#f4ce82" /><path d="M90 152L77 103L90 90L103 103Z" fill="#719aa1" /><path d="M28 90L77 77L90 90L77 103ZM152 90L103 103L90 90L103 77Z" fill="#cfa960" fillOpacity=".55" /><circle cx="90" cy="90" r="7" fill="#f9df9f" /><path d="M84 18V9M96 18V9" stroke="#e5c482" strokeWidth="3" /></svg>;
}
function MapArt() {
  return <svg className="treasure-map-art" viewBox="0 0 600 800" fill="none" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><path d="M30 170Q140 95 175 195T315 180T490 95L540 165L485 265L395 240L310 305L215 270L125 310L45 240ZM90 575L155 475L250 490L285 600L215 695L120 660ZM410 510L480 455L545 540L490 630L425 600Z" fill="#76522218" stroke="#75502970" strokeWidth="3" /><path className="treasure-map-route" d="M95 240C300 60 540 345 340 430S80 510 175 605S520 670 470 535" stroke="#7c3e29" strokeWidth="4" strokeDasharray="8 12" /><path d="M451 516L489 554M489 516L451 554" stroke="#993f2c" strokeWidth="7" /><path d="M25 70H575M25 730H575M70 25V775M530 25V775" stroke="#77542c30" strokeWidth="1" /></svg>;
}
function Chest() {
  return <div className="treasure-chest"><div className="treasure-chest-light" /><div className="treasure-chest-lid" /><div className="treasure-chest-base"><i /></div></div>;
}
export function TreasureIntro({ progress }) {
  return <div className="treasure-boot"><div className="treasure-boot-map"><MapArt /></div>
    <main className="treasure-boot-content"><Compass /><span className="treasure-kicker">CAP SUR TA PROCHAINE AVENTURE</span><h1>Checkpoint</h1><p>Chaque souvenir est un trésor.</p>
      <div className="treasure-progress" role="progressbar" aria-label="Chargement de Checkpoint" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress}><span style={{width:progress+"%"}} /></div>
      <small>Préparation de l’expédition <strong>{progress}%</strong></small>
    </main>
  </div>;
}
export function TreasureTransition({ effects }) {
  return <div className={"treasure-tab-transition effects-"+effects} aria-hidden="true"><div className="treasure-transition-map"><MapArt /></div><div className="treasure-transition-chest"><Chest /></div>
    <div className="treasure-gold-coins">{Array.from({length:effects==="calm"?4:effects==="boost"?36:20},(_,i)=><i key={i} style={{"--coin-x":((i%2?1:-1)*(35+i%7*25))+"px","--coin-y":(-70-i%5*35)+"px","--coin-delay":i%5*10+"ms","--coin-turn":(i*45)+"deg"}} />)}</div>
  </div>;
}
