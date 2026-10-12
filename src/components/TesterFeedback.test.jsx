import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import TesterFeedback from "./TesterFeedback";

beforeEach(()=>localStorage.clear());
test("keeps the report draft when sending fails",async()=>{
  const submit=jest.fn().mockRejectedValue(new Error("Serveur indisponible."));
  render(<TesterFeedback onSubmit={submit} />);
  fireEvent.click(screen.getByRole("button",{name:"Faire un retour"}));
  fireEvent.change(screen.getByLabelText("Qu’est-ce qui ne va pas ?"),{target:{value:"Le bouton du profil ne répond pas."}});
  fireEvent.click(screen.getByRole("button",{name:"Envoyer mon retour"}));
  await waitFor(()=>expect(screen.getByRole("status").textContent).toContain("brouillon est conservé"));
  expect(JSON.parse(localStorage.getItem("checkpoint-feedback-draft")).message).toContain("bouton du profil");
});
test("clears the draft only after server confirmation",async()=>{
  const submit=jest.fn().mockResolvedValue({ok:true});
  render(<TesterFeedback onSubmit={submit} />);
  fireEvent.click(screen.getByRole("button",{name:"Faire un retour"}));
  fireEvent.change(screen.getByLabelText("Qu’est-ce qui ne va pas ?"),{target:{value:"Le curseur de notation saccade."}});
  fireEvent.click(screen.getByRole("button",{name:"Envoyer mon retour"}));
  await waitFor(()=>expect(screen.getByRole("status").textContent).toContain("bien été envoyé"));
  expect(localStorage.getItem("checkpoint-feedback-draft")).toBeNull();
  expect(submit.mock.calls[0][0].context).toHaveProperty("viewport");
});
