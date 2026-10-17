export async function feedbackRequest(path, { method = "GET", body, token, signal } = {}) {
  const controller = new AbortController();
  const timer = setTimeout(()=>controller.abort(),12000);
  const abort = () => controller.abort();
  signal?.addEventListener("abort",abort,{once:true});
  if (signal?.aborted) controller.abort();
  try {
    const response = await fetch(path,{method,signal:controller.signal,cache:"no-store",headers:{"Content-Type":"application/json",...(token?{Authorization:"Bearer "+token}:{})},...(body?{body:JSON.stringify(body)}:{})});
    const data = await response.json();
    if(!response.ok) throw new Error(data.error || "Impossible de charger les retours.");
    return data;
  } finally {clearTimeout(timer);signal?.removeEventListener("abort",abort);}
}
export const sendTesterFeedback = body => feedbackRequest("/api/feedback",{method:"POST",body});


export async function adminFeedbackRequest(path, options = {}) {
  const { auth } = await import("../firebase");
  const user = auth.currentUser;
  if (!user) throw new Error("Connecte-toi à ton compte pour ouvrir les retours.");
  const token = await user.getIdToken();
  return feedbackRequest(path, {...options, token});
}
