import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import ProfilePhotoEditor, { SocialAvatar } from "./ProfilePhoto";
import { cropProfilePhoto, loadProfilePhoto } from "../services/profilePhoto";
jest.mock("../services/profilePhoto", () => ({ ...jest.requireActual("../services/profilePhoto"), loadProfilePhoto: jest.fn(), cropProfilePhoto: jest.fn() }));

const original = "data:image/jpeg;base64,original";
const cropped = "data:image/jpeg;base64,cropped";
const photo = { source: original, width: 800, height: 400, image: {} };
const upload = () => fireEvent.change(screen.getByLabelText("Choisir une photo de profil"), { target: { files: [new File(["photo"], "photo.jpg", { type: "image/jpeg" })] } });
beforeEach(() => {
  loadProfilePhoto.mockReset().mockResolvedValue(photo);
  cropProfilePhoto.mockReset().mockReturnValue(cropped);
});

test("choosing a photo waits for the user's crop and confirmation before saving", async () => {
  const onChange = jest.fn();
  const view = render(<ProfilePhotoEditor name="Alex" value="" onChange={onChange} />);
  upload();
  expect(await screen.findByRole("dialog", { name: "Cadrer ta photo" })).toBeVisible();
  expect(onChange).not.toHaveBeenCalled();
  fireEvent.change(screen.getByRole("slider", { name: "Zoom de la photo" }), { target: { value: "2" } });
  fireEvent.keyDown(screen.getByRole("group", { name: "Déplacer la photo" }), { key: "ArrowRight" });
  fireEvent.click(screen.getByRole("button", { name: "Enregistrer la photo" }));
  await waitFor(() => expect(onChange).toHaveBeenCalledWith(cropped));
  expect(cropProfilePhoto.mock.calls[0][1]).toMatchObject({ zoom: 2, centerX: .52 });
  expect(screen.queryByRole("dialog")).toBeNull();
  view.rerender(<ProfilePhotoEditor name="Alex" value={cropped} onChange={onChange} />);
  fireEvent.click(screen.getByRole("button", { name: "Retirer la photo" }));
  await waitFor(() => expect(onChange).toHaveBeenLastCalledWith(""));
});

test("canceling a crop leaves the previously saved photo untouched", async () => {
  const onChange = jest.fn();
  const view = render(<ProfilePhotoEditor name="Alex" value={original} onChange={onChange} />);
  fireEvent.click(screen.getByRole("button", { name: "Recadrer", exact: true }));
  expect(await screen.findByRole("dialog")).toHaveTextContent("photo d’origine");
  fireEvent.change(screen.getByRole("slider"), { target: { value: "3" } });
  fireEvent.click(screen.getByRole("button", { name: "Annuler", exact: true }));
  expect(onChange).not.toHaveBeenCalled();
  expect(view.container.querySelector("img")).toHaveAttribute("src", original);
  expect(screen.queryByRole("dialog")).toBeNull();
});
test("failed decoding keeps the previous photo", async () => {
  loadProfilePhoto.mockRejectedValue(new Error("Format non reconnu"));
  const onChange = jest.fn();
  const view = render(<ProfilePhotoEditor name="Alex" value="data:image/jpeg;base64,old" onChange={onChange} />);
  fireEvent.change(screen.getByLabelText("Choisir une photo de profil"), { target: { files: [new File(["bad"], "photo.jpg", { type: "image/jpeg" })] } });
  expect(await screen.findByRole("alert")).toHaveTextContent("Format non reconnu");
  expect(onChange).not.toHaveBeenCalled();
  expect(view.container.querySelector("img")).toHaveAttribute("src", "data:image/jpeg;base64,old");
});

test("failed saving leaves the editor open for retry with the selected crop", async () => {
  const onChange = jest.fn().mockRejectedValueOnce(new Error("Connexion interrompue")).mockResolvedValue(undefined);
  render(<ProfilePhotoEditor name="Alex" value={original} onChange={onChange} />);
  upload(); await screen.findByRole("dialog");
  fireEvent.change(screen.getByRole("slider"), { target: { value: "2" } });
  fireEvent.click(screen.getByRole("button", { name: "Enregistrer la photo" }));
  expect(await screen.findByRole("alert")).toHaveTextContent("Connexion interrompue");
  expect(screen.getByRole("slider")).toHaveValue("2");
  fireEvent.click(screen.getByRole("button", { name: "Enregistrer la photo" }));
  await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
});

test("a photo opens enlarged, supports zoom, and Escape restores focus and scrolling", async () => {
  render(<SocialAvatar name="Alex" src={original} zoomable />);
  const trigger = screen.getByRole("button", { name: "Agrandir la photo de Alex" });
  trigger.focus(); fireEvent.click(trigger);
  expect(await screen.findByRole("dialog", { name: "Photo de Alex" })).toBeVisible();
  await screen.findByRole("slider");
  expect(document.documentElement).toHaveClass("checkpoint-photo-modal-active");
  fireEvent.click(screen.getByRole("button", { name: "Zoomer", exact: true }));
  expect(screen.getByRole("slider")).toHaveValue("1.1");
  fireEvent.keyDown(document, { key: "Escape" });
  expect(screen.queryByRole("dialog")).toBeNull();
  expect(trigger).toHaveFocus();
  expect(document.documentElement).not.toHaveClass("checkpoint-photo-modal-active");
});

test("keyboard focus stays inside the open photo", async () => {
  render(<SocialAvatar name="Alex" src={original} zoomable />);
  fireEvent.click(screen.getByRole("button", { name: "Agrandir la photo de Alex" }));
  await screen.findByRole("slider");
  const close = screen.getByRole("button", { name: "Fermer la photo" });
  close.focus(); fireEvent.keyDown(close, { key: "Tab", shiftKey: true });
  expect(screen.getByRole("button", { name: "Recentrer" })).toHaveFocus();
  fireEvent.keyDown(document.activeElement, { key: "Tab" });
  expect(close).toHaveFocus();
});

test("broken avatars fall back to initials and aren't clickable", () => {
  const view = render(<SocialAvatar name="Alex Smith" src="missing.jpg" zoomable />);
  fireEvent.error(view.container.querySelector("img"));
  expect(screen.getByText("AS")).toBeInTheDocument();
  expect(screen.queryByRole("button")).toBeNull();
});

test("small avatars inside profile navigation remain free of nested buttons", () => {
  const view = render(<button type="button"><SocialAvatar name="Alex" src={original} />Voir le profil</button>);
  expect(view.container.querySelectorAll("button")).toHaveLength(1);
});

test("dragging and two-finger pinching change the selected crop", async () => {
  const OriginalPointerEvent = window.PointerEvent;
  window.PointerEvent = class extends MouseEvent {
    constructor(type, options) { super(type, options); Object.defineProperty(this, "pointerId", { value: options.pointerId }); Object.defineProperty(this, "pointerType", { value: options.pointerType }); }
  };
  try {
    render(<ProfilePhotoEditor name="Alex" value={original} onChange={jest.fn()} />);
    upload(); await screen.findByRole("dialog");
    const frame = screen.getByRole("group", { name: "Déplacer la photo" });
    jest.spyOn(frame, "getBoundingClientRect").mockReturnValue({ left: 0, top: 0, width: 300, height: 300 });
    fireEvent.pointerDown(frame, { pointerId: 1, pointerType: "touch", clientX: 100, clientY: 150 });
    fireEvent.pointerMove(frame, { pointerId: 1, pointerType: "touch", clientX: 70, clientY: 150 });
    fireEvent.pointerDown(frame, { pointerId: 2, pointerType: "touch", clientX: 170, clientY: 150 });
    fireEvent.pointerMove(frame, { pointerId: 1, pointerType: "touch", clientX: 45, clientY: 150 });
    fireEvent.pointerMove(frame, { pointerId: 2, pointerType: "touch", clientX: 195, clientY: 150 });
    expect(screen.getByRole("slider")).toHaveValue("1.5");
    fireEvent.pointerUp(frame, { pointerId: 2 }); fireEvent.pointerUp(frame, { pointerId: 1 });
    fireEvent.click(screen.getByRole("button", { name: "Enregistrer la photo" }));
    await waitFor(() => expect(cropProfilePhoto).toHaveBeenCalled());
    expect(cropProfilePhoto.mock.calls[0][1].centerX).toBeGreaterThan(.5);
    expect(cropProfilePhoto.mock.calls[0][1].zoom).toBe(1.5);
  } finally { window.PointerEvent = OriginalPointerEvent; }
});
