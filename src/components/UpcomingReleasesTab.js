export default function UpcomingReleasesTab({ releases, renderGame }) {
  const { games, loading, error, month, months, chooseMonth, refresh, hasMore, loadMore } = releases;
  const monthLabel = (key) => new Date(`${key}-01T12:00:00`).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
  return (
    <div className="progression-stack">
      <div className="search-panel">
        <h2 className="panel-title">Prochaines sorties</h2>
        <div className="option-value">Sorties datées à partir d’aujourd’hui, sur les six prochains mois.</div>
        <button className="profile-toggle-btn" type="button" disabled={loading} onClick={refresh}>Actualiser les sorties</button>
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
      {!loading && !error && !games.length && <div className="search-panel"><h3>Aucune sortie datée pour cette période</h3><p className="option-value">Choisis un autre mois ou actualise la liste.</p></div>}
      {hasMore && !error && <button type="button" className="profile-toggle-btn" disabled={loading} onClick={loadMore}>Voir plus de sorties</button>}
    </div>
  );
}
