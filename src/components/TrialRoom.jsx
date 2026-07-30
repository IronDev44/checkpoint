import { useMemo, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  Crown,
  Lock,
  ScanLine,
  Shield,
  Sparkles,
  Swords,
  XCircle,
  Zap,
} from "lucide-react";
import { getCheckpointTrial } from "../data/checkpointTrials";

const PRESTIGE_PARTICLE_COUNT = 54;

function getShuffledAnswers(question) {
  return question.answers
    .map((answer, originalIndex) => ({
      answer,
      originalIndex,
      sortKey: Math.abs(
        String(`${question.id}-${answer}-${originalIndex}`)
          .split("")
          .reduce((hash, char) => ((hash << 5) - hash + char.charCodeAt(0)) | 0, 0)
      ),
    }))
    .sort((a, b) => a.sortKey - b.sortKey);
}

export default function TrialRoom({ checkpointLevel, rawXP, onClose, onComplete }) {
  const trial = getCheckpointTrial(checkpointLevel);
  const [phase, setPhase] = useState("intro");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [lastAnswerCorrect, setLastAnswerCorrect] = useState(null);

  const questions = trial?.questions || [];
  const currentQuestion = questions[currentIndex];
  const currentChoices = useMemo(
    () => (currentQuestion ? getShuffledAnswers(currentQuestion) : []),
    [currentQuestion]
  );
  const score = answers.filter(Boolean).length;
  const passed = trial ? score >= trial.passScore : false;
  const progressPercent = questions.length
    ? Math.round(((currentIndex + (phase === "result" ? 1 : 0)) / questions.length) * 100)
    : 0;
  const remaining = Math.max(0, questions.length - currentIndex - 1);
  const phaseClass = `phase-${phase}`;
  const prestigeParticles = useMemo(
    () =>
      Array.from({ length: PRESTIGE_PARTICLE_COUNT }, (_, index) => ({
        id: index,
        angle: (360 / PRESTIGE_PARTICLE_COUNT) * index,
        distance: 120 + (index % 8) * 22,
        size: 3 + (index % 5),
        delay: (index % 9) * 0.045,
      })),
    []
  );

  if (!trial) return null;

  const validateAnswer = () => {
    if (!currentQuestion || selectedAnswer === null) return;

    const isCorrect = selectedAnswer === currentQuestion.correctIndex;
    const nextAnswers = [...answers, isCorrect];

    setAnswers(nextAnswers);
    setLastAnswerCorrect(isCorrect);
    setSelectedAnswer(null);

    window.setTimeout(() => {
      setLastAnswerCorrect(null);
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
    <div className={`trial-room-shell ${phaseClass}`}>
      <div className="trial-room-bg" aria-hidden="true">
        <span />
        <span />
        <span />
        <div className="trial-room-grid" />
        <div className="trial-room-scan" />
        <div className="trial-prestige-burst">
          {prestigeParticles.map((particle) => (
            <i
              key={particle.id}
              style={{
                "--angle": `${particle.angle}deg`,
                "--distance": `${particle.distance}px`,
                "--particle-size": `${particle.size}px`,
                "--particle-delay": `${particle.delay}s`,
              }}
            />
          ))}
        </div>
      </div>

      <div className="trial-room-frame">
        <header className="trial-room-header">
          <button type="button" className="trial-ghost-btn" onClick={onClose}>
            <ArrowLeft size={18} />
            Sortir
          </button>

          <div className="trial-room-status">
            <span>Checkpoint {trial.level}</span>
            <strong>{trial.title}</strong>
          </div>
        </header>

        <div className="trial-topline" aria-hidden="true">
          <span style={{ width: `${Math.min(progressPercent, 100)}%` }} />
        </div>

        {phase === "intro" && (
          <section className="trial-intro">
            <div className="trial-gate-stage">
              <div className="trial-gate-ring" />
              <div className="trial-guardian-orb">
                <Shield size={48} />
              </div>
              <div className="trial-gate-beam" />
            </div>

            <div className="trial-kicker">Nouveau Checkpoint atteint</div>
            <h1>Le Gardien du Checkpoint vous attend.</h1>
            <p>{trial.intro}</p>

            <div className="trial-intro-grid">
              <div>
                <span>XP verrouillée</span>
                <strong>{rawXP} XP</strong>
              </div>
              <div>
                <span>Score requis</span>
                <strong>{trial.passScore}/{questions.length}</strong>
              </div>
              <div>
                <span>Rang scellé</span>
                <strong>{trial.rewardRank}</strong>
              </div>
            </div>

            <div className="trial-guardian-message">
              <ScanLine size={18} />
              <span>{trial.guardian} analyse ton profil. Une seule règle : franchir le seuil.</span>
            </div>

            <button type="button" className="trial-primary-btn trial-enter-btn" onClick={() => setPhase("questions")}>
              Entrer dans la Salle des Épreuves
              <Swords size={18} />
            </button>
          </section>
        )}

        {phase === "questions" && currentQuestion && (
          <section className="trial-question-panel">
            <div className="trial-progress-line">
              <span>Épreuve {currentIndex + 1}/{questions.length}</span>
              <strong>{remaining} restantes</strong>
            </div>

            <div className="trial-arena">
              <aside className="trial-guardian-panel">
                <div className="trial-guardian-avatar">
                  <Shield size={28} />
                </div>
                <span>Gardien actif</span>
                <strong>{trial.guardian}</strong>
                <small>Score actuel : {score}/{questions.length}</small>
              </aside>

              <div className="trial-question-card">
                <div className="trial-question-kicker">
                  <Zap size={15} />
                  Verrou de connaissance
                </div>
                <h2>{currentQuestion.prompt}</h2>

                <div className="trial-answer-grid">
                  {currentChoices.map((choice, index) => {
                    const isSelected = selectedAnswer === choice.originalIndex;
                    const revealState =
                      lastAnswerCorrect === null
                        ? ""
                        : choice.originalIndex === currentQuestion.correctIndex
                          ? "correct"
                          : isSelected
                            ? "wrong"
                            : "";

                    return (
                      <button
                        key={`${currentQuestion.id}-${choice.originalIndex}`}
                        type="button"
                        className={`trial-answer-btn ${isSelected ? "selected" : ""} ${revealState}`}
                        onClick={() => setSelectedAnswer(choice.originalIndex)}
                        disabled={lastAnswerCorrect !== null}
                      >
                        <b>{String.fromCharCode(65 + index)}</b>
                        <span>{choice.answer}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <button
              type="button"
              className="trial-primary-btn"
              disabled={selectedAnswer === null || lastAnswerCorrect !== null}
              onClick={validateAnswer}
            >
              Verrouiller la réponse
              <Sparkles size={18} />
            </button>
          </section>
        )}

        {phase === "result" && (
          <section className={`trial-result ${passed ? "passed" : "failed"}`}>
            <div className="trial-result-aura" aria-hidden="true" />
            {passed && (
              <div className="trial-prestige-title" aria-hidden="true">
                <span>PRESTIGE</span>
                <strong>CHECKPOINT UNLOCKED</strong>
              </div>
            )}
            <div className="trial-result-icon">
              {passed ? <Crown size={52} /> : <Lock size={52} />}
            </div>

            <div className="trial-kicker">
              {passed ? "Épreuve réussie" : "Épreuve échouée"}
            </div>
            <h1>{passed ? trial.rewardRank : "Rang toujours verrouillé"}</h1>
            <p>
              {passed
                ? "Le sceau s'ouvre. Le rang est révélé, la progression reprend et Firebase reçoit la validation."
                : "Le Gardien referme la porte. Le rang reste verrouillé, mais l'épreuve pourra être retentée."}
            </p>

            <div className="trial-score-card">
              {passed ? <CheckCircle2 size={22} /> : <XCircle size={22} />}
              <span>Score final</span>
              <strong>{score}/{questions.length}</strong>
            </div>

            <div className="trial-result-actions">
              {passed ? (
                <button type="button" className="trial-primary-btn trial-reveal-btn" onClick={() => onComplete(trial)}>
                  Révéler le rang
                  <Sparkles size={18} />
                </button>
              ) : (
                <>
                  <button type="button" className="trial-secondary-btn" onClick={resetTrial}>
                    Recommencer
                  </button>
                  <button type="button" className="trial-primary-btn" onClick={onClose}>
                    Revenir plus tard
                  </button>
                </>
              )}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
