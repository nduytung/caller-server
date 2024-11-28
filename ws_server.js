
const WebSocket = require("ws");


const wss = new WebSocket.Server({ port: 8080 });

console.log("Server started on port 8080");


const clientSubscriptions = new Map();

wss.on("connection", (ws) => {
  console.log("Client connected.");

  
  clientSubscriptions.set(ws, new Set());

  
  ws.on("message", (message) => {
    
    try {
      const data = JSON.parse(message);

      console.log("received from client: ", data.action);

      if (data.type === "subscribe" && data.action) {
        
        clientSubscriptions.get(ws).add(data.action);
        console.log(`Client subscribed to: ${data.action}`);
      } else if (data.type === "unsubscribe" && data.action) {
        
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


function broadcastMessage(action, message) {
  console.log("broadcasting msg: ", action);
  for (const [client, subscriptions] of clientSubscriptions.entries()) {
    if (subscriptions.has(action) && client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(message));
    }
  }
}

async function listen() {
  const uri = "ws:
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
