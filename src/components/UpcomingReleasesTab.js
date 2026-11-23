import { useLanguage, getIntlLocale } from "../i18n/language";import { LocalizedMessage, LocalizedValue } from "../i18n/Localized";export default function UpcomingReleasesTab({ releases, renderGame }) {useLanguage();
  const { games, loading, error, month, months, chooseMonth, platform, genre, choosePlatform, chooseGenre, resetFilters, refresh, hasMore, loadMore } = releases;
  const monthLabel = (key) => new Date(`${key}-01T12:00:00`).toLocaleDateString(getIntlLocale(), { month: 'long', year: 'numeric' });
  return (
    <div className="progression-stack upcoming-page">
      <div className="search-panel">
        <h2 className="panel-title"><LocalizedMessage source={"Prochaines sorties"} values={[]} /></h2>
        <div className="option-value"><LocalizedMessage source={"Sorties datées à partir d’aujourd’hui, sur les six prochains mois."} values={[]} /></div>
        <div className="upcoming-filter-grid">
          <label className="upcoming-filter-field"><span><LocalizedMessage source={"Plateforme"} values={[]} /></span>
            <select value={platform} onChange={(event) => choosePlatform(event.target.value)}>{
              [
              ['', 'Toutes les plateformes'], ['consoles', 'Consoles'], ['PlayStation 5', 'PS5'],
              ['Xbox Series X|S', 'Xbox Series'], ['Nintendo Switch', 'Switch'],
              ['Nintendo Switch 2', 'Switch 2'], ['PC (Microsoft Windows)', 'PC']].
              map(([value, label]) => <option key={value} value={value}><LocalizedValue value={label} /></option>)}
            </select>
          </label>
          <label className="upcoming-filter-field"><span><LocalizedMessage source={"Genre"} values={[]} /></span>
            <select value={genre} onChange={(event) => chooseGenre(event.target.value)}>{
              [
              ['', 'Tous les genres'], ['3', 'Aventure'], ['5', 'RPG'], ['2', 'Shooter'], ['1', 'Course'],
              ['10', 'Stratégie'], ['83', 'Plateforme'], ['7', 'Puzzle'], ['15', 'Sport'], ['6', 'Combat'], ['14', 'Simulation']].
              map(([value, label]) => <option key={value} value={value}><LocalizedValue value={label} /></option>)}
            </select>
          </label>
          <label className="upcoming-filter-field"><span><LocalizedMessage source={"Mois"} values={[]} /></span>
            <select value={month} onChange={(event) => chooseMonth(event.target.value)}>
              <option value=""><LocalizedMessage source={"Tous les mois"} values={[]} /></option>{
              months.map((key) => <option key={key} value={key}><LocalizedValue value={monthLabel(key)} /></option>)}
            </select>
          </label>
        </div>{
        platform === 'consoles' && <p className="option-value upcoming-filter-note"><LocalizedMessage source={"Les jeux multiplateformes disponibles sur console sont inclus."} values={[]} /></p>}
        <div className="upcoming-filter-actions">{
          (month || platform || genre) && <button className="profile-toggle-btn" type="button" onClick={resetFilters}><LocalizedMessage source={"Tout effacer"} values={[]} /></button>}
          <button className="profile-toggle-btn" type="button" disabled={loading} onClick={refresh}><LocalizedMessage source={"Actualiser"} values={[]} /></button>
        </div>
      </div>
      {loading && <div className="option-value" role="status"><LocalizedMessage source={"Chargement des sorties…"} values={[]} /></div>}
      {error && <div className="rawg-status-note" role="alert"><LocalizedValue value={error} /> <button type="button" className="profile-toggle-btn" onClick={refresh}><LocalizedMessage source={"Réessayer"} values={[]} /></button></div>}
      {games.length > 0 && <div className="upcoming-list"><LocalizedValue value={games.map(renderGame)} /></div>}
      {!loading && !error && !games.length && <div className="search-panel"><h3><LocalizedMessage source={"Aucune sortie avec ces filtres"} values={[]} /></h3><p className="option-value"><LocalizedMessage source={"Essaie une autre plateforme, un autre genre ou réinitialise les filtres."} values={[]} /></p></div>}
      {hasMore && !error && <button type="button" className="profile-toggle-btn" disabled={loading} onClick={loadMore}><LocalizedMessage source={"Voir plus de sorties"} values={[]} /></button>}
    </div>);

}
