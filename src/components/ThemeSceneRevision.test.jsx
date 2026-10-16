import { render, screen } from "@testing-library/react";
import SplashScreen from "./SplashScreen";
import ThemeTransition from "./ThemeTransition";
import { GAME_UNIVERSE_THEMES } from "../data/gameUniverseThemes";
import { POP_CULTURE_THEMES } from "../data/popCultureThemes";
jest.mock("../services/accountData",()=>({accountStorage:{getItem:()=>null}}));

// An intro must never mount the transition scene: otherwise a later shared-art
// refactor silently brings back the exact visual repetition reported on phones.
test.each([...GAME_UNIVERSE_THEMES,...POP_CULTURE_THEMES])("$label keeps startup separate from tab motion",theme=>{
  const view=render(<SplashScreen theme={theme.id} showSplash managed progress={65}/>);
  expect(document.querySelector('[data-scene-purpose="intro"]')).not.toBeNull();
  expect(document.querySelector('[data-scene-purpose="transition"]')).toBeNull();
  const introScene=document.querySelector('[data-scene-purpose="intro"]').innerHTML;
  view.rerender(<ThemeTransition theme={theme.id} fullMotion/>);
  expect(document.querySelector('[data-scene-purpose="intro"]')).toBeNull();
  expect(document.querySelector('.pc-transition-stage').innerHTML).not.toBe(introScene);
  expect(screen.queryByRole('progressbar')).toBeNull();
});

test.each([
  ['theme-arcane','arcane'],['theme-multiverse','multiverse'],['theme-retro','arcade'],
  ['theme-graphite','carbon'],['theme-emerald','mint'],['theme-cyberpunk','tokyo'],
  ['theme-tamer','tamer'],['theme-crystal','crystal'],['theme-steamdeck','steamdeck'],
])('%s uses its establishing shot only at startup',(theme,kind)=>{
  const view=render(<SplashScreen theme={theme} showSplash managed progress={65}/>);
  expect(document.querySelector(`[data-intro-vignette="${kind}"]`)).not.toBeNull();
  expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow','65');
  view.rerender(<ThemeTransition theme={theme} fullMotion/>);
  expect(document.querySelector('[data-intro-vignette]')).toBeNull();
});

test('simultaneous Halo previews keep their visor and armor gradient references independent',()=>{
  render(<><SplashScreen theme="theme-halo" showSplash managed/><SplashScreen theme="theme-halo" showSplash managed/></>);
  const ids=[...document.querySelectorAll('linearGradient')].map(node=>node.id);
  expect(ids).toHaveLength(4);
  expect(new Set(ids).size).toBe(4);
});

test('tab transitions do not fetch the larger cinematic intro plates',()=>{
  for(const theme of ['theme-godwar','theme-outlaw','theme-assassin','theme-future','theme-jurassic']){
    const view=render(<ThemeTransition theme={theme} fullMotion/>);
    expect(document.querySelector('img')).toBeNull();
    view.unmount();
  }
});
