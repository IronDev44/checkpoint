import { fireEvent, render, screen } from "@testing-library/react";
import CheckpointPremiumChoice from "./CheckpointPremiumChoice";
import SplashScreen from "./SplashScreen";
import ThemeTransition from "./ThemeTransition";
import { CHECKPOINT_PREMIUM_THEME as premium } from "../services/themeRewards";
import { readStartupAppearance, saveStartupAppearance } from "../services/startupAppearance";

test("locked reward shows its requirement and never selects itself", () => {
  const select=jest.fn();
  render(<CheckpointPremiumChoice level={49} theme="theme-checkpoint" onSelect={select}/>);
  const choice=screen.getByRole("button",{name:/Checkpoint Premium/});
  expect(choice).toBeDisabled(); expect(choice).toHaveAccessibleName(/niveau 50, niveau actuel 49/);
  fireEvent.click(choice); expect(select).not.toHaveBeenCalled();
});
test("an earned theme can be selected even after the current level drops", () => {
  const select=jest.fn();
  render(<CheckpointPremiumChoice level={20} theme={premium} unlockedThemes={[premium]} onSelect={select}/>);
  const choice=screen.getByRole("button",{name:/Checkpoint Premium/});
  expect(choice).toBeEnabled(); expect(choice).toHaveAttribute("aria-pressed","true");
  fireEvent.click(choice); expect(select).toHaveBeenCalledWith(premium);
});
test("premium startup remembers only appearance and renders the platinum intro", () => {
  localStorage.clear(); saveStartupAppearance({theme:premium,light:true,level:50,unlockedThemes:[premium]});
  expect(readStartupAppearance()).toEqual({theme:premium,light:true,effects:"balanced"});
  render(<SplashScreen showSplash managed theme={premium} light progress={63}/>);
  expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow","63");
  expect(document.querySelector(".checkpoint-premium-intro.is-light .checkpoint-mark-platinum")).not.toBeNull();
  expect(document.querySelectorAll(".checkpoint-premium-prism i")).toHaveLength(3);
  expect(document.querySelector(".checkpoint-gold-orbit")).toBeNull();
});
test("premium transitions differ from gold, reduce facets and clean up their portal", () => {
  const view=render(<ThemeTransition theme={premium} direction="right" effects="balanced" fullMotion/>);
  expect(document.querySelectorAll(".checkpoint-premium-shutter")).toHaveLength(2);
  expect(document.querySelectorAll(".checkpoint-premium-transition-facets i")).toHaveLength(6);
  expect(document.querySelector(".checkpoint-gold-transition")).toBeNull();
  view.rerender(<ThemeTransition theme={premium} direction="left" light effects="calm" fullMotion/>);
  expect(document.querySelector(".checkpoint-premium-transition.is-light.direction-left")).not.toBeNull();
  expect(document.querySelector(".checkpoint-premium-transition-facets")).toBeNull();
  view.unmount(); expect(document.querySelector(".checkpoint-premium-transition")).toBeNull();
});
