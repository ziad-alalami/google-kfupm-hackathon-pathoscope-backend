const BASE_URL = process.env.NEXT_PUBLIC_API_BASE;

export async function getAllNodes() {
  const res = await fetch(`${BASE_URL}/node/all`);
  if (!res.ok) throw new Error(`Failed to fetch nodes from endpoint: ${BASE_URL}/node/all`);
  return res.json();
}

export async function createNode(payload: any) {
  const res = await fetch(`${BASE_URL}/node/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to create node");
  return res.json();
}

export async function deleteNode(nodeId: string) {
  const res = await fetch(`${BASE_URL}/node/${nodeId}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete node");
  return res.json();
}

export async function runSimulation(params: any) {
  const res = await fetch(`${BASE_URL}/simulate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  if (!res.ok) throw new Error("Simulation failed");
  return res.json();
}

export async function sendToAgent(chatHistory: any[]) {
  const res = await fetch(`${BASE_URL}/agent`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_history: chatHistory }),
  });
  if (!res.ok) throw new Error("Agent failed");
  return res.json();
}
