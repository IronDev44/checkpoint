import { fireEvent, render, screen } from "@testing-library/react";
import SplashScreen from "./SplashScreen";
import ThemeTransition from "./ThemeTransition";
import { CheckpointIntro, CheckpointMark, CheckpointUltimateIntro, CheckpointUltimateTransition } from "./CheckpointEffects";
import { readStartupAppearance, saveStartupAppearance } from "../services/startupAppearance";

test("new visitors get Checkpoint while existing choices survive", () => {
  localStorage.clear();
  expect(readStartupAppearance().theme).toBe("theme-checkpoint");
  saveStartupAppearance({theme:"theme-indigo"});
  expect(readStartupAppearance().theme).toBe("theme-indigo");
  saveStartupAppearance({theme:"theme-checkpoint",light:true});
  expect(readStartupAppearance()).toEqual({theme:"theme-checkpoint",light:true,effects:"balanced"});
});

test("concurrent emblems reference their own metallic paints and reveal mask", () => {
  const view=render(<><CheckpointMark className="checkpoint-header-mark"/><CheckpointIntro progress={50}/><CheckpointMark/></>);
  const marks=[...view.container.querySelectorAll("svg.checkpoint-mark")];
  expect(marks).toHaveLength(3);
  const ids=[...view.container.querySelectorAll("[id]")].map(node=>node.id);
  expect(new Set(ids).size).toBe(ids.length);
  marks.forEach(mark=>{
    mark.querySelectorAll("[fill],[stroke],[mask]").forEach(node=>{
      ["fill","stroke","mask"].forEach(attr=>{
        const value=node.getAttribute(attr)||"";
        if(value.startsWith("url(#")) expect([...mark.querySelectorAll("[id]")].some(def=>def.id===value.slice(5,-1))).toBe(true);
      });
    });
  });
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


test("cut-crystal marks use independent paint references in the header, intro and reflection", () => {
 const view=render(<><CheckpointMark variant="diamond" className="checkpoint-header-mark"/><CheckpointUltimateIntro progress={84}/></>);
 const marks=[...view.container.querySelectorAll('svg.checkpoint-mark-diamond')];
 expect(marks).toHaveLength(3);
 const ids=[...view.container.querySelectorAll('[id]')].map(n=>n.id);
 expect(new Set(ids).size).toBe(ids.length);
 marks.forEach(mark=>mark.querySelectorAll('[fill],[stroke],[clip-path]').forEach(node=>['fill','stroke','clip-path'].forEach(attr=>{
  const ref=node.getAttribute(attr)||'';
  if(ref.startsWith('url(#'))expect([...mark.querySelectorAll('[id]')].some(def=>def.id===ref.slice(5,-1))).toBe(true);
 })));
 expect(document.querySelector('.checkpoint-premium-prism')).toBeNull();
 expect(document.querySelector('img')).toBeNull();
 expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow','84');
 view.rerender(<CheckpointUltimateIntro light progress={42}/>);
 expect(document.querySelector('.checkpoint-ultimate-reflection')).toBeNull();
 expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow','42');
});


test('ultimate prestige uses an engraved setting for the intro and refracted light for the transition, without heavy elements in light mode',()=>{
 const view=render(<CheckpointUltimateIntro progress={72}/>);
 expect(document.querySelector('.ultimate-prestige-frame')).not.toBeNull();expect(document.querySelectorAll('.ultimate-prestige-glint')).toHaveLength(6);
 expect(document.querySelector('.ultimate-studio-beams')).not.toBeNull();expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow','72');
 view.rerender(<CheckpointUltimateTransition direction="left"/>);
 expect(document.querySelector('.ultimate-prestige-setting.is-transition')).not.toBeNull();expect(document.querySelector('.ultimate-transition-refraction')).not.toBeNull();expect(document.querySelector('.checkpoint-ultimate-transition')).toHaveClass('direction-left');
 view.rerender(<CheckpointUltimateTransition light/>);expect(document.querySelector('.ultimate-prestige-setting')).toBeNull();expect(document.querySelector('.ultimate-transition-refraction')).toBeNull();
 view.rerender(<CheckpointUltimateIntro light progress={30}/>);expect(document.querySelector('.ultimate-prestige-setting')).toBeNull();expect(document.querySelector('.ultimate-studio-beams')).toBeNull();expect(document.querySelector('.checkpoint-mark-diamond')).not.toBeNull();
});
