import { fireEvent, render, screen } from "@testing-library/react";
import { PopCultureIntro } from "./PopCultureEffects";
import ThemeTransition from "./ThemeTransition";
import SplashScreen from "./SplashScreen";
import { POP_CULTURE_THEMES } from "../data/popCultureThemes";
jest.mock("../services/accountData", () => ({accountStorage:{getItem:()=>null}}));

test.each(POP_CULTURE_THEMES)("%s has an intro with its own scene, progress and optional skip", config => {
  const close=jest.fn();
  const view=render(<SplashScreen theme={config.id} showSplash progress={38} managed onRequestClose={close}/>);
  expect(screen.getByRole("region",{name:`Introduction ${config.label}`})).toHaveClass(`pc-${config.motif}`);
  expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow","38");
  fireEvent.click(screen.getByRole("button",{name:/Passer l’intro/}));
  expect(close).toHaveBeenCalledTimes(1);
  view.rerender(<SplashScreen theme={config.id} showSplash progress={100} managed/>);
  expect(screen.queryByRole("button",{name:/Passer l’intro/})).toBeNull();
  expect(screen.getByRole("region")).toHaveClass("is-ready");
});

test.each(POP_CULTURE_THEMES)("%s has one portal transition that is removed on unmount", config=>{
  const view=render(<ThemeTransition theme={config.id} direction="left" effects="balanced" fullMotion/>);
  const root=document.querySelector(".pc-tab-transition");
  expect(root).toHaveClass(`pc-${config.motif}`,"direction-left");
  expect(root).toHaveAttribute("aria-hidden","true");
  expect(document.querySelector(".checkpoint-full-tab-motion")).not.toBeNull();
  view.unmount();
  expect(document.querySelector(".pc-tab-transition")).toBeNull();
});

test.each(POP_CULTURE_THEMES)("%s reduces decorative nodes in light mode", config=>{
  const view=render(<ThemeTransition theme={config.id} direction="right" effects="boost" fullMotion/>);
  const full=document.querySelector(".pc-tab-transition").querySelectorAll("*").length;
  view.rerender(<ThemeTransition theme={config.id} direction="right" effects="calm" fullMotion light/>);
  expect(document.querySelector(".pc-tab-transition")).toHaveClass("is-light");
  expect(document.querySelector(".pc-tab-transition").querySelectorAll("*").length).toBeLessThan(full);
  expect(document.querySelector(".checkpoint-tab-light")).not.toBeNull();
});

test("both Tron scenes remain visibly different",()=>{
  const view=render(<PopCultureIntro theme="theme-tron"/>);
  expect(document.querySelector(".pc-recognizer")).not.toBeNull();
  expect(document.querySelector(".pc-identity-disc")).toBeNull();
  view.rerender(<PopCultureIntro theme="theme-tronlegacy"/>);
  expect(document.querySelector(".pc-recognizer")).toBeNull();
  expect(document.querySelector(".pc-identity-disc")).not.toBeNull();
});

test("intro scroll locking is removed when returning to the app",()=>{
  const view=render(<PopCultureIntro theme="theme-tron"/>);
  expect(document.documentElement).toHaveClass("checkpoint-pop-intro-active");
  view.unmount();
  expect(document.documentElement).not.toHaveClass("checkpoint-pop-intro-active");
});

test("simultaneous amber previews use unique gradient references",()=>{
  render(<><PopCultureIntro theme="theme-jurassic" progress={-10}/><PopCultureIntro theme="theme-jurassic" progress={200}/></>);
  const ids=[...document.querySelectorAll("radialGradient")].map(node=>node.id);
  expect(new Set(ids).size).toBe(2);
  expect(screen.getAllByRole("progressbar").map(node=>node.getAttribute("aria-valuenow"))).toEqual(["0","100"]);
});

test("system reduction uses a stationary cue unless complete motion was explicitly chosen",()=>{
  const original=window.matchMedia;
  window.matchMedia=()=>({matches:true,addEventListener:()=>{},removeEventListener:()=>{}});
  const view=render(<ThemeTransition theme="theme-tronlegacy" direction="right" effects="balanced"/>);
  expect(document.querySelector(".checkpoint-transition-still")).not.toBeNull();
  expect(document.querySelector(".pc-tab-transition")).toBeNull();
  view.rerender(<ThemeTransition theme="theme-tronlegacy" direction="right" effects="balanced" fullMotion/>);
  expect(document.querySelector(".checkpoint-transition-still")).toBeNull();
  expect(document.querySelector(".pc-tab-transition")).not.toBeNull();
  view.unmount();window.matchMedia=original;
});
