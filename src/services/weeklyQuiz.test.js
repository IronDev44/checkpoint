import { WEEKLY_QUIZ_QUESTIONS } from "../data/weeklyQuiz";
import { CHECKPOINT_TRIALS } from "../data/checkpointTrials";
import { getWeeklyQuiz, getWeeklyQuizKey, getPreviousWeeklyQuizKey, getQuizAnswerChoices, getWeeklyQuizAnswer, submitWeeklyQuizAnswer } from "./weeklyQuiz";

const now = new Date("2026-10-21T12:00:00Z");
const quiz = getWeeklyQuiz(getWeeklyQuizKey(now));
const request = (q = quiz.questions[0], index = q.correctIndex) => ({ weekKey:quiz.weekKey, questionId:q.id, answerIndex:index });

test("editorial bank has unique questions, four distinct answers and no invalid solutions", () => {
  expect(WEEKLY_QUIZ_QUESTIONS).toHaveLength(260);
  expect(new Set(WEEKLY_QUIZ_QUESTIONS.map(q=>q.id)).size).toBe(260);
  expect(new Set(WEEKLY_QUIZ_QUESTIONS.map(q=>q.question.toLocaleLowerCase("fr")) ).size).toBe(260);
  for (const q of WEEKLY_QUIZ_QUESTIONS) {
    expect(q.answers).toHaveLength(4);
    expect(new Set(q.answers.map(a=>a.toLocaleLowerCase("fr"))).size).toBe(4);
    expect(Number.isInteger(q.correctIndex)).toBe(true);
    expect(q.answers[q.correctIndex]).toBeTruthy();
    expect(q.explanation.length).toBeGreaterThan(20);
    expect(getQuizAnswerChoices(q).find(a=>a.originalIndex===q.correctIndex).answer).toBe(q.answers[q.correctIndex]);
  }
  expect(CHECKPOINT_TRIALS.flatMap(t=>t.questions).some(q=>q.prompt.includes("popularisé les cartouches"))).toBe(false);
});

test("52 successive weeks contain 260 different questions, with a stable pack after reload", () => {
  const all = [];
  for (let week=0; week<52; week+=1) {
    const key=getWeeklyQuizKey(new Date(Date.UTC(2026,0,5+week*7,12)));
    const pack=getWeeklyQuiz(key);
    expect(pack.questions).toHaveLength(5);
    expect(new Set(pack.questions.map(q=>q.category)).size).toBeGreaterThanOrEqual(3);
    expect(getWeeklyQuiz(key)).toEqual(pack);
    all.push(...pack.questions.map(q=>q.id));
  }
  expect(new Set(all).size).toBe(260);
  expect(getWeeklyQuiz("invalid").questions).toEqual([]);
});

test("the week changes on Monday midnight in Paris across DST and ISO year boundaries", () => {
  expect(getWeeklyQuizKey(new Date("2026-10-18T21:59:59Z"))).toBe("2026-W42");
  expect(getWeeklyQuizKey(new Date("2026-10-18T22:00:00Z"))).toBe("2026-W43");
  expect(getWeeklyQuizKey(new Date("2026-10-25T22:59:59Z"))).toBe("2026-W43");
  expect(getWeeklyQuizKey(new Date("2026-10-25T23:00:00Z"))).toBe("2026-W44");
  expect(getWeeklyQuizKey(new Date("2027-01-01T12:00:00Z"))).toBe("2026-W53");
  expect(getPreviousWeeklyQuizKey("2027-W01")).toBe("2026-W53");
});

test("submissions are idempotent, validate the weekly selection and preserve existing XP/history", () => {
  const original={totalXP:500,answers:{"free-old-question":{earnedXP:120}},streak:3,bestStreak:3};
  const next=submitWeeklyQuizAnswer(original,request(),now);
  expect(next.totalXP).toBe(620);
  expect(next.answers["free-old-question"]).toEqual(original.answers["free-old-question"]);
  expect(submitWeeklyQuizAnswer(next,request(),now)).toBeNull();
  expect(submitWeeklyQuizAnswer(original,{...request(),questionId:"not-this-week"},now)).toBeNull();
  for(const answerIndex of [-1,4,0.5,"0",undefined])expect(submitWeeklyQuizAnswer(original,{...request(),answerIndex},now)).toBeNull();
  expect(submitWeeklyQuizAnswer(original,request(),new Date("2026-10-26T12:00:00Z"))).toBeNull();
  expect(original.totalXP).toBe(500);
});

test("all five questions award XP once; a miss resets the streak, a missed week resets its bonus", () => {
  let state={totalXP:0,streak:0,bestStreak:0,answers:{}};
  quiz.questions.forEach(q=>{state=submitWeeklyQuizAnswer(state,request(q),now);});
  expect(state.totalXP).toBe(900);
  expect(state.streak).toBe(5);
  const nextDate=new Date("2026-10-28T12:00:00Z");
  const nextQuiz=getWeeklyQuiz(getWeeklyQuizKey(nextDate));
  const q=nextQuiz.questions[0];
  const miss=submitWeeklyQuizAnswer(state,{weekKey:nextQuiz.weekKey,questionId:q.id,answerIndex:(q.correctIndex+1)%4},nextDate);
  expect(miss.totalXP).toBe(920);expect(miss.streak).toBe(0);
  const laterDate=new Date("2026-11-04T12:00:00Z");
  const later=getWeeklyQuiz(getWeeklyQuizKey(laterDate));
  const reset=submitWeeklyQuizAnswer(state,{weekKey:later.weekKey,questionId:later.questions[0].id,answerIndex:later.questions[0].correctIndex},laterDate);
  expect(reset.totalXP-state.totalXP).toBe(120);
  expect(reset.bestStreak).toBe(5);
});

test("legacy weekly answers are respected, free-play answers do not consume this week's questions", () => {
  const q=quiz.questions[0];
  const old={answers:{[quiz.weekKey]:{questionId:q.id,earnedXP:120}}};
  expect(getWeeklyQuizAnswer(old,quiz.weekKey,q.id).earnedXP).toBe(120);
  expect(submitWeeklyQuizAnswer(old,request(q),now)).toBeNull();
  expect(getWeeklyQuizAnswer({answers:{[`free-${q.id}`]:{questionId:q.id}}},quiz.weekKey,q.id)).toBeNull();
});
