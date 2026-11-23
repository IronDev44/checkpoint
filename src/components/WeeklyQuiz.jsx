import { useLanguage, getIntlLocale } from "../i18n/language";import { LocalizedMessage, LocalizedValue, LocalizedElement } from "../i18n/Localized";import { useState } from "react";
import { getQuizAnswerChoices, getWeeklyQuizAnswer } from "../services/weeklyQuiz";
import { WEEKLY_QUIZ_XP } from "../data/weeklyQuiz";
import "./WeeklyQuiz.css";

// Keying the round by week also resets any unsubmitted choice on Monday.
export default function WeeklyQuiz(props) {useLanguage();
  if (!props.quiz?.questions?.length) return null;
  return <QuizRound key={props.quiz.weekKey} {...props} />;
}

function QuizRound({ quiz, progress = {}, onAnswer }) {useLanguage();
  const answers = quiz.questions.map((q) => getWeeklyQuizAnswer(progress, quiz.weekKey, q.id));
  const completed = answers.filter(Boolean).length;
  const [index, setIndex] = useState(() => {
    const first = answers.findIndex((answer) => !answer);
    return first < 0 ? 0 : first;
  });
  const [selected, setSelected] = useState(null);
  const question = quiz.questions[index];
  const answer = answers[index];
  const choices = getQuizAnswerChoices(question);
  const nextDate = new Intl.DateTimeFormat(getIntlLocale(), { timeZone: "Europe/Paris", day: "numeric", month: "long" }).format(new Date(quiz.nextMonday));
  const moveTo = (next) => {setIndex(next);setSelected(null);};
  const allDone = completed === quiz.questions.length;

  return <section className="weekly-quiz-card search-panel" aria-labelledby="weekly-quiz-title">
    <div className="weekly-quiz-heading">
      <div><span className="weekly-quiz-eyebrow"><LocalizedMessage source={"Le rendez-vous du lundi"} values={[]} /></span><h2 id="weekly-quiz-title"><LocalizedMessage source={"Le quiz de la semaine"} values={[]} /></h2></div>
      <span className="weekly-quiz-counter"><LocalizedValue value={completed} /> / <LocalizedValue value={quiz.questions.length} /></span>
    </div>
    <p className="weekly-quiz-intro"><LocalizedMessage source={"{{0}} questions, des univers différents. Tu peux les faire à ton rythme jusqu’à dimanche soir."} values={[quiz.questions.length]} /></p>
    <LocalizedElement __as={"div"} className="weekly-quiz-round-progress" role="progressbar" aria-label="Questions terminées" aria-valuemin={0} aria-valuemax={quiz.questions.length} aria-valuenow={completed}><span style={{ width: `${completed / quiz.questions.length * 100}%` }} /></LocalizedElement>{
    allDone && <p className="weekly-quiz-complete" role="status"><LocalizedMessage source={"C’est tout pour cette semaine ! Prochain quiz le lundi {{0}}. Tu peux relire tes réponses ci-dessous."} values={[nextDate]} /></p>}
    <div className="weekly-quiz-round-meta"><span><LocalizedMessage source={"Question "} values={[]} /><LocalizedValue value={index + 1} /> / <LocalizedValue value={quiz.questions.length} /></span><span><LocalizedValue value={question.category} /> · <LocalizedValue value={question.difficulty} /></span></div>
    <h3 className="weekly-quiz-question"><LocalizedValue value={question.question} /></h3>
    <LocalizedElement __as={"div"} className="weekly-quiz-answers" role="group" aria-label="Choisir une réponse">{
      choices.map((choice, letter) => <button key={choice.originalIndex} type="button"
      className={["weekly-quiz-answer", (answer?.answerIndex ?? selected) === choice.originalIndex ? "selected" : "", answer && choice.originalIndex === question.correctIndex ? "correct" : "", answer && !answer.correct && answer.answerIndex === choice.originalIndex ? "wrong" : ""].join(" ")}
      aria-pressed={(answer?.answerIndex ?? selected) === choice.originalIndex} disabled={!!answer}
      onClick={() => setSelected(choice.originalIndex)}><span aria-hidden="true"><LocalizedValue value={String.fromCharCode(65 + letter)} /></span><strong><LocalizedValue value={choice.answer} /></strong></button>)}
    </LocalizedElement>{
    answer ? <div className={`weekly-quiz-result ${answer.correct ? "correct" : "wrong"}`} role="status">
      <strong><LocalizedValue value={answer.correct ? "Bien joué !" : `La bonne réponse : ${question.answers[question.correctIndex]}`} /></strong>
      <span><LocalizedValue value={question.explanation} /></span><span><LocalizedMessage source={"+{{0}} XP enregistrés"} values={[answer.earnedXP]} /></span>
    </div> : <><button className="checkpoint-primary-action weekly-quiz-submit" type="button" disabled={selected === null} onClick={() => onAnswer?.(selected, { weekKey: quiz.weekKey, questionId: question.id })}><LocalizedMessage source={"Valider ma réponse"} values={[]} /></button><p className="weekly-quiz-reward-note"><LocalizedMessage source={"+{{0}} XP pour une bonne réponse, bonus de série jusqu’à +120 XP. Une tentative par question."} values={[WEEKLY_QUIZ_XP.correct]} /></p></>}
    <LocalizedElement __as={"nav"} className="weekly-quiz-navigation" aria-label="Questions de la semaine">
      <button type="button" disabled={index === 0} onClick={() => moveTo(index - 1)}><LocalizedMessage source={"Précédente"} values={[]} /></button>
      <span><LocalizedValue value={answers[index] ? "Réponse enregistrée" : "À toi de jouer"} /></span>
      <button type="button" disabled={index === quiz.questions.length - 1} onClick={() => moveTo(index + 1)}><LocalizedMessage source={"Suivante"} values={[]} /></button>
    </LocalizedElement>
    <p className="weekly-quiz-footer"><LocalizedMessage source={"Nouvelles questions lundi {{0}} · Série : {{1}} · XP quiz : {{2}}"} values={[nextDate, progress.streak || 0, progress.totalXP || 0]} /></p>
  </section>;
}
