import './DataSourceCredits.css';

export default function DataSourceCredits(){
 return <footer className="data-source-credits" aria-label="Sources du catalogue">
  <span>Données et images de jeux : </span>
  <a href="https://rawg.io/" target="_blank" rel="noreferrer">RAWG</a>
  <span> · </span><a href="https://www.igdb.com/" target="_blank" rel="noreferrer">IGDB</a>
  <span> · </span><a href="/legal/droits.html" target="_blank" rel="noreferrer">Crédits et droits</a>
 </footer>;
}
