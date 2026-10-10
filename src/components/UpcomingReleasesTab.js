export default function UpcomingReleasesTab({ releases, renderGame }) {
  const { games, loading, error, month, months, chooseMonth, platform, genre, choosePlatform, chooseGenre, resetFilters, refresh, hasMore, loadMore } = releases;
  const monthLabel = (key) => new Date(`${key}-01T12:00:00`).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
  return (
    <div className="progression-stack upcoming-page">
      <div className="search-panel">
        <h2 className="panel-title">Prochaines sorties</h2>
        <div className="option-value">Sorties datées à partir d’aujourd’hui, sur les six prochains mois.</div>
        <div className="upcoming-filter-grid">
          <label className="upcoming-filter-field"><span>Plateforme</span>
            <select value={platform} onChange={(event) => choosePlatform(event.target.value)}>
              {[
                ['', 'Toutes les plateformes'], ['consoles', 'Consoles'], ['PlayStation 5', 'PS5'],
                ['Xbox Series X|S', 'Xbox Series'], ['Nintendo Switch', 'Switch'],
                ['Nintendo Switch 2', 'Switch 2'], ['PC (Microsoft Windows)', 'PC'],
              ].map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </label>
          <label className="upcoming-filter-field"><span>Genre</span>
            <select value={genre} onChange={(event) => chooseGenre(event.target.value)}>
              {[
                ['', 'Tous les genres'], ['3', 'Aventure'], ['5', 'RPG'], ['2', 'Shooter'], ['1', 'Course'],
                ['10', 'Stratégie'], ['83', 'Plateforme'], ['7', 'Puzzle'], ['15', 'Sport'], ['6', 'Combat'], ['14', 'Simulation'],
              ].map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </label>
          <label className="upcoming-filter-field"><span>Mois</span>
            <select value={month} onChange={(event) => chooseMonth(event.target.value)}>
              <option value="">Tous les mois</option>
              {months.map((key) => <option key={key} value={key}>{monthLabel(key)}</option>)}
            </select>
          </label>
        </div>
        {platform === 'consoles' && <p className="option-value upcoming-filter-note">Les jeux multiplateformes disponibles sur console sont inclus.</p>}
        <div className="upcoming-filter-actions">
          {(month || platform || genre) && <button className="profile-toggle-btn" type="button" onClick={resetFilters}>Tout effacer</button>}
          <button className="profile-toggle-btn" type="button" disabled={loading} onClick={refresh}>Actualiser</button>
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
