import { fireEvent, render, screen, within } from "@testing-library/react";
import WeeklyQuiz from "./WeeklyQuiz";
import { getWeeklyQuiz, getWeeklyQuizKey, getQuizAnswerKey } from "../services/weeklyQuiz";

const quiz=getWeeklyQuiz(getWeeklyQuizKey(new Date("2026-10-21T12:00:00Z")));

test("requires confirmation, passes only the selected weekly question ID and resets choice when navigating", () => {
  const onAnswer=jest.fn();render(<WeeklyQuiz quiz={quiz} progress={{}} onAnswer={onAnswer}/>);
  const submit=screen.getByRole("button",{name:"Valider ma réponse"});
  expect(submit).toBeDisabled();
  fireEvent.click(within(screen.getByRole("group",{name:"Choisir une réponse"})).getAllByRole("button")[0]);
  expect(onAnswer).not.toHaveBeenCalled();
  fireEvent.click(submit);
  expect(onAnswer).toHaveBeenCalledWith(expect.any(Number),{weekKey:quiz.weekKey,questionId:quiz.questions[0].id});
  fireEvent.click(screen.getByRole("button",{name:"Suivante"}));
  expect(submit).toBeDisabled();
  expect(screen.getByText(quiz.questions[1].question)).toBeVisible();
});

test("restores the first unanswered question and shows a completed week's corrections without allowing replay", () => {
  const q=quiz.questions[0];
  const progress={answers:{[getQuizAnswerKey(quiz.weekKey,q.id)]:{answerIndex:q.correctIndex,correct:true,earnedXP:120}}};
  const view=render(<WeeklyQuiz quiz={quiz} progress={progress}/>);
  expect(screen.getByText(quiz.questions[1].question)).toBeVisible();
  fireEvent.click(screen.getByRole("button",{name:"Précédente"}));
  expect(screen.getByText(q.explanation)).toBeVisible();
  expect(screen.queryByRole("button",{name:"Valider ma réponse"})).toBeNull();
  expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow","1");
  const all={answers:Object.fromEntries(quiz.questions.map(q=>[getQuizAnswerKey(quiz.weekKey,q.id),{answerIndex:q.correctIndex,correct:true,earnedXP:120}]))};
  view.rerender(<WeeklyQuiz quiz={quiz} progress={all}/>);
  expect(screen.getByText(/C’est tout pour cette semaine/)).toBeVisible();
  expect(screen.getByRole("button",{name:"Précédente"})).toBeDisabled();
  expect(within(screen.getByRole("group")).getAllByRole("button").every(b=>b.disabled)).toBe(true);
});

test("rollover to another week discards an unsubmitted selection", () => {
  const view=render(<WeeklyQuiz quiz={quiz} progress={{}}/>);
  fireEvent.click(within(screen.getByRole("group")).getAllByRole("button")[0]);
  const next=getWeeklyQuiz(getWeeklyQuizKey(new Date("2026-10-28T12:00:00Z")));
  view.rerender(<WeeklyQuiz quiz={next} progress={{}}/>);
  expect(screen.getByText(next.questions[0].question)).toBeVisible();
  expect(screen.getByRole("button",{name:"Valider ma réponse"})).toBeDisabled();
});
