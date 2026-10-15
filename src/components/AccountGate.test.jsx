import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { setPersistence, signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import AccountGate from "./AccountGate";
jest.mock("./StartupIntro", () => ({ __esModule: true, default: ({ onComplete }) => { require("react").useEffect(onComplete, [onComplete]); return null; } }));
jest.mock("../firebase", () => ({auth:{currentUser:null}}));
jest.mock("../services/accountData", () => ({accountsEnabled:true,accountStorage:{getItem:jest.fn(),setItem:jest.fn()}}));
jest.mock("firebase/auth", () => ({
  onAuthStateChanged: (_, callback) => { callback(null); return () => {}; },
  setPersistence:jest.fn(), signInWithEmailAndPassword:jest.fn(),
  sendPasswordResetEmail:jest.fn(),
  browserLocalPersistence:"local", browserSessionPersistence:"session",
}));
beforeEach(() => { localStorage.clear(); jest.clearAllMocks(); setPersistence.mockResolvedValue(); signInWithEmailAndPassword.mockResolvedValue(); sendPasswordResetEmail.mockResolvedValue(); });
function loginForm() {
  render(<AccountGate><div>Mon espace</div></AccountGate>);
  fireEvent.click(screen.getByRole("button",{name:"J’ai déjà un compte"}));
  fireEvent.change(screen.getByLabelText("Adresse e-mail"),{target:{value:"test@example.com"}});
  fireEvent.change(screen.getByLabelText("Mot de passe",{exact:true}),{target:{value:"test-password"}});
}
test("keeps the connection across openings when requested, before signing in",async()=>{
  loginForm();
  expect(screen.getByRole("checkbox",{name:/Rester connecté/}).checked).toBe(true);
  fireEvent.click(screen.getByRole("button",{name:"Se connecter",exact:true}));
  await waitFor(()=>expect(signInWithEmailAndPassword).toHaveBeenCalled());
  expect(setPersistence.mock.calls[0][1]).toBe("local");
  expect(setPersistence.mock.invocationCallOrder[0]).toBeLessThan(signInWithEmailAndPassword.mock.invocationCallOrder[0]);
});
test("uses only the browser session when staying connected is unchecked",async()=>{
  loginForm();fireEvent.click(screen.getByRole("checkbox",{name:/Rester connecté/}));
  fireEvent.click(screen.getByRole("button",{name:"Se connecter",exact:true}));
  await waitFor(()=>expect(signInWithEmailAndPassword).toHaveBeenCalled());
  expect(setPersistence.mock.calls[0][1]).toBe("session");
  expect(localStorage.getItem("checkpoint-remember-login")).toBe("false");
});
test("does not silently sign in if persistence cannot be configured",async()=>{
  setPersistence.mockRejectedValue(new Error("Unavailable"));loginForm();
  fireEvent.click(screen.getByRole("button",{name:"Se connecter",exact:true}));
  await screen.findByRole("status");expect(signInWithEmailAndPassword).not.toHaveBeenCalled();
});
test("forgotten password is accessible without an email and opens a dedicated form",async()=>{
  render(<AccountGate><div>Mon espace</div></AccountGate>);
  fireEvent.click(screen.getByRole("button",{name:"J’ai déjà un compte"}));
  const button=screen.getByRole("button",{name:"Mot de passe oublié"});expect(button.disabled).toBe(false);
  fireEvent.click(button);
  expect(screen.getByRole("heading",{name:"Retrouver ton compte"})).toBeTruthy();
  expect(screen.queryByLabelText("Mot de passe",{exact:true})).toBeNull();
  expect(sendPasswordResetEmail).not.toHaveBeenCalled();
  fireEvent.change(screen.getByLabelText("Adresse e-mail"),{target:{value:"test@example.com"}});
  fireEvent.click(screen.getByRole("button",{name:"Envoyer le lien"}));
  await waitFor(()=>expect(sendPasswordResetEmail).toHaveBeenCalledWith(expect.anything(),"test@example.com"));
  expect(await screen.findByRole("status")).toBeTruthy();
  expect(signInWithEmailAndPassword).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole("button",{name:"Retour à la connexion"}));
  expect(screen.getByLabelText("Mot de passe",{exact:true})).toBeTruthy();
});
