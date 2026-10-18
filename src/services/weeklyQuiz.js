import { WEEKLY_QUIZ_QUESTIONS, WEEKLY_QUIZ_XP } from "../data/weeklyQuiz";

export const WEEKLY_QUIZ_SIZE = 5;
const DAY = 86400000;
const EPOCH = Date.UTC(2026, 0, 5);

// The editorial week follows France, including when a device is used abroad.
function parisDay(date) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Paris", year: "numeric", month: "2-digit", day: "2-digit",
  }).formatToParts(date);
  const value = type => Number(parts.find(part => part.type === type).value);
  return new Date(Date.UTC(value("year"), value("month") - 1, value("day")));
}

export function getWeeklyQuizKey(date = new Date()) {
  const current = parisDay(date);
  current.setUTCDate(current.getUTCDate() + 4 - (current.getUTCDay() || 7));
  const year = current.getUTCFullYear();
  const week = Math.ceil(((current - Date.UTC(year, 0, 1)) / DAY + 1) / 7);
  return `${year}-W${String(week).padStart(2, "0")}`;
}

function weekMonday(weekKey) {
  const match = /^(\d{4})-W(\d{2})$/.exec(weekKey || "");
  if (!match || Number(match[2]) < 1 || Number(match[2]) > 53) return null;
  const date = new Date(Date.UTC(Number(match[1]), 0, 4));
  date.setUTCDate(date.getUTCDate() - (date.getUTCDay() || 7) + 1 + (Number(match[2]) - 1) * 7);
  return date;
}

export function getPreviousWeeklyQuizKey(weekKey) {
  const monday = weekMonday(weekKey);
  if (!monday) return "";
  return getWeeklyQuizKey(new Date(monday.getTime() - 7 * DAY + 12 * 3600000));
}

function hash(value) {
  return [...value].reduce((result, char) => Math.imul(result ^ char.charCodeAt(0), 16777619) >>> 0, 2166136261);
}

// A fixed editorial deck, dealt without replacement. Avoid adjacent questions
// from the same category inside a weekly pack whenever the bank allows it.
function makeDeck() {
  const remaining = [...WEEKLY_QUIZ_QUESTIONS].sort((a, b) => hash(`season-1:${a.id}`) - hash(`season-1:${b.id}`) || a.id.localeCompare(b.id));
  const deck = [];
  while (remaining.length) {
    const used = new Set();
    for (let slot = 0; slot < WEEKLY_QUIZ_SIZE && remaining.length; slot += 1) {
      const preferred = slot === 0 ? "facile" : slot === 4 ? "difficile" : "moyen";
      let index = remaining.findIndex(q => !used.has(q.category) && q.difficulty === preferred);
      if (index < 0) index = remaining.findIndex(q => !used.has(q.category));
      if (index < 0) index = 0;
      const [question] = remaining.splice(index, 1);
      used.add(question.category);
      deck.push(question);
    }
  }
  return deck;
}
const DECK = makeDeck();

export function getWeeklyQuiz(weekKey = getWeeklyQuizKey()) {
  const monday = weekMonday(weekKey);
  if (!monday || !DECK.length) return { weekKey, questions: [] };
  const packs = Math.ceil(DECK.length / WEEKLY_QUIZ_SIZE);
  const weekIndex = Math.floor((monday.getTime() - EPOCH) / (7 * DAY));
  const pack = ((weekIndex % packs) + packs) % packs;
  const questions = DECK.slice(pack * WEEKLY_QUIZ_SIZE, (pack + 1) * WEEKLY_QUIZ_SIZE);
  const nextMonday = new Date(monday.getTime() + 7 * DAY);
  return { weekKey, questions, nextMonday: nextMonday.toISOString() };
}

export function getQuizAnswerKey(weekKey, questionId) {
  return `${weekKey}:${questionId}`;
}

export function getWeeklyQuizAnswer(progress, weekKey, questionId) {
  const answers = progress?.answers || {};
  const answer = answers[getQuizAnswerKey(weekKey, questionId)];
  if (answer) return answer;
  // Preserve the old one-question weekly format, but never confuse free-play
  // history with a submission to the new weekly pack.
  return answers[weekKey]?.questionId === questionId ? answers[weekKey] : null;
}

export function getQuizAnswerChoices(question) {
  return (question?.answers || []).map((answer, originalIndex) => ({ answer, originalIndex }))
    .sort((a, b) => hash(`${question.id}:${a.answer}`) - hash(`${question.id}:${b.answer}`));
}

// Returns null for an old week, a forged question, an invalid answer or a replay.
// The caller owns persistence; earned XP from the previous quiz remains intact.
export function submitWeeklyQuizAnswer(progress, { weekKey, questionId, answerIndex }, now = new Date()) {
  if (weekKey !== getWeeklyQuizKey(now)) return null;
  const quiz = getWeeklyQuiz(weekKey);
  const question = quiz.questions.find(item => item.id === questionId);
  if (!question || !Number.isInteger(answerIndex) || answerIndex < 0 || answerIndex >= question.answers.length) return null;
  if (getWeeklyQuizAnswer(progress, weekKey, questionId)) return null;
  const correct = answerIndex === question.correctIndex;
  const lastWeek = progress.lastAnsweredWeek || progress.lastCorrectWeek;
  const continued = lastWeek === weekKey || lastWeek === getPreviousWeeklyQuizKey(weekKey);
  const streak = correct ? (continued ? (Number(progress.streak) || 0) : 0) + 1 : 0;
  const earnedXP = correct ? WEEKLY_QUIZ_XP.correct + Math.min(streak - 1, 4) * WEEKLY_QUIZ_XP.streakBonus : WEEKLY_QUIZ_XP.participation;
  const answer = { questionId, answerIndex, correct, earnedXP, mode: "weekly", answeredAt: now.toISOString() };
  return {
    ...progress,
    totalXP: (Number(progress.totalXP) || 0) + earnedXP,
    streak,
    bestStreak: Math.max(Number(progress.bestStreak) || 0, streak),
    lastAnsweredWeek: weekKey,
    lastCorrectWeek: correct ? weekKey : (progress.lastCorrectWeek || ""),
    answers: { ...(progress.answers || {}), [getQuizAnswerKey(weekKey, questionId)]: answer },
  };
}
