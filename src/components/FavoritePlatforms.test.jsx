import { useState } from "react";
import { fireEvent, render, screen, within } from "@testing-library/react";
import FavoritePlatforms, { FavoritePlatformTags } from "./FavoritePlatforms";

function Profile({ initial = "" }) {
  const [platform, setPlatform] = useState(initial);
  return <><FavoritePlatforms value={platform} onChange={setPlatform} /><output aria-label="Valeur enregistrée">{platform}</output><FavoritePlatformTags value={platform} /></>;
}

test("several choices are saved and displayed on the profile without duplicates", () => {
  render(<Profile initial="PS5" />);
  const select = screen.getByRole("combobox", { name: "Plateformes favorites" });
  fireEvent.change(select, { target: { value: "Nintendo Switch" } });
  expect(screen.getByLabelText("Valeur enregistrée")).toHaveTextContent("PlayStation 5, Nintendo Switch");
  expect(screen.getByRole("option", { name: "PlayStation 5" })).toBeDisabled();
  expect(screen.getByRole("option", { name: "Nintendo Switch" })).toBeDisabled();
  expect(select).toHaveValue("");
  expect(within(screen.getByRole("list", { name: "Plateformes favorites" })).getAllByRole("listitem")).toHaveLength(2);
});

test("removing a choice releases it in the menu and clearing the last choice saves an empty string", () => {
  render(<Profile initial="PC, Steam Deck" />);
  fireEvent.click(screen.getByRole("button", { name: "Retirer PC" }));
  expect(screen.getByLabelText("Valeur enregistrée")).toHaveTextContent(/^Steam Deck$/);
  expect(screen.getByRole("option", { name: "PC", exact: true })).not.toBeDisabled();
  fireEvent.click(screen.getByRole("button", { name: "Retirer Steam Deck" }));
  expect(screen.getByLabelText("Valeur enregistrée")).toBeEmptyDOMElement();
  expect(screen.queryByRole("list", { name: "Plateformes favorites" })).toBeNull();
});

test("an existing custom platform survives a new choice and can also be removed", () => {
  render(<Profile initial="Amiga 500" />);
  fireEvent.change(screen.getByRole("combobox"), { target: { value: "PC" } });
  expect(screen.getByLabelText("Valeur enregistrée")).toHaveTextContent("Amiga 500, PC");
  fireEvent.click(screen.getByRole("button", { name: "Retirer Amiga 500" }));
  expect(screen.getByLabelText("Valeur enregistrée")).toHaveTextContent(/^PC$/);
});

test("the initial default stays unsaved until a platform is chosen", () => {
  const onChange = jest.fn();
  render(<FavoritePlatforms value="Multi-plateforme" onChange={onChange} />);
  expect(screen.getByText("Aucune plateforme choisie pour le moment.")).toBeVisible();
  expect(onChange).not.toHaveBeenCalled();
  fireEvent.change(screen.getByRole("combobox"), { target: { value: "Xbox" } });
  expect(onChange).toHaveBeenCalledWith("Xbox");
});
