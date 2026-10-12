import { render, screen, fireEvent } from "@testing-library/react";
import WelcomeTour from "./WelcomeTour";

test("can skip discovery immediately", () => {
  const close = jest.fn(); render(<WelcomeTour onClose={close} />);
  fireEvent.click(screen.getByRole("button", { name: "Passer" }));
  expect(close).toHaveBeenCalledTimes(1);
});
test("can navigate back and finish the four steps", () => {
  const close = jest.fn(); render(<WelcomeTour onClose={close} />);
  fireEvent.click(screen.getByRole("button", { name: "Continuer" }));
  expect(screen.getByRole("heading", { name: "Ajoute tes premiers jeux" })).toBeTruthy();
  fireEvent.click(screen.getByRole("button", { name: "Retour" }));
  expect(screen.getByRole("heading", { name: "Bienvenue chez toi" })).toBeTruthy();
  for (let i = 0; i < 3; i++) fireEvent.click(screen.getByRole("button", { name: "Continuer" }));
  fireEvent.click(screen.getByRole("button", { name: "C’est parti" }));
  expect(close).toHaveBeenCalledTimes(1);
});
