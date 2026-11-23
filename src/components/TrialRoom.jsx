import { useLanguage } from "../i18n/language";import { LocalizedValue, LocalizedMessage, LocalizedElement } from "../i18n/Localized";import { useEffect, useMemo, useRef, useState } from "react";
import "./TrialRoom.css";
import {
  ArrowLeft,
  CheckCircle2,
  Crown,
  Gem,
  Lock,
  ScanLine,
  Shield,
  Sparkles,
  Swords,
  XCircle,
  Zap } from
"lucide-react";
import { getCheckpointTrial } from "../data/checkpointTrials";

const PRESTIGE_PARTICLE_COUNT = 54;

function getShuffledAnswers(question) {
  return question.answers.
  map((answer, originalIndex) => ({
    answer,
    originalIndex,
    sortKey: Math.abs(
      String(`${question.id}-${answer}-${originalIndex}`).
      split("").
      reduce((hash, char) => (hash << 5) - hash + char.charCodeAt(0) | 0, 0)
    )
  })).
  sort((a, b) => a.sortKey - b.sortKey);
}

export default function TrialRoom({ checkpointLevel, rawXP, onClose, onComplete }) {useLanguage();
  const trial = getCheckpointTrial(checkpointLevel);
  const [phase, setPhase] = useState("intro");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [lastAnswerCorrect, setLastAnswerCorrect] = useState(null);

  const answerTimer = useRef(null);
  useEffect(() => () => window.clearTimeout(answerTimer.current), []);
  const questions = trial?.questions || [];
  const currentQuestion = questions[currentIndex];
  const currentChoices = useMemo(
    () => currentQuestion ? getShuffledAnswers(currentQuestion) : [],
    [currentQuestion]
  );
  const score = answers.filter(Boolean).length;
  const passed = trial ? score >= trial.passScore : false;
  const progressPercent = questions.length ?
  Math.round((currentIndex + (phase === "result" ? 1 : 0)) / questions.length * 100) :
  0;
  const remaining = Math.max(0, questions.length - currentIndex - 1);
  const phaseClass = `phase-${phase} ${phase === "result" ? passed ? "passed" : "failed" : ""}`;
  const prestigeParticles = useMemo(
    () =>
    Array.from({ length: PRESTIGE_PARTICLE_COUNT }, (_, index) => ({
      id: index,
      angle: 360 / PRESTIGE_PARTICLE_COUNT * index,
      distance: 120 + index % 8 * 22,
      size: 3 + index % 5,
      delay: index % 9 * 0.045
    })),
    []
  );

  if (!trial) return null;

  const validateAnswer = () => {
    if (!currentQuestion || selectedAnswer === null || lastAnswerCorrect !== null) return;

    const isCorrect = selectedAnswer === currentQuestion.correctIndex;
    const nextAnswers = [...answers, isCorrect];

    setAnswers(nextAnswers);
    setLastAnswerCorrect(isCorrect);
    answerTimer.current = window.setTimeout(() => {
      setLastAnswerCorrect(null);
      setSelectedAnswer(null);
      if (currentIndex >= questions.length - 1) {
        setPhase("result");
        return;
      }
      setCurrentIndex((value) => value + 1);
    }, 420);
  };

  const resetTrial = () => {
    setPhase("intro");
    setCurrentIndex(0);
    setAnswers([]);
    setSelectedAnswer(null);
    setLastAnswerCorrect(null);
  };

  return (
    <div className={`trial-room-shell trial-premium ${phaseClass}`}>
      <div className="trial-room-bg" aria-hidden="true">
        <span />
        <span />
        <span />
        <div className="trial-room-grid" />
        <div className="trial-room-scan" />
        <div className="trial-prestige-burst">{
          prestigeParticles.map((particle) =>
          <i
            key={particle.id}
            style={{
              "--angle": `${particle.angle}deg`,
              "--distance": `${particle.distance}px`,
              "--particle-size": `${particle.size}px`,
              "--particle-delay": `${particle.delay}s`
            }} />

          )}
        </div>
      </div>

      <div className="trial-room-frame">
        <header className="trial-room-header">
          <button type="button" className="trial-ghost-btn" onClick={onClose}>
            <ArrowLeft size={18} /><LocalizedMessage source={"Sortir"} values={[]} />

          </button>

          <div className="trial-room-status">
            <span>Checkpoint <LocalizedValue value={trial.level} /></span>
            <strong><LocalizedValue value={trial.title} /></strong>
          </div>
        </header>

        <div className="trial-topline" aria-hidden="true">
          <span style={{ width: `${Math.min(progressPercent, 100)}%` }} />
        </div>

        {phase === "intro" &&
        <section className="trial-intro">
            <div className="trial-gate-stage">
              <div className="trial-gate-ring" />
              <div className="trial-guardian-orb">
                <span className="trial-seal-label">CHECKPOINT</span><strong className="trial-seal-level"><LocalizedValue value={trial.level} /></strong><span className="trial-seal-caption"><LocalizedValue value={trial.rewardRank} /></span>
              </div>
              <div className="trial-gate-beam" />
            </div>

            <div className="trial-kicker"><Sparkles size={14} /><LocalizedMessage source={" Salle des épreuves"} values={[]} /></div>
            <h1><LocalizedValue value={trial.title} /></h1>
            <p><LocalizedValue value={trial.intro} /></p>

            <div className="trial-intro-grid">
              <div>
                <span><LocalizedMessage source={"XP accumulée"} values={[]} /></span>
                <strong><LocalizedValue value={rawXP} /> XP</strong>
              </div>
              <div>
                <span><LocalizedMessage source={"Score requis"} values={[]} /></span>
                <strong><LocalizedValue value={trial.passScore} />/<LocalizedValue value={questions.length} /></strong>
              </div>
              <div>
                <span><LocalizedMessage source={"Prochain rang"} values={[]} /></span>
                <strong><LocalizedValue value={trial.rewardRank} /></strong>
              </div>
            </div>{

          trial.reward &&
          <div
            className="trial-reward-preview"
            style={{ "--trial-reward-accent": trial.reward.accent }}>

                <div className="trial-reward-medal">
                  <span><LocalizedValue value={trial.reward.badgeIcon} /></span>
                  <Gem size={20} />
                </div>
                <div>
                  <span><LocalizedValue value={trial.reward.title} /></span>
                  <strong><LocalizedValue value={trial.reward.badgeName} /></strong>
                  <small><LocalizedValue value={trial.reward.description} /></small>
                </div>
              </div>}


          <div className="trial-guardian-message">
              <ScanLine size={18} />
              <span><LocalizedMessage source={"{{0}} analyse ton profil. Une seule règle : franchir le seuil."} values={[trial.guardian]} /></span>
            </div>

            <button type="button" className="trial-primary-btn trial-enter-btn" onClick={() => setPhase("questions")}><LocalizedMessage source={"Lancer l’épreuve"} values={[]} />

            <Swords size={18} />
            </button>
          </section>}


        {phase === "questions" && currentQuestion &&
        <section className="trial-question-panel">
            <div className="trial-progress-line">
              <span><LocalizedMessage source={"Épreuve {{0}}/{{1}}"} values={[currentIndex + 1, questions.length]} /></span>
              <strong><LocalizedValue value={remaining} /><LocalizedMessage source={" restantes"} values={[]} /></strong>
            </div>

            <LocalizedElement __as={"div"} className="trial-step-track" aria-label="Progression des réponses">{questions.map((question, index) => <LocalizedElement __as={"span"} key={question.id} className={index < answers.length ? answers[index] ? "done" : "missed" : index === currentIndex ? "current" : ""} aria-label={"Question " + (index + 1) + ": " + (index < answers.length ? answers[index] ? "réussie" : "répondue" : index === currentIndex ? "en cours" : "à venir")}>{index < answers.length && answers[index] ? <CheckCircle2 size={16} /> : index + 1}</LocalizedElement>)}</LocalizedElement>
            <div className="trial-arena">
              <aside className="trial-guardian-panel">
                <div className="trial-guardian-avatar">
                  <Shield size={28} />
                </div>
                <span><LocalizedMessage source={"Gardien actif"} values={[]} /></span>
                <strong><LocalizedValue value={trial.guardian} /></strong>
                <small><LocalizedMessage source={"Score actuel : "} values={[]} /><LocalizedValue value={score} />/<LocalizedValue value={questions.length} /></small>
              </aside>

              <div className="trial-question-card">
                <div className="trial-question-kicker">
                  <Zap size={15} /><LocalizedMessage source={"Verrou de connaissance"} values={[]} />

              </div>
                <h2><LocalizedValue value={currentQuestion.prompt} /></h2>

                <div className="trial-answer-grid">{
                currentChoices.map((choice, index) => {
                  const isSelected = selectedAnswer === choice.originalIndex;
                  const revealState =
                  lastAnswerCorrect === null ?
                  "" :
                  choice.originalIndex === currentQuestion.correctIndex ?
                  "correct" :
                  isSelected ?
                  "wrong" :
                  "";

                  return (
                    <button
                      key={`${currentQuestion.id}-${choice.originalIndex}`}
                      type="button"
                      className={`trial-answer-btn ${isSelected ? "selected" : ""} ${revealState}`}
                      onClick={() => setSelectedAnswer(choice.originalIndex)}
                      disabled={lastAnswerCorrect !== null}>

                        <b><LocalizedValue value={String.fromCharCode(65 + index)} /></b>
                        <span><LocalizedValue value={choice.answer} /></span>
                      </button>);

                })}
              </div>
              </div>
            </div>

            <div className="trial-answer-feedback" role="status" aria-live="polite"><LocalizedValue value={lastAnswerCorrect === true ? "Bien joué ! Un pas de plus vers ton rang." : lastAnswerCorrect === false ? "On garde le rythme, place à la suite !" : "Choisis ta réponse, puis valide pour continuer."} /></div>
            <button type="button" className="trial-primary-btn" disabled={selectedAnswer === null || lastAnswerCorrect !== null}
          onClick={validateAnswer}><LocalizedValue value={

            lastAnswerCorrect !== null ? "Réponse enregistrée" : "Valider ma réponse"} />
            <Sparkles size={18} />
            </button>
          </section>}


        {phase === "result" &&
        <section className={`trial-result ${passed ? "passed" : "failed"}`}>
            <div className="trial-result-aura" aria-hidden="true" />{
          passed &&
          <div className="trial-prestige-title" aria-hidden="true">
                <span><LocalizedMessage source={"PRESTIGE"} values={[]} /></span>
                <strong><LocalizedMessage source={"CHECKPOINT UNLOCKED"} values={[]} /></strong>
              </div>}

          <div className="trial-result-icon">{
            passed ? <Crown size={52} /> : <Lock size={52} />}
          </div>

            <div className="trial-kicker"><LocalizedValue value={
            passed ? "Épreuve réussie" : "Encore un essai ?"} />
          </div>
            <h1><LocalizedValue value={passed ? trial.rewardRank : "Tu y es presque"} /></h1>
            <p><LocalizedValue value={
            passed ?
            "Le sceau s'ouvre. Le rang est révélé et la progression reprend." :
            "Ton XP reste bien au chaud. Reviens quand tu veux pour décrocher ce rang."} />
          </p>

            <div className="trial-score-card">{
            passed ? <CheckCircle2 size={22} /> : <XCircle size={22} />}
            <span><LocalizedMessage source={"Score final"} values={[]} /></span>
              <strong><LocalizedValue value={score} />/<LocalizedValue value={questions.length} /></strong>
            </div>{

          passed && trial.reward &&
          <div
            className="trial-reward-unlocked"
            style={{ "--trial-reward-accent": trial.reward.accent }}>

                <div className="trial-reward-medal">
                  <span><LocalizedValue value={trial.reward.badgeIcon} /></span>
                  <Gem size={20} />
                </div>
                <div>
                  <span><LocalizedMessage source={"Badge exclusif debloque"} values={[]} /></span>
                  <strong><LocalizedValue value={trial.reward.badgeName} /></strong>
                  <small><LocalizedValue value={trial.reward.description} /></small>
                </div>
              </div>}


          <div className="trial-result-actions">{
            passed ?
            <button
              type="button"
              className="trial-primary-btn trial-reveal-btn"
              onClick={() => onComplete(trial, { score, totalQuestions: questions.length })}><LocalizedMessage source={"Révéler le rang"} values={[]} />


              <Sparkles size={18} />
                </button> :

            <>
                  <button type="button" className="trial-secondary-btn" onClick={resetTrial}><LocalizedMessage source={"Recommencer"} values={[]} />

              </button>
                  <button type="button" className="trial-primary-btn" onClick={onClose}><LocalizedMessage source={"Revenir plus tard"} values={[]} />

              </button>
                </>}

          </div>
          </section>}

      </div>
    </div>);

}
