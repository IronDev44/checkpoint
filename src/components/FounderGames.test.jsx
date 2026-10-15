import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import FounderGames from "./FounderGames";

test("an old founder with a landscape picture is displayed using its resolved cover", async () => {
  const resolveCover = jest.fn().mockResolvedValue("https://example.com/box.jpg");
  render(<FounderGames games={[{ id: "1", name: "Metal Gear Solid", image: "landscape.jpg", rating: 9 }]} resolveCover={resolveCover} />);
  expect(await screen.findByAltText("Jaquette de Metal Gear Solid")).toHaveAttribute("src", "https://example.com/box.jpg");
  expect(screen.getByText("9/10")).toBeVisible();
});

test("missing or failed covers use a neutral placeholder instead of cropping a screenshot", async () => {
  const view = render(<FounderGames games={[{ id: "1", name: "Game", image: "screenshot.jpg" }]} resolveCover={jest.fn().mockResolvedValue("")} />);
  expect(await screen.findByText("Jaquette indisponible")).toBeVisible();
  expect(view.container.querySelector("img")).toBeNull();
});

test("an image load failure preserves the title and displays a fallback", async () => {
  render(<FounderGames games={[{ id: "1", name: "Game" }]} resolveCover={jest.fn().mockResolvedValue("https://example.com/broken.jpg")} />);
  fireEvent.error(await screen.findByAltText("Jaquette de Game"));
  expect(screen.getByText("Jaquette indisponible")).toBeVisible();
  expect(screen.getByText("Game")).toBeVisible();
});

test("a late result from another founder cannot replace the new game's cover", async () => {
  let resolveOld;
  const resolveCover = jest.fn().mockImplementationOnce(() => new Promise(resolve => { resolveOld = resolve; })).mockResolvedValue("https://example.com/new.jpg");
  const view = render(<FounderGames games={[{ id: "same-slot", name: "Old game" }]} resolveCover={resolveCover} />);
  view.rerender(<FounderGames games={[{ id: "same-slot", name: "New game" }]} resolveCover={resolveCover} />);
  await waitFor(() => expect(screen.getByAltText("Jaquette de New game")).toHaveAttribute("src", "https://example.com/new.jpg"));
  await act(async () => resolveOld("https://example.com/old.jpg"));
  expect(screen.getByAltText("Jaquette de New game")).toHaveAttribute("src", "https://example.com/new.jpg");
});
