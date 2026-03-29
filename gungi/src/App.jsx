// index.jsx — Chess Game React Client (Vite)
// Place this file as src/index.jsx or replace src/main.jsx entry point
// Run: npm create vite@latest chess-client -- --template react
//      cd chess-client && npm install && npm run dev

import { useState, useEffect, useRef, useCallback } from "react";
import { createRoot } from "react-dom/client";

const WS_URL = "ws://localhost:8080";
const GRID_SIZE = 9;

// Build an empty 9x9 grid
const emptyGrid = () =>
  Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(null));

function App() {
  const [grid, setGrid] = useState(emptyGrid);         // null | "mine" | "opponent"
  const [playerNumber, setPlayerNumber] = useState(null);
  const [playersCount, setPlayersCount] = useState(0);
  const [status, setStatus] = useState("Connecting...");
  const [opponentLeft, setOpponentLeft] = useState(false);
  const wsRef = useRef(null);

  // Connect to WebSocket server
  useEffect(() => {
    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;

    ws.onopen = () => {
      setStatus("Connected — waiting for opponent...");
    };

    ws.onmessage = (event) => {
      let msg;
      try {
        msg = JSON.parse(event.data);
      } catch {
        return;
      }

      switch (msg.type) {
        // Server tells us our player number
        case "assigned":
          setPlayerNumber(msg.player);
          break;

        // Server tells us how many players are in the game
        case "players_count":
          setPlayersCount(msg.count);
          if (msg.count === 2) {
            setStatus("Game on! Click any cell.");
            setOpponentLeft(false);
          } else {
            setStatus("Waiting for opponent to connect...");
          }
          break;

        // The other player clicked a cell — color it red on our board
        case "opponent_click":
          setGrid((prev) => {
            const next = prev.map((r) => [...r]);
            next[msg.row][msg.col] = "opponent";
            return next;
          });
          break;

        // Opponent disconnected
        case "opponent_disconnected":
          setOpponentLeft(true);
          setStatus("Opponent disconnected. Waiting for them to reconnect...");
          break;

        case "error":
          setStatus(`Error: ${msg.message}`);
          break;

        default:
          break;
      }
    };

    ws.onclose = () => setStatus("Disconnected from server.");
    ws.onerror = () => setStatus("Connection error. Is the server running?");

    return () => ws.close();
  }, []);

  // Handle our own click on a cell
  const handleCellClick = useCallback(
    (row, col) => {
      if (playersCount < 2) return; // Don't allow clicks until both players are in

      // Update our own grid
      setGrid((prev) => {
        const next = prev.map((r) => [...r]);
        // Toggle off if already mine, otherwise mark as mine
        next[row][col] = prev[row][col] === "mine" ? null : "mine";
        return next;
      });

      // Send click to server (which forwards to opponent)
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type: "cell_click", row, col }));
      }
    },
    [playersCount]
  );

  // Reset the board
  const handleReset = () => {
    setGrid(emptyGrid());
  };

  const getCellStyle = (value) => {
    const base = {
      width: "100%",
      aspectRatio: "1",
      border: "1px solid #ccc",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      cursor: playersCount === 2 ? "pointer" : "default",
      transition: "background 0.15s",
      fontSize: "10px",
      color: "#999",
    };

    if (value === "mine") {
      return { ...base, background: "#5DCAA5", color: "#085041" }; // teal — my clicks
    }
    if (value === "opponent") {
      return { ...base, background: "#F0997B", color: "#712B13" }; // red/coral — opponent
    }
    return { ...base, background: "#F8F7F3" };
  };

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", maxWidth: 520, margin: "0 auto", padding: "24px 16px" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 600, margin: 0 }}>Chess Board</h1>
          <p style={{ fontSize: 13, color: "#888", margin: "4px 0 0" }}>
            {playerNumber ? `You are Player ${playerNumber}` : "Connecting..."}
          </p>
        </div>
        <button
          onClick={handleReset}
          style={{
            padding: "6px 14px",
            fontSize: 13,
            borderRadius: 8,
            border: "1px solid #ccc",
            background: "transparent",
            cursor: "pointer",
          }}
        >
          Reset
        </button>
      </div>

      {/* Status bar */}
      <div
        style={{
          padding: "8px 12px",
          borderRadius: 8,
          marginBottom: 16,
          fontSize: 13,
          background: playersCount === 2 ? "#EAF3DE" : "#FAEEDA",
          color: playersCount === 2 ? "#3B6D11" : "#854F0B",
        }}
      >
        {status}
      </div>

      {/* 9x9 Board */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
          border: "2px solid #888",
          borderRadius: 6,
          overflow: "hidden",
          width: "100%",
        }}
      >
        {grid.map((row, rIdx) =>
          row.map((cell, cIdx) => (
            <div
              key={`${rIdx}-${cIdx}`}
              style={getCellStyle(cell)}
              onClick={() => handleCellClick(rIdx, cIdx)}
              title={`Row ${rIdx + 1}, Col ${cIdx + 1}`}
            >
              {rIdx === 0 && cIdx === 0 ? "" : ""}
            </div>
          ))
        )}
      </div>

      {/* Legend */}
      <div style={{ display: "flex", gap: 20, marginTop: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#666" }}>
          <div style={{ width: 14, height: 14, borderRadius: 3, background: "#5DCAA5" }} />
          Your clicks
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#666" }}>
          <div style={{ width: 14, height: 14, borderRadius: 3, background: "#F0997B" }} />
          Opponent clicks
        </div>
      </div>
    </div>
  );
}

// Mount React app
const root = createRoot(document.getElementById("root"));
root.render(<App />);
