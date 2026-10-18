import { useState } from "react";
import { getQuizAnswerChoices, getWeeklyQuizAnswer } from "../services/weeklyQuiz";
import { WEEKLY_QUIZ_XP } from "../data/weeklyQuiz";
import "./WeeklyQuiz.css";

// Keying the round by week also resets any unsubmitted choice on Monday.
export default function WeeklyQuiz(props) {
  if (!props.quiz?.questions?.length) return null;
  return <QuizRound key={props.quiz.weekKey} {...props}/>;
}

function QuizRound({ quiz, progress = {}, onAnswer }) {
  const answers = quiz.questions.map(q => getWeeklyQuizAnswer(progress, quiz.weekKey, q.id));
  const completed = answers.filter(Boolean).length;
  const [index, setIndex] = useState(() => {
    const first = answers.findIndex(answer => !answer);
    return first < 0 ? 0 : first;
  });
  const [selected, setSelected] = useState(null);
  const question = quiz.questions[index];
  const answer = answers[index];
  const choices = getQuizAnswerChoices(question);
  const nextDate = new Intl.DateTimeFormat("fr-FR", { timeZone: "Europe/Paris", day: "numeric", month: "long" }).format(new Date(quiz.nextMonday));
  const moveTo = next => { setIndex(next); setSelected(null); };
  const allDone = completed === quiz.questions.length;

  return <section className="weekly-quiz-card search-panel" aria-labelledby="weekly-quiz-title">
    <div className="weekly-quiz-heading">
      <div><span className="weekly-quiz-eyebrow">Le rendez-vous du lundi</span><h2 id="weekly-quiz-title">Le quiz de la semaine</h2></div>
      <span className="weekly-quiz-counter">{completed} / {quiz.questions.length}</span>
    </div>
    <p className="weekly-quiz-intro">{quiz.questions.length} questions, des univers différents. Tu peux les faire à ton rythme jusqu’à dimanche soir.</p>
    <div className="weekly-quiz-round-progress" role="progressbar" aria-label="Questions terminées" aria-valuemin={0} aria-valuemax={quiz.questions.length} aria-valuenow={completed}><span style={{width:`${completed / quiz.questions.length * 100}%`}}/></div>
    {allDone && <p className="weekly-quiz-complete" role="status">C’est tout pour cette semaine ! Prochain quiz le lundi {nextDate}. Tu peux relire tes réponses ci-dessous.</p>}
    <div className="weekly-quiz-round-meta"><span>Question {index + 1} / {quiz.questions.length}</span><span>{question.category} · {question.difficulty}</span></div>
    <h3 className="weekly-quiz-question">{question.question}</h3>
    <div className="weekly-quiz-answers" role="group" aria-label="Choisir une réponse">
      {choices.map((choice, letter) => <button key={choice.originalIndex} type="button"
        className={["weekly-quiz-answer", (answer?.answerIndex ?? selected) === choice.originalIndex ? "selected" : "", answer && choice.originalIndex === question.correctIndex ? "correct" : "", answer && !answer.correct && answer.answerIndex === choice.originalIndex ? "wrong" : ""].join(" ")}
        aria-pressed={(answer?.answerIndex ?? selected) === choice.originalIndex} disabled={!!answer}
        onClick={() => setSelected(choice.originalIndex)}><span aria-hidden="true">{String.fromCharCode(65 + letter)}</span><strong>{choice.answer}</strong></button>)}
    </div>
    {answer ? <div className={`weekly-quiz-result ${answer.correct ? "correct" : "wrong"}`} role="status">
      <strong>{answer.correct ? "Bien joué !" : `La bonne réponse : ${question.answers[question.correctIndex]}`}</strong>
      <span>{question.explanation}</span><span>+{answer.earnedXP} XP enregistrés</span>
    </div> : <><button className="checkpoint-primary-action weekly-quiz-submit" type="button" disabled={selected === null} onClick={() => onAnswer?.(selected, { weekKey:quiz.weekKey, questionId:question.id })}>Valider ma réponse</button><p className="weekly-quiz-reward-note">+{WEEKLY_QUIZ_XP.correct} XP pour une bonne réponse, bonus de série jusqu’à +120 XP. Une tentative par question.</p></>}
    <nav className="weekly-quiz-navigation" aria-label="Questions de la semaine">
      <button type="button" disabled={index === 0} onClick={() => moveTo(index - 1)}>Précédente</button>
      <span>{answers[index] ? "Réponse enregistrée" : "À toi de jouer"}</span>
      <button type="button" disabled={index === quiz.questions.length - 1} onClick={() => moveTo(index + 1)}>Suivante</button>
    </nav>
    <p className="weekly-quiz-footer">Nouvelles questions lundi {nextDate} · Série : {progress.streak || 0} · XP quiz : {progress.totalXP || 0}</p>
  </section>;
}
