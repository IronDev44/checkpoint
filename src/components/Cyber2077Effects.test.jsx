import { fireEvent, render, screen } from "@testing-library/react";
import SplashScreen from "./SplashScreen";
import ThemeTransition, { getThemeTransitionDuration } from "./ThemeTransition";
import { CYBER2077_THEME } from "./Cyber2077Effects";
import { readStartupAppearance, saveStartupAppearance } from "../services/startupAppearance";
jest.mock("../services/accountData",()=>({accountStorage:{getItem:()=>"theme-checkpoint"}}));

test("2077 remains the startup intro before authentication on the next visit",()=>{
  const entries=new Map();const storage={getItem:key=>entries.get(key)||null,setItem:(key,value)=>entries.set(key,value)};
  saveStartupAppearance({theme:CYBER2077_THEME,effects:'calm',light:true},storage);
  expect(readStartupAppearance(storage)).toEqual({theme:CYBER2077_THEME,effects:'calm',light:true});
});

test("startup routes to 2077, reflects real progress and only offers entry when ready",()=>{
  const view=render(<SplashScreen showSplash managed theme={CYBER2077_THEME} progress={42}/>);
  expect(screen.getByLabelText('Checkpoint 2077')).toBeInTheDocument();
  expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow','42');
  expect(screen.queryByRole('button')).not.toBeInTheDocument();
  const enter=jest.fn();
  view.rerender(<SplashScreen showSplash managed theme={CYBER2077_THEME} progress={100} onRequestClose={enter}/>);
  fireEvent.click(screen.getByRole('button',{name:/Entrer dans Checkpoint/}));
  expect(enter).toHaveBeenCalledTimes(1);
});
test("2077 uses its own short channel transition and respects reduced motion",()=>{
  const original=window.matchMedia;
  const preference={matches:false,addEventListener:jest.fn(),removeEventListener:jest.fn()};
  window.matchMedia=jest.fn(()=>preference);
  const view=render(<ThemeTransition theme={CYBER2077_THEME} direction="left" effects="calm" light/>);
  expect(document.querySelector('.cp2077-transition')).toHaveClass('direction-left','effects-calm','is-light');
  expect(getThemeTransitionDuration(CYBER2077_THEME)).toBe(1320);
  view.unmount();preference.matches=true;
  const still=render(<ThemeTransition theme={CYBER2077_THEME} direction="right"/>);
  expect(document.querySelector('.cp2077-transition')).toBeNull();
  expect(document.querySelector('.checkpoint-transition-still')).not.toBeNull();
  still.unmount();window.matchMedia=original;
});
