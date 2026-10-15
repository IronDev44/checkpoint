import { useEffect } from "react";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { onAuthStateChanged } from "firebase/auth";
import AccountGate from "./AccountGate";
import { saveStartupAppearance } from "../services/startupAppearance";

jest.mock("../firebase", () => ({auth:{currentUser:null}}));
jest.mock("../services/accountData", () => ({accountsEnabled:true,accountStorage:{getItem:()=>"true",setItem:jest.fn()}}));
jest.mock("firebase/auth", () => ({ onAuthStateChanged:jest.fn() }));
jest.mock("./SplashScreen", () => function Splash({showSplash,progress,theme,onRequestClose}) {
  return showSplash ? <section aria-label="Intro" data-testid="intro" data-theme={theme}><progress aria-label="Chargement" value={progress} max="100"/>{onRequestClose&&<button onClick={onRequestClose}>Passer</button>}</section> : null;
});

let authCallback, reportBoot;
const mounted = jest.fn();
function DemoApp({onStartupProgress}) {
  useEffect(() => { mounted(); reportBoot=onStartupProgress; },[onStartupProgress]);
  return <div>Ma collection privée</div>;
}
beforeEach(() => {
  jest.useFakeTimers(); localStorage.clear(); mounted.mockClear();
  onAuthStateChanged.mockImplementation((_,callback)=>{authCallback=callback;return jest.fn();});
  saveStartupAppearance({theme:"theme-kart",effects:"balanced",light:false});
});
afterEach(()=>{jest.useRealTimers();});
const advance = ms => act(()=>{jest.advanceTimersByTime(ms);});

test("the intro is the first screen and the private app is not mounted before authentication", () => {
  render(<AccountGate><DemoApp/></AccountGate>);
  expect(screen.getByTestId("intro")).toHaveAttribute("data-theme","theme-kart");
  expect(screen.queryByText(/Ouverture de ton espace/)).toBeNull();
  expect(mounted).not.toHaveBeenCalled();
  advance(6000);
  expect(screen.getByTestId("intro")).toBeVisible();
  expect(screen.queryByRole("button",{name:"Passer"})).toBeNull();
});

test("a slow auth handoff keeps one intro, continues its progress and waits for the app", () => {
  render(<AccountGate><DemoApp/></AccountGate>);
  const intro=screen.getByTestId("intro");
  advance(5000);
  const progressBefore=Number(screen.getByRole("progressbar").getAttribute("value"));
  act(()=>authCallback({uid:"demo"}));
  expect(mounted).toHaveBeenCalledTimes(1);
  expect(screen.getByTestId("intro")).toBe(intro);
  advance(1500);
  expect(screen.getByTestId("intro")).toBeVisible();
  expect(Number(screen.getByRole("progressbar").getAttribute("value"))).toBeGreaterThanOrEqual(progressBefore);
  expect(screen.queryByRole("button",{name:"Passer"})).toBeNull();
  act(()=>reportBoot(1));
  advance(1800);
  expect(screen.queryByTestId("intro")).toBeNull();
  expect(screen.getByText("Ma collection privée")).toBeVisible();
  expect(mounted).toHaveBeenCalledTimes(1);
});

test("signed-out visitors reach the login form after a single intro", () => {
  render(<AccountGate><DemoApp/></AccountGate>);
  act(()=>authCallback(null));
  expect(mounted).not.toHaveBeenCalled();
  expect(screen.queryByRole("heading",{name:"Ton aventure commence ici"})).toBeNull();
  advance(5000);
  expect(screen.getByRole("heading",{name:"Ton aventure commence ici"})).toBeVisible();
  expect(screen.queryByTestId("intro")).toBeNull();
});

test("a ready app can be revealed without waiting for the rest of the intro", () => {
  render(<AccountGate><DemoApp/></AccountGate>);
  act(()=>authCallback({uid:"demo"}));
  act(()=>reportBoot(1));
  fireEvent.click(screen.getByRole("button",{name:"Passer"}));
  expect(screen.queryByTestId("intro")).toBeNull();
  expect(screen.getByText("Ma collection privée")).toBeVisible();
});
