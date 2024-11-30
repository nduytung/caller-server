const WebSocket = require("ws");

const wss = new WebSocket.Server({ port: 8080 });

console.log("Caller server ready on port 8080");

const clientSubscriptions = new Map();

wss.on("connection", (ws) => {
  console.log("New client connected. Total clients: ", wss.clients.size);

  clientSubscriptions.set(ws, new Set());

  ws.on("message", (message) => {
    try {
      const data = JSON.parse(message);

      console.log("received from client: ", data.type, data);

      if (data.type === "subscribe" && data.type && data.action) {
        clientSubscriptions.get(ws).add(data.action);
        console.log(`Client subscribed to: ${data.action}`);
      } else if (data.type !== "subscribe" && data.type) {
        broadcastMessage(data.type, data);
      }
    } catch (error) {
      console.error("Invalid message format:", message);
    }
  });

  ws.on("close", () => {
    console.log("Client disconnected.");
    clientSubscriptions.delete(ws);
  });

  ws.on("error", (error) => {
    console.error("WebSocket error:", error);
  });
});

// Broadcast messages to clients with the given subscription
function broadcastMessage(action, message) {
  for (const [client, subscriptions] of clientSubscriptions.entries()) {
    console.log("subscriptions: ", subscriptions);
    if (subscriptions.has(action) && client.readyState === WebSocket.OPEN) {
      console.log("found it!, sending");
      client.send(JSON.stringify(message));
    }
  }
}

async function listen() {
  const uri = "ws://188.245.35.202:8765";
  const websocket = new WebSocket(uri);

  websocket.on("open", () => {
    console.log("Connected to websocket server");
    const authMsg = JSON.stringify({
      user: "user1",
      password: "Password1q2w#E$R",
    });
    websocket.send(authMsg);
  });

  websocket.on("message", (message) => {
    try {
      const data = JSON.parse(message);

      console.log("received from wss remote: ", data);
      broadcastMessage("new_token_call_sig", {
        type: "new_token_call_sig",
        analyze: data?.message,
      });
    } catch (error) {
      console.error(`Error parsing message: ${error}`);
    }
  });

  websocket.on("error", (error) => {
    console.error(`WebSocket error: ${error}`);
  });

  websocket.on("close", () => {
    console.log("WebSocket connection closed");
  });

  setInterval(() => {}, 10_000);
}

listen();
