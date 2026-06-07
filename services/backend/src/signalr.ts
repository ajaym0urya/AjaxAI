import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';

let wss: WebSocketServer | null = null;
const clients = new Set<WebSocket>();

export function initSignalR(server: Server) {
  wss = new WebSocketServer({ noServer: true });

  server.on('upgrade', (request, socket, head) => {
    if (request.url === '/signalr') {
      wss?.handleUpgrade(request, socket, head, (ws) => {
        wss?.emit('connection', ws, request);
      });
    }
  });

  wss.on('connection', (ws) => {
    clients.add(ws);
    console.log(`[SignalR Hub] Client connected. Total: ${clients.size}`);

    ws.on('close', () => {
      clients.delete(ws);
      console.log(`[SignalR Hub] Client disconnected. Total: ${clients.size}`);
    });

    // Send a welcome message
    ws.send(JSON.stringify({
      type: 'connection_established',
      message: 'Connected to AjaxAI SignalR Gateway'
    }));
  });
}

export function broadcast(type: string, data: any) {
  const payload = JSON.stringify({ type, data });
  for (const client of clients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(payload);
    }
  }
}
