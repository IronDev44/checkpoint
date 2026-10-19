import { fireEvent, render, screen } from "@testing-library/react";
import SplashScreen from "./SplashScreen";
import ThemeTransition from "./ThemeTransition";
import { GameUniverseIntro, GameUniverseTransition } from "./GameUniverseEffects";
import { GAME_UNIVERSE_THEMES } from "../data/gameUniverseThemes";
import { POP_CULTURE_THEMES } from "../data/popCultureThemes";
import { MORE_GAME_THEMES } from "../data/moreGameThemes";
jest.mock("../services/accountData",()=>({accountStorage:{getItem:()=>null}}));

test("new themes have unique identifiers without replacing the previous universes",()=>{
  expect(GAME_UNIVERSE_THEMES).toHaveLength(17);
  expect(new Set([...GAME_UNIVERSE_THEMES,...POP_CULTURE_THEMES].map(theme=>theme.id)).size).toBe(21);
});

test.each(GAME_UNIVERSE_THEMES)("$label has its own intro and optional skip",theme=>{
  const close=jest.fn();
  const view=render(<SplashScreen theme={theme.id} showSplash progress={41} onRequestClose={close} managed/>);
  expect(screen.getByRole("region",{name:`Introduction ${theme.label}`})).toHaveClass(`gu-${theme.motif}`);
  expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow","41");
  fireEvent.click(screen.getByRole("button",{name:/Passer l’intro/}));
  expect(close).toHaveBeenCalledTimes(1);
  view.rerender(<SplashScreen theme={theme.id} showSplash progress={100} managed/>);
  expect(screen.queryByRole("button",{name:/Passer l’intro/})).toBeNull();
  expect(screen.getByRole("region")).toHaveClass("is-ready");
});

test.each(GAME_UNIVERSE_THEMES)("$label renders a dedicated full transition and removes its portal",theme=>{
  const view=render(<ThemeTransition theme={theme.id} direction="left" effects="balanced" fullMotion/>);
  expect(document.querySelector(".gu-tab-transition")).toHaveClass(`gu-${theme.motif}`,"direction-left");
  expect(document.querySelector(".gu-tab-transition")).toHaveAttribute("aria-hidden","true");
  expect(document.querySelector(".checkpoint-full-tab-motion")).not.toBeNull();
  view.unmount();
  expect(document.querySelector(".gu-tab-transition")).toBeNull();
});

test.each(GAME_UNIVERSE_THEMES)("$label reduces its geometry and particles in light mode",theme=>{
  const view=render(<ThemeTransition theme={theme.id} direction="right" effects="boost" fullMotion/>);
  const count=document.querySelector(".gu-tab-transition").querySelectorAll("*").length;
  view.rerender(<ThemeTransition theme={theme.id} direction="right" effects="calm" fullMotion light/>);
  expect(document.querySelector(".gu-tab-transition")).toHaveClass("is-light");
  expect(document.querySelector(".gu-tab-transition").querySelectorAll("*").length).toBeLessThan(count);
  expect(document.querySelector(".checkpoint-tab-light")).not.toBeNull();
});

test("intro locks page scrolling only while it is mounted and bounds its progress",()=>{
  const view=render(<GameUniverseIntro theme="theme-halo" progress={200}/>);
  expect(document.documentElement).toHaveClass("checkpoint-game-intro-active");
  expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow","100");
  view.unmount();
  expect(document.documentElement).not.toHaveClass("checkpoint-game-intro-active");
});

test.each(MORE_GAME_THEMES)("$label opens on an establishing scene rather than its transition artwork",theme=>{
  render(<GameUniverseIntro theme={theme.id} progress={50}/>);
  expect(document.querySelector(`.rv-intro-${theme.motif}`)).not.toBeNull();
  expect(document.querySelector('[data-scene-purpose="transition"]')).toBeNull();
});

test("two Rapture scenes do not share SVG clip or gradient ids",()=>{
  render(<><GameUniverseTransition theme="theme-bioshock"/><GameUniverseTransition theme="theme-bioshock"/></>);
  const ids=[...document.querySelectorAll("clipPath,radialGradient")].map(element=>element.id);
  expect(ids).toHaveLength(4);
  expect(new Set(ids).size).toBe(4);
});

test("Android system reduction keeps a static cue unless full motion was requested",()=>{
  const original=window.matchMedia;
  window.matchMedia=()=>({matches:true,addEventListener:()=>{},removeEventListener:()=>{}});
  const view=render(<ThemeTransition theme="theme-portal" direction="right" effects="balanced"/>);
  expect(document.querySelector(".checkpoint-transition-still")).not.toBeNull();
  expect(document.querySelector(".gu-tab-transition")).toBeNull();
  view.rerender(<ThemeTransition theme="theme-portal" direction="right" effects="balanced" fullMotion/>);
  expect(document.querySelector(".gu-tab-transition")).not.toBeNull();
  view.unmount();window.matchMedia=original;
});
