import { act, render } from "@testing-library/react";
import SplashScreen from "./SplashScreen";
jest.mock("../services/accountData", () => ({accountStorage:{getItem:()=>"theme-indigo"}}));
jest.mock("./AuroraEffects", () => ({ AuroraIntro:({progress})=><div data-testid="aurora">{progress}</div> }));

beforeEach(()=>jest.useFakeTimers());
afterEach(()=>jest.useRealTimers());
test("the startup owner can keep one intro visible while authentication takes longer than 4.2 seconds", () => {
  const close=jest.fn();
  const view=render(<SplashScreen showSplash progress={20} managed onRequestClose={close}/>);
  act(()=>jest.advanceTimersByTime(10000));
  expect(close).not.toHaveBeenCalled();
  expect(view.getByTestId("aurora")).toHaveTextContent("20");
});
test("standalone previews retain their close timer", () => {
  const close=jest.fn();
  render(<SplashScreen showSplash progress={20} onRequestClose={close}/>);
  act(()=>jest.advanceTimersByTime(4200));
  expect(close).toHaveBeenCalledTimes(1);
});
