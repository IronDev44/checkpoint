import { fireEvent, render, screen } from "@testing-library/react";
import SplashScreen from "./SplashScreen";
import ThemeTransition from "./ThemeTransition";
import { CheckpointIntro } from "./CheckpointEffects";
import { readStartupAppearance, saveStartupAppearance } from "../services/startupAppearance";

test("new visitors get Checkpoint while existing choices survive", () => {
  localStorage.clear();
  expect(readStartupAppearance().theme).toBe("theme-checkpoint");
  saveStartupAppearance({theme:"theme-indigo"});
  expect(readStartupAppearance().theme).toBe("theme-indigo");
  saveStartupAppearance({theme:"theme-checkpoint",light:true});
  expect(readStartupAppearance()).toEqual({theme:"theme-checkpoint",light:true,effects:"balanced"});
});

test("startup uses the original emblem and exposes real loading progress and skip", () => {
  const close=jest.fn();
  render(<SplashScreen showSplash managed theme="theme-checkpoint" progress={72} onRequestClose={close}/>);
  expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow","72");
  expect(screen.getByRole("heading",{name:"CHECKPOINT"})).toBeVisible();
  expect(document.querySelector(".checkpoint-gateway")).not.toBeNull();
  expect(document.querySelector("img")).toBeNull();
  fireEvent.click(screen.getByRole("button",{name:"Passer"}));
  expect(close).toHaveBeenCalledTimes(1);
});

test("managed loading without a close callback cannot be skipped", () => {
  render(<CheckpointIntro progress={120} light/>);
  expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow","100");
  expect(screen.queryByRole("button",{name:"Passer"})).toBeNull();
  expect(document.querySelectorAll(".checkpoint-gold-orbit i")).toHaveLength(3);
});

test("reduced transition drops particles, full transition and portal clean up", () => {
  const view=render(<ThemeTransition theme="theme-checkpoint" direction="right" effects="balanced" fullMotion/>);
  expect(document.querySelectorAll(".checkpoint-gold-sparks i")).toHaveLength(12);
  view.rerender(<ThemeTransition theme="theme-checkpoint" direction="left" light effects="calm" fullMotion/>);
  expect(document.querySelector(".checkpoint-gold-transition.is-light.direction-left")).not.toBeNull();
  expect(document.querySelector(".checkpoint-gold-sparks")).toBeNull();
  view.unmount();
  expect(document.querySelector(".checkpoint-gold-transition")).toBeNull();
});
