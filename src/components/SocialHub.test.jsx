import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { SocialFriendsDirectory, SocialNavigation, FriendsActivityFeed } from "./SocialHub";

const friends = [{ handle: "alex", displayName: "Alex", platform: "Switch" }, { handle: "sam", displayName: "Sam" }];
test("friend identities and the profile button open the chosen friend", async () => {
  const onOpen = jest.fn().mockResolvedValue(undefined);
  render(<SocialFriendsDirectory friends={friends} onOpen={onOpen} onRemove={jest.fn()} />);
  fireEvent.change(screen.getByRole("searchbox"), { target: { value: "alex" } });
  expect(screen.queryByText("Sam")).toBeNull();
  fireEvent.click(screen.getByRole("button", { name: "Voir le profil" }));
  await waitFor(() => expect(onOpen).toHaveBeenCalledWith("alex"));
  await waitFor(() => expect(screen.getByRole("button", { name: "Voir le profil" })).not.toBeDisabled());
  fireEvent.click(screen.getByRole("button", { name: "Voir le profil de Alex" }));
  await waitFor(() => expect(onOpen).toHaveBeenCalledTimes(2));
});
test("a private profile shows an actionable error and permits retry", async () => {
  const onOpen = jest.fn().mockRejectedValue(new Error("Ce profil est privé."));
  render(<SocialFriendsDirectory friends={[friends[0]]} onOpen={onOpen} onRemove={jest.fn()} />);
  fireEvent.click(screen.getByRole("button", { name: "Voir le profil" }));
  expect(await screen.findByRole("alert")).toHaveTextContent("Ce profil est privé.");
  expect(screen.getByRole("button", { name: "Voir le profil" })).not.toBeDisabled();
});
test("identity and showcase share one top-level profile destination", () => {
  const onChange = jest.fn();
  render(<SocialNavigation view="showcase" onChange={onChange} profile={{ displayName: "Alex" }} friendCount={2} />);
  expect(screen.getByRole("button", { name: "Mon profil" })).toHaveAttribute("aria-pressed", "true");
  fireEvent.click(screen.getByRole("button", { name: /Amis/ }));
  expect(onChange).toHaveBeenCalledWith("friends");
});
test("loads friends' public activity and opens its author", async () => {
  const loadProfile = jest.fn().mockResolvedValue({ handle: "alex", displayName: "Alex", recentActivity: [{ id: "1", title: "Zelda", text: "Une belle aventure", date: "2026-10-14" }] });
  const onOpen = jest.fn().mockResolvedValue(undefined);
  render(<FriendsActivityFeed friends={[friends[0]]} loadProfile={loadProfile} onOpen={onOpen} />);
  expect(await screen.findByText("Zelda")).toBeInTheDocument();
  expect(loadProfile).toHaveBeenCalledWith("alex");
  fireEvent.click(screen.getByRole("button", { name: /Alex.*Voir le profil/ }));
  await waitFor(() => expect(onOpen).toHaveBeenCalledWith("alex"));
});
