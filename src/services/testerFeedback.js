export async function feedbackRequest(path, { method = "GET", body, secret, signal } = {}) {
  const controller = new AbortController();
  const timer = setTimeout(()=>controller.abort(),12000);
  const abort = () => controller.abort();
  signal?.addEventListener("abort",abort,{once:true});
  try {
    const response = await fetch(path,{method,signal:controller.signal,cache:"no-store",headers:{"Content-Type":"application/json",...(secret?{Authorization:"Bearer "+secret}:{})},...(body?{body:JSON.stringify(body)}:{})});
    const data = await response.json();
    if(!response.ok) throw new Error(data.error || "Impossible de charger les retours.");
    return data;
  } finally {clearTimeout(timer);signal?.removeEventListener("abort",abort);}
}
export const sendTesterFeedback = body => feedbackRequest("/api/feedback",{method:"POST",body});
