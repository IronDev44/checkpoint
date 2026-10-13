import { act, render } from "@testing-library/react";
import ThemeTransition from "./ThemeTransition";

test("Android reduced motion keeps a stationary cue and responds to system changes", () => {
  const previous = window.matchMedia;
  let listener;
  const preference = {
    matches: true,
    addEventListener: jest.fn((event, callback) => { listener = callback; }),
    removeEventListener: jest.fn(),
  };
  window.matchMedia = jest.fn(() => preference);
  const view = render(<ThemeTransition theme="theme-indigo" direction="right" effects="balanced" />);
  expect(document.querySelector(".checkpoint-transition-still")).not.toBeNull();
  expect(document.querySelector(".aurora-tab-transition")).toBeNull();
  act(() => { preference.matches = false; listener(); });
  expect(document.querySelector(".checkpoint-transition-still")).toBeNull();
  expect(document.querySelector(".aurora-tab-transition")).not.toBeNull();
  view.unmount();
  expect(preference.removeEventListener).toHaveBeenCalledWith("change", listener);
  window.matchMedia = previous;
});

test.each(["theme-indigo", "theme-matrix", "theme-cubic", "theme-slayer"])("explicit full animations override Android reduction for %s", (theme) => {
  const previous = window.matchMedia;
  window.matchMedia = jest.fn(() => ({ matches: true, addEventListener: jest.fn(), removeEventListener: jest.fn() }));
  const view = render(<ThemeTransition theme={theme} direction="right" effects="balanced" fullMotion />);
  expect(document.querySelector(".checkpoint-transition-still")).toBeNull();
  expect(document.querySelector(".checkpoint-full-tab-motion")).not.toBeNull();
  view.unmount();
  window.matchMedia = previous;
});

test.each([
  ["theme-slayer", ".slayer-tab-transition"],
  ["theme-cyberpunk", ".tokyo-tab-transition"],
  ["theme-retro", ".arcade-tab-transition"],
  ["theme-graphite", ".carbon-tab-transition"],
  ["theme-crimson", ".redline-tab-transition"],
  ["theme-emerald", ".mint-tab-transition"],
  ["theme-vigilante", ".vigilante-tab-transition"],
  ["theme-treasure", ".treasure-tab-transition"],
  ["theme-wasteland", ".wasteland-tab-transition"],
  ["theme-ring", ".pac-tab-transition"],
  ["theme-crystal", ".ff-crystal-transition"],
  ["theme-kart", ".kart-tab-transition"],
  ["theme-hunter", ".hunter-tab-transition"],
  ["theme-blocks", ".blocks-tab-transition"],
  ["theme-blueblur", ".blueblur-tab-transition"],
  ["theme-mushroom", ".mushroom-tab-transition"],
  ["theme-tamer", ".tamer-tab-transition"],
  ["theme-indigo", ".aurora-tab-transition"],
  ["theme-steamdeck", ".deck-tab-transition"],
  ["theme-xbox", ".xbox-tab-transition"],
  ["theme-arcane", ".arcane-tab-transition"],
  ["theme-stellar", ".stellar-tab-transition"],
  ["theme-multiverse", ".hero-tab-transition"],
  ["theme-relic", ".relic-tab-transition"],
])("renders one dedicated transition for %s", (theme, selector) => {
  const view = render(<ThemeTransition theme={theme} direction="right" effects="balanced" />);
  expect(document.querySelectorAll(selector)).toHaveLength(1);
  expect(document.querySelector(".checkpoint-theme-transition")).toBeNull();
  view.unmount();
  expect(document.querySelector(selector)).toBeNull();
});
