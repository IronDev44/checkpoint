import { useLanguage } from "../i18n/language";import { LocalizedMessage, LocalizedValue } from "../i18n/Localized";import { useRef, useState } from 'react';
import ToolDialog from './ToolDialog';
import { journeyPatch } from '../services/gameJourney';
import './GeneralPolish.css';

export default function QuickCollectionAdd({ game, onSave, onClose }) {useLanguage();
  const [busy, setBusy] = useState(false),[error, setError] = useState('');
  const lock = useRef(false);
  async function choose(state) {
    if (lock.current) return;
    lock.current = true;setBusy(true);setError('');
    try {
      const saved = await onSave({ ...game, ...journeyPatch({ ...game, status: 'collection' }, state) });
      if (saved === false) throw new Error('Le jeu n’a pas été ajouté. Réessaie ou ferme cette fenêtre.');
      onClose();
    } catch (reason) {setError(reason.message || 'Impossible d’ajouter ce jeu pour le moment.');} finally
    {lock.current = false;setBusy(false);}
  }
  return <ToolDialog title="Ajouter à ma collection" busy={busy} onClose={() => {if (!lock.current) onClose();}}>
    <div className="quick-collection-add"><h3>{game.name}</h3><p><LocalizedMessage source={"Où en es-tu avec ce jeu ? Tu pourras ajouter une note et un avis plus tard."} values={[]} /></p>
      <div className="quick-collection-choices">
        <button type="button" disabled={busy} onClick={() => choose('in_progress')}><strong><LocalizedMessage source={"Je commence"} values={[]} /></strong><span><LocalizedMessage source={"Le retrouver dans En cours."} values={[]} /></span></button>
        <button type="button" disabled={busy} onClick={() => choose('completed')}><strong><LocalizedMessage source={"Déjà terminé"} values={[]} /></strong><span><LocalizedMessage source={"Garder ce jeu dans mon parcours, sans note imposée."} values={[]} /></span></button>
        <button type="button" disabled={busy} onClick={() => choose('not_started')}><strong><LocalizedMessage source={"Pour plus tard"} values={[]} /></strong><span><LocalizedMessage source={"Dans ma collection, pas encore commencé."} values={[]} /></span></button>
      </div>{busy && <p role="status"><LocalizedMessage source={"Ajout en cours…"} values={[]} /></p>}{error && <p role="alert"><LocalizedValue value={error} /></p>}
    </div>
  </ToolDialog>;
}
