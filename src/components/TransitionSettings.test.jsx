import { fireEvent, render, screen } from "@testing-library/react";
import TransitionSettings from "./TransitionSettings";

test("offers three explicit modes and marks the saved selection", () => {
  const onChange = jest.fn();
  const view = render(<TransitionSettings mode="full" onChange={onChange} />);
  expect(screen.getByRole("button", { name: /Complète/ })).toHaveAttribute("aria-pressed", "true");
  fireEvent.click(screen.getByRole("button", { name: /Réduite/ }));
  expect(onChange).toHaveBeenLastCalledWith("light");
  view.rerender(<TransitionSettings mode="light" onChange={onChange} />);
  expect(screen.getByRole("button", { name: /Réduite/ })).toHaveAttribute("aria-pressed", "true");
  fireEvent.click(screen.getByRole("button", { name: /Désactivée/ }));
  expect(onChange).toHaveBeenLastCalledWith("off");
});
