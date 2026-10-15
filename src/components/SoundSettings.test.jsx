import { useState } from "react";
import { fireEvent, render, screen, act } from "@testing-library/react";
import SoundSettings from "./SoundSettings";
import { DEFAULT_SOUND_SETTINGS } from "../services/soundEffects";
jest.mock("../services/accountData", () => ({ accountStorage: { getItem: () => null } }));

function Harness({ onChange = () => {}, onPreview, initial = DEFAULT_SOUND_SETTINGS }) {
  const [value, setValue] = useState(initial);
  return <SoundSettings value={value} onPreview={onPreview} onChange={next => { onChange(next); setValue(next); }} />;
}
test("selects a family and increases or decreases the saved volume", () => {
  const change = jest.fn();
  render(<Harness onChange={change} />);
  fireEvent.change(screen.getByLabelText("Ambiance sonore"), { target: { value: "adventure" } });
  fireEvent.click(screen.getByRole("button", { name: "Augmenter le volume" }));
  expect(change).toHaveBeenLastCalledWith({ enabled: true, style: "adventure", volume: 65 });
  expect(screen.getByLabelText("Volume des effets")).toHaveValue("65");
  fireEvent.click(screen.getByRole("button", { name: "Baisser le volume" }));
  expect(change).toHaveBeenLastCalledWith({ enabled: true, style: "adventure", volume: 55 });
});
test("keeps pointer dragging local until release, while keyboard changes save immediately", () => {
  const change = jest.fn();
  render(<Harness onChange={change} />);
  const slider = screen.getByLabelText("Volume des effets");
  fireEvent.pointerDown(slider);
  fireEvent.change(slider, { target: { value: "70" } });
  fireEvent.change(slider, { target: { value: "90" } });
  expect(slider).toHaveAttribute("aria-valuetext", "90 %");
  expect(change).not.toHaveBeenCalled();
  fireEvent.pointerUp(slider);
  fireEvent.lostPointerCapture(slider);
  expect(change).toHaveBeenCalledTimes(1);
  expect(change.mock.calls[0][0].volume).toBe(90);
  fireEvent.change(slider, { target: { value: "91" } });
  expect(change).toHaveBeenCalledTimes(2);
});
test("previews all action types at the current volume, even with effects muted", async () => {
  const preview = jest.fn(async () => ({ ok: true, duration: .1 }));
  const change = jest.fn();
  render(<Harness onChange={change} onPreview={preview} initial={{ enabled: false, style: "crystal", volume: 80 }} />);
  for (const label of ["Navigation", "Ajout", "Retrait", "Badge", "Niveau"]) {
    await act(async () => { fireEvent.click(screen.getByRole("button", { name: `Écouter : ${label}` })); });
  }
  expect(preview.mock.calls.map(call => call[0])).toEqual(["click", "success", "delete", "badge", "levelup"]);
  expect(preview).toHaveBeenLastCalledWith("levelup", { preview: true, settings: { enabled: false, style: "crystal", volume: 80 } });
  expect(change).not.toHaveBeenCalled();
  expect(screen.getByRole("status", { name: "État de l’aperçu" })).toHaveTextContent("RPG cristal");
});
test("mute is explicit and zero volume disables previews", () => {
  const change = jest.fn(), preview = jest.fn();
  render(<Harness onChange={change} onPreview={preview} />);
  fireEvent.click(screen.getByRole("button", { name: "Désactivés" }));
  expect(change).toHaveBeenLastCalledWith({ ...DEFAULT_SOUND_SETTINGS, enabled: false });
  expect(preview).not.toHaveBeenCalled();
  fireEvent.change(screen.getByLabelText("Volume des effets"), { target: { value: "0" } });
  expect(screen.getByRole("button", { name: "Écouter : Ajout" })).toBeDisabled();
  expect(screen.getByRole("button", { name: "Baisser le volume" })).toBeDisabled();
});
test("reports blocked playback and ignores stale preview responses after a style change", async () => {
  let resolve;
  const preview = jest.fn(() => new Promise(done => { resolve = done; }));
  render(<Harness onPreview={preview} />);
  fireEvent.click(screen.getByRole("button", { name: "Écouter : Badge" }));
  fireEvent.change(screen.getByLabelText("Ambiance sonore"), { target: { value: "space" } });
  await act(async () => resolve({ ok: true, duration: .1 }));
  expect(screen.getByRole("status", { name: "État de l’aperçu" })).toBeEmptyDOMElement();
  preview.mockResolvedValue({ ok: false, reason: "unsupported" });
  await act(async () => { fireEvent.click(screen.getByRole("button", { name: "Écouter : Badge" })); });
  expect(screen.getByRole("status", { name: "État de l’aperçu" })).toHaveTextContent("pas disponibles dans ce navigateur");
});
