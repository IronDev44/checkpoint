import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import ProfilePhotoEditor, { SocialAvatar } from "./ProfilePhoto";
import { prepareProfilePhoto } from "../services/profilePhoto";
jest.mock("../services/profilePhoto", () => ({ prepareProfilePhoto: jest.fn() }));

test("uploads a prepared photo then allows removing it", async () => {
  const url = "data:image/jpeg;base64,photo";
  prepareProfilePhoto.mockResolvedValue(url);
  const onChange = jest.fn();
  const view = render(<ProfilePhotoEditor name="Alex" value="" onChange={onChange} />);
  fireEvent.change(screen.getByLabelText("Choisir une photo de profil"), { target: { files: [new File(["photo"], "photo.jpg", { type: "image/jpeg" })] } });
  await waitFor(() => expect(onChange).toHaveBeenCalledWith(url));
  view.rerender(<ProfilePhotoEditor name="Alex" value={url} onChange={onChange} />);
  fireEvent.click(screen.getByRole("button", { name: "Retirer la photo" }));
  await waitFor(() => expect(onChange).toHaveBeenLastCalledWith(""));
});
test("failed decoding keeps the previous photo", async () => {
  prepareProfilePhoto.mockRejectedValue(new Error("Format non reconnu"));
  const onChange = jest.fn();
  const view = render(<ProfilePhotoEditor name="Alex" value="data:image/jpeg;base64,old" onChange={onChange} />);
  fireEvent.change(screen.getByLabelText("Choisir une photo de profil"), { target: { files: [new File(["bad"], "photo.jpg", { type: "image/jpeg" })] } });
  expect(await screen.findByRole("alert")).toHaveTextContent("Format non reconnu");
  expect(onChange).not.toHaveBeenCalled();
  expect(view.container.querySelector("img")).toHaveAttribute("src", "data:image/jpeg;base64,old");
});
test("broken avatars fall back to initials", () => {
  const view = render(<SocialAvatar name="Alex Smith" src="missing.jpg" />);
  fireEvent.error(view.container.querySelector("img"));
  expect(screen.getByText("AS")).toBeInTheDocument();
});
