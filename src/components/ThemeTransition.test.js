import { render } from "@testing-library/react";
import ThemeTransition from "./ThemeTransition";

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
