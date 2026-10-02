export default function UpcomingReleasesTab({ releases, renderGame }) {
  const { games, loading, error, month, months, chooseMonth, platform, genre, choosePlatform, chooseGenre, resetFilters, refresh, hasMore, loadMore } = releases;
  const monthLabel = (key) => new Date(`${key}-01T12:00:00`).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
  return (
    <div className="progression-stack">
      <div className="search-panel">
        <h2 className="panel-title">Prochaines sorties</h2>
        <div className="option-value">Sorties datées à partir d’aujourd’hui, sur les six prochains mois.</div>
        <button className="profile-toggle-btn" type="button" disabled={loading} onClick={refresh}>Actualiser les sorties</button>
        <div className="filter-block">
          <div className="filter-label">Plateforme</div>
          <div className="chips-group">
            {[
              ['', 'Toutes'], ['consoles', 'Consoles'], ['PlayStation 5', 'PS5'],
              ['Xbox Series X|S', 'Xbox Series'], ['Nintendo Switch', 'Switch'],
              ['Nintendo Switch 2', 'Switch 2'], ['PC (Microsoft Windows)', 'PC'],
            ].map(([value, label]) => <button key={value} type="button" className={`chip ${platform === value ? 'active' : ''}`} aria-pressed={platform === value} onClick={() => choosePlatform(value)}>{label}</button>)}
          </div>
          <div className="option-value">Consoles inclut aussi les jeux qui sortent sur PC.</div>
        </div>
        <div className="filter-block">
          <div className="filter-label">Genre</div>
          <div className="chips-group">
            {[
              ['', 'Tous'], ['3', 'Aventure'], ['5', 'RPG'], ['2', 'Shooter'], ['1', 'Course'],
              ['10', 'Stratégie'], ['83', 'Plateforme'], ['7', 'Puzzle'], ['15', 'Sport'], ['6', 'Combat'], ['14', 'Simulation'],
            ].map(([value, label]) => <button key={value} type="button" className={`chip ${genre === value ? 'active' : ''}`} aria-pressed={genre === value} onClick={() => chooseGenre(value)}>{label}</button>)}
          </div>
        </div>
        {(month || platform || genre) && <button className="profile-toggle-btn" type="button" onClick={resetFilters}>Réinitialiser les filtres</button>}
        <div className="filter-block month-filter-block">
          <div className="filter-label">Filtrer par mois</div>
          <div className="chips-group">
            <button type="button" className={`chip ${!month ? 'active' : ''}`} aria-pressed={!month} onClick={() => chooseMonth('')}>Tous les mois</button>
            {months.map((key) => <button key={key} type="button" className={`chip ${month === key ? 'active' : ''}`} aria-pressed={month === key} onClick={() => chooseMonth(key)}>{monthLabel(key)}</button>)}
          </div>
        </div>
      </div>
      {loading && <div className="option-value" role="status">Chargement des sorties…</div>}
      {error && <div className="rawg-status-note" role="alert">{error} <button type="button" className="profile-toggle-btn" onClick={refresh}>Réessayer</button></div>}
      {games.length > 0 && <div className="upcoming-list">{games.map(renderGame)}</div>}
      {!loading && !error && !games.length && <div className="search-panel"><h3>Aucune sortie avec ces filtres</h3><p className="option-value">Essaie une autre plateforme, un autre genre ou réinitialise les filtres.</p></div>}
      {hasMore && !error && <button type="button" className="profile-toggle-btn" disabled={loading} onClick={loadMore}>Voir plus de sorties</button>}
    </div>
  );
}
