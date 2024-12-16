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

class ForwardMessageWebSocket {
    constructor(url) {
        this.url = url;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 10;
        this.reconnectInterval = 1000; // Start with 1 second
        this.maxReconnectInterval = 30000; // Cap at 30 seconds
        this.websocket = null;

        this.connect();
    }

    connect() {
        this.websocket = new WebSocket(this.url);

        this.websocket.onopen = () => {
            console.log("Connected to websocket server");
            this.reconnectAttempts = 0; // Reset attempts on successful connection
            const authMsg = JSON.stringify({
                user: "user1",
                password: "Password1q2w#E$R",
            });
            this.websocket.send(authMsg);
        };

        this.websocket.on("message", (message) => {
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

        this.websocket.onclose = (event) => {
            console.warn("WebSocket closed:", event);
            this.reconnect();
        };

        this.websocket.onerror = (event) => {
            console.error("WebSocket error:", event);
            this.websocket.close(); // Trigger onclose for cleanup and reconnection
        };
    }

    reconnect() {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            console.error(
                "Max reconnect attempts reached. Stopping reconnect attempts."
            );
            return;
        }

        const reconnectDelay = Math.min(
            this.reconnectInterval * Math.pow(2, this.reconnectAttempts),
            this.maxReconnectInterval
        );

        console.log(
            `Attempting to reconnect in ${reconnectDelay / 1000} seconds...`
        );
        this.reconnectAttempts++;

        setTimeout(() => {
            this.connect();
        }, reconnectDelay);
    }

    close() {
        if (this.websocket) {
            this.websocket.onclose = null; // Prevent triggering the reconnection logic
            this.websocket.close();
        }
    }
}

// Usage
const ws = new ForwardMessageWebSocket("ws://188.245.35.202:8765");