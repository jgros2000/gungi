// App.js — Chess WebSocket Server
// Run: node App.js
// Requires: npm install ws

const { WebSocketServer } = require("ws");
const { createGame, placePiece, removePiece, setReady, movePiece } = require("./gameState");

const PORT = 8080;
const wss = new WebSocketServer({ port: PORT });

let clients = [];
let game = createGame();

wss.on("connection", (ws) => {
  if (clients.length >= 2) {
    ws.send(JSON.stringify({ type: "error", message: "Game is full." }));
    ws.close();
    return;
  }

  const playerNumber = clients.length + 1;
  ws.playerNumber = playerNumber;
  clients.push(ws);

  console.log(`Player ${playerNumber} connected.`);

  // Tell this client who they are and send the current game state
  ws.send(JSON.stringify({ type: "assigned", player: playerNumber }));
  broadcast({ type: "game_state", game: serializeGame(game), playersCount: clients.length });

  ws.on("message", (data) => {
    let msg;
    try { msg = JSON.parse(data); }
    catch { return; }

    const player = ws.playerNumber;

    switch (msg.type) {

      // Player places a piece during setup
      case "place_piece": {
        const result = placePiece(game, player, msg.row, msg.col, msg.piece);
        if (!result.ok) {
          ws.send(JSON.stringify({ type: "error", message: result.reason }));
          return;
        }
        broadcast({ type: "game_state", game: serializeGame(game), playersCount: clients.length });
        break;
      }

      // Player removes a piece during setup
      case "remove_piece": {
        const result = removePiece(game, player, msg.row, msg.col);
        if (!result.ok) {
          ws.send(JSON.stringify({ type: "error", message: result.reason }));
          return;
        }
        broadcast({ type: "game_state", game: serializeGame(game), playersCount: clients.length });
        break;
      }

      // Player presses Ready
      case "set_ready": {
        const result = setReady(game, player);
        if (!result.ok) {
          ws.send(JSON.stringify({ type: "error", message: result.reason }));
          return;
        }
        broadcast({ type: "game_state", game: serializeGame(game), playersCount: clients.length });
        break;
      }

      // Player moves a piece
      case "move_piece": {
        const result = movePiece(game, player, msg.fromRow, msg.fromCol, msg.toRow, msg.toCol);
        if (!result.ok) {
          ws.send(JSON.stringify({ type: "error", message: result.reason }));
          return;
        }
        broadcast({ type: "game_state", game: serializeGame(game), playersCount: clients.length });
        if (result.winner) {
          broadcast({ type: "game_over", winner: result.winner });
        }
        break;
      }

      // Player wants to restart
      case "restart": {
        game = createGame();
        broadcast({ type: "game_state", game: serializeGame(game), playersCount: clients.length });
        break;
      }
    }
  });

  ws.on("close", () => {
    clients = clients.filter((c) => c !== ws);
    console.log(`Player ${ws.playerNumber} disconnected.`);
    broadcast({ type: "game_state", game: serializeGame(game), playersCount: clients.length });
    broadcast({ type: "opponent_disconnected" });
  });

  ws.on("error", (err) => console.error(`WS error:`, err.message));
});

// Strip functions, keep only data safe to send to clients
function serializeGame(game) {
  return {
    board: game.board,
    phase: game.phase,
    placementTurn: game.placementTurn,
    ready: game.ready,
    currentTurn: game.currentTurn,
    winner: game.winner,
  };
}

function broadcast(payload) {
  const msg = JSON.stringify(payload);
  clients.forEach((c) => { if (c.readyState === 1) c.send(msg); });
}

console.log(`Chess server running on ws://localhost:${PORT}`);
