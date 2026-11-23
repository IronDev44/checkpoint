import { useLanguage } from "../i18n/language";import { LocalizedMessage, LocalizedElement } from "../i18n/Localized";import './DataSourceCredits.css';

export default function DataSourceCredits() {useLanguage();
  return <LocalizedElement __as={"footer"} className="data-source-credits" aria-label="Sources du catalogue">
  <span><LocalizedMessage source={"Données et images de jeux : "} values={[]} /></span>
  <a href="https://rawg.io/" target="_blank" rel="noreferrer">RAWG</a>
  <span> · </span><a href="https://www.igdb.com/" target="_blank" rel="noreferrer">IGDB</a>
  <span> · </span><a href="/legal/droits.html" target="_blank" rel="noreferrer"><LocalizedMessage source={"Crédits et droits"} values={[]} /></a>
 </LocalizedElement>;
}
