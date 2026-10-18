import { WEEKLY_QUIZ_QUESTIONS } from "../data/weeklyQuiz";
import { CHECKPOINT_TRIALS } from "../data/checkpointTrials";
import { getWeeklyQuiz, getWeeklyQuizKey, getPreviousWeeklyQuizKey, getQuizAnswerChoices, getWeeklyQuizAnswer, submitWeeklyQuizAnswer } from "./weeklyQuiz";

const now = new Date("2026-10-21T12:00:00Z");
const quiz = getWeeklyQuiz(getWeeklyQuizKey(now));
const request = (q = quiz.questions[0], index = q.correctIndex) => ({ weekKey:quiz.weekKey, questionId:q.id, answerIndex:index });

test("editorial bank has unique questions, four distinct answers and no invalid solutions", () => {
  expect(WEEKLY_QUIZ_QUESTIONS).toHaveLength(500);
  expect(new Set(WEEKLY_QUIZ_QUESTIONS.map(q=>q.id)).size).toBe(500);
  expect(new Set(WEEKLY_QUIZ_QUESTIONS.map(q=>q.question.toLocaleLowerCase("fr")) ).size).toBe(500);
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

test("166 full three-question weeks do not repeat; the next pack uses the two remaining entries before wrapping", () => {
  const all = [];
  for (let week=0; week<166; week+=1) {
    const key=getWeeklyQuizKey(new Date(Date.UTC(2026,9,19+week*7,12)));
    const pack=getWeeklyQuiz(key);
    expect(pack.questions).toHaveLength(3);
    expect(new Set(pack.questions.map(q=>q.category)).size).toBeGreaterThanOrEqual(2);
    expect(getWeeklyQuiz(key)).toEqual(pack);
    all.push(...pack.questions.map(q=>q.id));
  }
  expect(new Set(all).size).toBe(498);
  const tail=getWeeklyQuiz(getWeeklyQuizKey(new Date(Date.UTC(2026,9,19+166*7,12))));
  expect(tail.questions).toHaveLength(3);
  expect(new Set([...all,...tail.questions.slice(0,2).map(q=>q.id)]).size).toBe(500);
  expect(tail.questions[2].id).toBe(all[0]);
  expect(getWeeklyQuiz("invalid").questions).toEqual([]);
});

test("the published five-question round stays unchanged through Sunday; Monday introduces three without immediately repeating it", () => {
  const old=getWeeklyQuiz("2026-W42");
  expect(old.questions.map(q=>q.id)).toEqual(["re2-partners","zelda-majora-days","burnout-takedown","diablo-tristram","gta-v-three"]);
  const next=getWeeklyQuiz("2026-W43");
  expect(next.questions).toHaveLength(3);
  expect(next.questions.some(q=>old.questions.some(previous=>previous.id===q.id))).toBe(false);
  let progress={totalXP:0,answers:{}};
  const sunday=new Date("2026-10-18T12:00:00Z");
  old.questions.forEach(q=>{progress=submitWeeklyQuizAnswer(progress,{weekKey:old.weekKey,questionId:q.id,answerIndex:q.correctIndex},sunday);});
  expect(progress.totalXP).toBe(900);
  expect(getWeeklyQuizAnswer(progress,old.weekKey,old.questions[4].id)).toBeTruthy();
  const q=next.questions[0];
  const monday=submitWeeklyQuizAnswer(progress,{weekKey:next.weekKey,questionId:q.id,answerIndex:q.correctIndex},now);
  expect(monday.totalXP).toBe(1140);
  expect(getWeeklyQuizAnswer(monday,old.weekKey,old.questions[4].id)).toBeTruthy();
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

test("all three questions award XP once; a miss resets the streak, a missed week resets its bonus", () => {
  let state={totalXP:0,streak:0,bestStreak:0,answers:{}};
  quiz.questions.forEach(q=>{state=submitWeeklyQuizAnswer(state,request(q),now);});
  expect(state.totalXP).toBe(450);
  expect(state.streak).toBe(3);
  const nextDate=new Date("2026-10-28T12:00:00Z");
  const nextQuiz=getWeeklyQuiz(getWeeklyQuizKey(nextDate));
  const q=nextQuiz.questions[0];
  const miss=submitWeeklyQuizAnswer(state,{weekKey:nextQuiz.weekKey,questionId:q.id,answerIndex:(q.correctIndex+1)%4},nextDate);
  expect(miss.totalXP).toBe(470);expect(miss.streak).toBe(0);
  const laterDate=new Date("2026-11-04T12:00:00Z");
  const later=getWeeklyQuiz(getWeeklyQuizKey(laterDate));
  const reset=submitWeeklyQuizAnswer(state,{weekKey:later.weekKey,questionId:later.questions[0].id,answerIndex:later.questions[0].correctIndex},laterDate);
  expect(reset.totalXP-state.totalXP).toBe(120);
  expect(reset.bestStreak).toBe(3);
});

test("legacy weekly answers are respected, free-play answers do not consume this week's questions", () => {
  const q=quiz.questions[0];
  const old={answers:{[quiz.weekKey]:{questionId:q.id,earnedXP:120}}};
  expect(getWeeklyQuizAnswer(old,quiz.weekKey,q.id).earnedXP).toBe(120);
  expect(submitWeeklyQuizAnswer(old,request(q),now)).toBeNull();
  expect(getWeeklyQuizAnswer({answers:{[`free-${q.id}`]:{questionId:q.id}}},quiz.weekKey,q.id)).toBeNull();
});
