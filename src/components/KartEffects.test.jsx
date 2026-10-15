import { act, fireEvent, render, screen } from "@testing-library/react";
import { KartIntro, KartTransition } from "./KartEffects";

let context, request, cancel, canvasContext, resizeObserver, originalObserver;
beforeEach(() => {
  const gradient = { addColorStop: jest.fn() };
  context = new Proxy({}, { get(target, key) {
    if (!(key in target)) target[key] = jest.fn(() => String(key).includes("Gradient") ? gradient : undefined);
    return target[key];
  } });
  canvasContext = jest.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(context);
  jest.spyOn(HTMLCanvasElement.prototype, "getBoundingClientRect").mockReturnValue({ width: 390, height: 844 });
  request = jest.spyOn(window, "requestAnimationFrame").mockReturnValue(41);
  cancel = jest.spyOn(window, "cancelAnimationFrame").mockImplementation(() => {});
  originalObserver = window.ResizeObserver;
  resizeObserver = { observe: jest.fn(), disconnect: jest.fn() };
  window.ResizeObserver = jest.fn(() => resizeObserver);
});
afterEach(() => { jest.restoreAllMocks(); window.ResizeObserver = originalObserver; });

test("the loading indicator reaches GO without restarting the canvas loop", () => {
  const view = render(<KartIntro progress={10}/>);
  expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "10");
  expect(view.container.querySelector(".kart-start-signal strong")).toHaveTextContent("3");
  const starts = request.mock.calls.length;
  view.rerender(<KartIntro progress={110}/>);
  expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "100");
  expect(view.container.querySelector(".kart-start-signal strong")).toHaveTextContent("GO!");
  expect(request).toHaveBeenCalledTimes(starts);
});

test("the intro can be skipped even if rendering is unavailable", () => {
  canvasContext.mockReturnValue(null);
  const onRequestClose = jest.fn();
  const view = render(<KartIntro progress={-5} onRequestClose={onRequestClose}/>);
  fireEvent.click(screen.getByRole("button", { name: "Passer l’intro" }));
  expect(onRequestClose).toHaveBeenCalledTimes(1);
  expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "0");
  expect(view.container.querySelector(".kart-road-fallback")).not.toBeNull();
});

test("unmounting stops the animation and detaches observers and page listeners", () => {
  const remove = jest.spyOn(document, "removeEventListener");
  const view = render(<KartTransition direction="left"/>);
  expect(view.container.querySelector(".direction-left")).not.toBeNull();
  view.unmount();
  expect(cancel).toHaveBeenCalledWith(41);
  expect(resizeObserver.disconnect).toHaveBeenCalledTimes(1);
  expect(remove).toHaveBeenCalledWith("visibilitychange", expect.any(Function));
});

test("intro scrolling is unlocked again on exit", () => {
  const view = render(<KartIntro progress={20}/>);
  expect(document.documentElement).toHaveClass("checkpoint-kart-intro-active");
  view.unmount();
  expect(document.documentElement).not.toHaveClass("checkpoint-kart-intro-active");
});

test("hidden pages pause and resume the scene without scheduling duplicate loops", () => {
  const hidden = jest.spyOn(document, "hidden", "get").mockReturnValue(false);
  render(<KartIntro progress={40}/>);
  expect(request).toHaveBeenCalledTimes(1);
  act(() => { hidden.mockReturnValue(true); document.dispatchEvent(new Event("visibilitychange")); });
  expect(cancel).toHaveBeenCalledWith(41);
  expect(request).toHaveBeenCalledTimes(1);
  act(() => { hidden.mockReturnValue(false); document.dispatchEvent(new Event("visibilitychange")); });
  expect(request).toHaveBeenCalledTimes(2);
});

test("reduced transitions retain the full-screen scene with a lower drawing budget", () => {
  const view = render(<KartTransition light effects="balanced"/>);
  expect(view.container.querySelector(".kart-tab-transition")).toHaveClass("is-light");
  expect(view.container.querySelector("canvas").width * view.container.querySelector("canvas").height).toBeLessThanOrEqual(650001);
  expect(view.container.querySelector(".kart-rainbow-drive")).not.toBeNull();
});
