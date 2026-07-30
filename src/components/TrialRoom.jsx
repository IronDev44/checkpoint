import { useMemo, useState } from "react";
import { ArrowLeft, CheckCircle2, Crown, Lock, Shield, Sparkles, XCircle } from "lucide-react";
import { getCheckpointTrial } from "../data/checkpointTrials";

function getShuffledAnswers(question) {
  return question.answers.map((answer, originalIndex) => ({
    answer,
    originalIndex,
    sortKey: Math.abs(
      String(`${question.id}-${answer}-${originalIndex}`)
        .split("")
        .reduce((hash, char) => ((hash << 5) - hash + char.charCodeAt(0)) | 0, 0)
    ),
  })).sort((a, b) => a.sortKey - b.sortKey);
}

export default function TrialRoom({ checkpointLevel, rawXP, onClose, onComplete }) {
  const trial = getCheckpointTrial(checkpointLevel);
  const [phase, setPhase] = useState("intro");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [selectedAnswer, setSelectedAnswer] = useState(null);

  const questions = trial?.questions || [];
  const currentQuestion = questions[currentIndex];
  const currentChoices = useMemo(
    () => (currentQuestion ? getShuffledAnswers(currentQuestion) : []),
    [currentQuestion]
  );
  const score = answers.filter(Boolean).length;
  const passed = trial ? score >= trial.passScore : false;
  const remaining = Math.max(0, questions.length - currentIndex - 1);

  if (!trial) return null;

  const validateAnswer = () => {
    if (!currentQuestion || selectedAnswer === null) return;

    const isCorrect = selectedAnswer === currentQuestion.correctIndex;
    const nextAnswers = [...answers, isCorrect];
    setAnswers(nextAnswers);
    setSelectedAnswer(null);

    if (currentIndex >= questions.length - 1) {
      setPhase("result");
      return;
    }

    setCurrentIndex((value) => value + 1);
  };

  const resetTrial = () => {
    setPhase("intro");
    setCurrentIndex(0);
    setAnswers([]);
    setSelectedAnswer(null);
  };

  return (
    <div className="trial-room-shell">
      <div className="trial-room-bg" aria-hidden="true">
        <span />
        <span />
        <span />
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

        {phase === "intro" && (
          <section className="trial-intro">
            <div className="trial-guardian-orb">
              <Shield size={44} />
            </div>

            <div className="trial-kicker">Nouveau Checkpoint atteint</div>
            <h1>Le Gardien du Checkpoint vous attend.</h1>
            <p>{trial.intro}</p>

            <div className="trial-intro-grid">
              <div>
                <span>XP détectée</span>
                <strong>{rawXP} XP</strong>
              </div>
              <div>
                <span>Score requis</span>
                <strong>{trial.passScore}/{questions.length}</strong>
              </div>
              <div>
                <span>Rang verrouillé</span>
                <strong>{trial.rewardRank}</strong>
              </div>
            </div>

            <button type="button" className="trial-primary-btn" onClick={() => setPhase("questions")}>
              Entrer dans la Salle des Épreuves
              <Sparkles size={18} />
            </button>
          </section>
        )}

        {phase === "questions" && currentQuestion && (
          <section className="trial-question-panel">
            <div className="trial-progress-line">
              <span>Épreuve {currentIndex + 1}/{questions.length}</span>
              <strong>{remaining} restantes</strong>
            </div>

            <div className="trial-question-card">
              <div className="trial-question-kicker">{trial.guardian}</div>
              <h2>{currentQuestion.prompt}</h2>

              <div className="trial-answer-grid">
                {currentChoices.map((choice) => (
                  <button
                    key={`${currentQuestion.id}-${choice.originalIndex}`}
                    type="button"
                    className={`trial-answer-btn ${
                      selectedAnswer === choice.originalIndex ? "selected" : ""
                    }`}
                    onClick={() => setSelectedAnswer(choice.originalIndex)}
                  >
                    <span>{choice.answer}</span>
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              className="trial-primary-btn"
              disabled={selectedAnswer === null}
              onClick={validateAnswer}
            >
              Valider la réponse
            </button>
          </section>
        )}

        {phase === "result" && (
          <section className={`trial-result ${passed ? "passed" : "failed"}`}>
            <div className="trial-result-icon">
              {passed ? <Crown size={48} /> : <Lock size={48} />}
            </div>

            <div className="trial-kicker">
              {passed ? "Épreuve réussie" : "Épreuve échouée"}
            </div>
            <h1>{passed ? trial.rewardRank : "Rang toujours verrouillé"}</h1>
            <p>
              {passed
                ? "Le seuil est franchi. La progression reprend et le nouveau rang est sauvegardé."
                : "Le Gardien referme la porte. Tu pourras retenter l'épreuve plus tard."}
            </p>

            <div className="trial-score-card">
              {passed ? <CheckCircle2 size={22} /> : <XCircle size={22} />}
              <span>Score final</span>
              <strong>{score}/{questions.length}</strong>
            </div>

            <div className="trial-result-actions">
              {passed ? (
                <button type="button" className="trial-primary-btn" onClick={() => onComplete(trial)}>
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
