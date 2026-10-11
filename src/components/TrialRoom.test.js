import { act, fireEvent, render, screen } from "@testing-library/react";
import TrialRoom from "./TrialRoom";

test("keeps the selected answer visible and records it only once during feedback", () => {
  jest.useFakeTimers();
  render(<TrialRoom checkpointLevel={25} rawXP={5000} onClose={() => {}} onComplete={() => {}} />);
  fireEvent.click(screen.getByRole("button", { name: /Lancer l’épreuve/ }));
  const answer = screen.getByRole("button", { name: /Nintendo EAD/ });
  fireEvent.click(answer);
  fireEvent.click(screen.getByRole("button", { name: /Valider ma réponse/ }));
  expect(answer.className).toContain("selected");
  expect(answer.disabled).toBe(true);
  expect(screen.getByRole("button", { name: /Réponse enregistrée/ }).disabled).toBe(true);
  act(() => jest.advanceTimersByTime(420));
  expect(screen.getByText(/Épreuve 2\/4/)).toBeTruthy();
  expect(screen.getByRole("button", { name: /Valider ma réponse/ }).disabled).toBe(true);
  jest.useRealTimers();
});

test("cancels pending question advancement when the room closes", () => {
  jest.useFakeTimers();
  const view = render(<TrialRoom checkpointLevel={25} rawXP={5000} onClose={() => {}} onComplete={() => {}} />);
  fireEvent.click(screen.getByRole("button", { name: /Lancer l’épreuve/ }));
  fireEvent.click(screen.getByRole("button", { name: /Nintendo EAD/ }));
  fireEvent.click(screen.getByRole("button", { name: /Valider ma réponse/ }));
  view.unmount();
  expect(jest.getTimerCount()).toBe(0);
  jest.useRealTimers();
});
