// src/App.jsx
import { useState, useEffect, useRef, useCallback } from "react";
import Board from "./components/Board";
import StatusBar from "./components/StatusBar";
import PieceTray from "./components/PieceTray";

const WS_URL = "ws://localhost:8080";

export default function App() {
  const [playerNumber, setPlayerNumber]     = useState(null);
  const [playersCount, setPlayersCount]     = useState(0);
  const [game, setGame]                     = useState(null);
  const [errorMsg, setErrorMsg]             = useState(null);
  const [draggingPiece, setDraggingPiece]   = useState(null);
  const wsRef = useRef(null);

  // ── WebSocket connection ───────────────────────────────────────────────────
  useEffect(() => {
    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      switch (msg.type) {
        case "assigned":
          setPlayerNumber(Number(msg.player));
          break;
        case "game_state":
          setGame(msg.game);
          setPlayersCount(Number(msg.playersCount));
          break;
        case "opponent_disconnected":
          setErrorMsg("Opponent disconnected.");
          break;
        case "error":
          setErrorMsg(msg.message);
          setTimeout(() => setErrorMsg(null), 3000);
          break;
      }
    };

    ws.onclose = () => setErrorMsg("Disconnected from server.");
    ws.onerror = () => setErrorMsg("Connection error. Is the server running?");
    return () => ws.close();
  }, []);

  // ── Send helper ────────────────────────────────────────────────────────────
  const send = useCallback((payload) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(payload));
    }
  }, []);

  // ── Game actions ───────────────────────────────────────────────────────────
  const handlePlacePiece  = (row, col, piece) => send({ type: "place_piece", row, col, piece });
  const handleRemovePiece = (row, col)        => send({ type: "remove_piece", row, col });
  const handleReady       = ()                => send({ type: "set_ready" });
  const handleMovePiece   = (fromRow, fromCol, toRow, toCol) =>
    send({ type: "move_piece", fromRow, fromCol, toRow, toCol });
  const handleRestart     = ()                => send({ type: "restart" });

  const handleDragStart = (type) => setDraggingPiece(type);
  const handleDragEnd   = ()     => setDraggingPiece(null);

  if (!game || !playerNumber) {
    return (
      <div style={{ fontFamily: "system-ui, sans-serif", maxWidth: 520, margin: "0 auto", padding: "24px 16px" }}>
        <p style={{ color: "#888", fontSize: 14 }}>Connecting to server...</p>
      </div>
    );
  }

  const isMyPlacementTurn = game.placementTurn === playerNumber;

  // Show tray only during placement, before ready, and when it's your turn
  const showTray = game.phase === "placement"
    && !game.ready[playerNumber]
    && playersCount === 2;

  return (
    <div
      style={{ fontFamily: "system-ui, sans-serif", maxWidth: 520, margin: "0 auto", padding: "24px 16px" }}
      onDragEnd={handleDragEnd}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <h1 style={{ fontSize: 20, fontWeight: 600, margin: 0 }}>Chess</h1>
        <span style={{
          padding: "3px 10px", borderRadius: 20, fontSize: 12,
          background: game.phase === "playing" ? "#E6F1FB" : "#F1EFE8",
          color:      game.phase === "playing" ? "#185FA5" : "#5F5E5A",
        }}>
          {game.phase === "placement" ? "Setup" : game.phase === "playing" ? "Playing" : "Ended"}
        </span>
      </div>

      {/* Status bar */}
      <StatusBar
        phase={game.phase}
        ready={game.ready}
        placementTurn={game.placementTurn}
        currentTurn={game.currentTurn}
        playerNumber={playerNumber}
        playersCount={playersCount}
        winner={game.winner}
        onReady={handleReady}
        onRestart={handleRestart}
      />

      {/* Error message */}
      {errorMsg && (
        <div style={{
          padding: "8px 12px", borderRadius: 8, marginBottom: 12,
          background: "#FCEBEB", color: "#A32D2D", fontSize: 13,
        }}>
          {errorMsg}
        </div>
      )}

      {/* Board */}
      <Board
        board={game.board}
        playerNumber={playerNumber}
        phase={game.phase}
        placementTurn={game.placementTurn}
        currentTurn={game.currentTurn}
        ready={game.ready}
        playersCount={playersCount}
        draggingPiece={draggingPiece}
        onPlacePiece={handlePlacePiece}
        onRemovePiece={handleRemovePiece}
        onMovePiece={handleMovePiece}
      />

      {/* Piece tray — grayed out when it's not your placement turn */}
      {showTray && (
        <div style={{ opacity: isMyPlacementTurn ? 1 : 0.4, pointerEvents: isMyPlacementTurn ? "auto" : "none" }}>
          <PieceTray
            board={game.board}
            playerNumber={playerNumber}
            onDragStart={handleDragStart}
          />
        </div>
      )}

      {/* Legend */}
      <div style={{ marginTop: 12, display: "flex", gap: 16, fontSize: 12, color: "#888" }}>
        <span><span style={{ fontWeight: 500, color: "#185FA5" }}>Blue</span> = Player 1</span>
        <span><span style={{ fontWeight: 500, color: "#A32D2D" }}>Red</span> = Player 2</span>
        {game.phase === "placement" && (
          <span>Right-click your piece to remove it</span>
        )}
      </div>
    </div>
  );
}