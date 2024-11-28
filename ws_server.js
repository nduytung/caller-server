// Import the WebSocket library
const WebSocket = require("ws");

// WebSocket Server Setup
const wss = new WebSocket.Server({ port: 8080 });

console.log("Server started on port 8080");

// Map to track client subscriptions
const clientSubscriptions = new Map();

wss.on("connection", (ws) => {
  console.log("Client connected.");

  // Initialize an empty set of subscriptions for each client
  clientSubscriptions.set(ws, new Set());

  // Listen for messages from the client
  ws.on("message", (message) => {
    // Parse the message (assuming it's JSON)
    try {
      const data = JSON.parse(message);

      console.log("received from client: ", data.action);

      if (data.type === "subscribe" && data.action) {
        // Add the action to the client's subscription set
        clientSubscriptions.get(ws).add(data.action);
        console.log(`Client subscribed to: ${data.action}`);
      } else if (data.type === "unsubscribe" && data.action) {
        // Remove the action from the client's subscription set
        clientSubscriptions.get(ws).delete(data.action);
        console.log(`Client unsubscribed from: ${data.action}`);
      } else {
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
  console.log("broadcasting msg: ", action);
  for (const [client, subscriptions] of clientSubscriptions.entries()) {
    if (subscriptions.has(action) && client.readyState === WebSocket.OPEN) {
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
      broadcastMessage("new_token_call", {
        type: "new_token_call",
        message: data,
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
