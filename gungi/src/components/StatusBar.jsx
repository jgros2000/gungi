// src/components/StatusBar.jsx

export default function StatusBar({
  phase, ready, placementTurn, currentTurn, playerNumber, playersCount, winner, onReady, onRestart,
}) {
  const isMyPlacementTurn = Number(placementTurn) === Number(playerNumber);
  const isMyMoveTurn      = Number(currentTurn) === Number(playerNumber);

  let message = "";
  if (playersCount < 2) {
    message = "Waiting for opponent to connect...";
  } else if (phase === "placement") {
    if (ready[playerNumber]) {
      message = "Waiting for opponent to finish placing...";
    } else if (isMyPlacementTurn) {
      message = "Your turn to place — drag a piece onto your zone.";
    } else {
      message = "Opponent is placing a piece...";
    }
  } else if (phase === "playing") {
    message = isMyMoveTurn ? "Your turn — click a piece to move." : "Opponent's turn...";
  } else if (phase === "ended") {
    message = winner === playerNumber ? "You win! 🎉" : "Opponent wins.";
  }

  const bg = phase === "ended"
    ? (winner === playerNumber ? "#EAF3DE" : "#FCEBEB")
    : (phase === "playing" && isMyMoveTurn) || (phase === "placement" && isMyPlacementTurn && !ready[playerNumber])
      ? "#E6F1FB"
      : "#F1EFE8";

  const color = phase === "ended"
    ? (winner === playerNumber ? "#3B6D11" : "#A32D2D")
    : (phase === "playing" && isMyMoveTurn) || (phase === "placement" && isMyPlacementTurn && !ready[playerNumber])
      ? "#185FA5"
      : "#5F5E5A";

  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <span style={{ fontSize: 13, color: "#888" }}>
          You are <strong style={{ color: "#222", fontWeight: 500 }}>Player {playerNumber}</strong>
        </span>
        <div style={{ display: "flex", gap: 8 }}>
          {phase === "placement" && !ready[playerNumber] && playersCount === 2 && (
            <button onClick={onReady} style={{
              padding: "6px 16px", borderRadius: 8,
              border: "0.5px solid #3B6D11", background: "#EAF3DE",
              color: "#3B6D11", cursor: "pointer", fontSize: 13, fontWeight: 500,
            }}>
              Ready
            </button>
          )}
          {phase === "ended" && (
            <button onClick={onRestart} style={{
              padding: "6px 16px", borderRadius: 8,
              border: "0.5px solid #ccc", background: "transparent",
              cursor: "pointer", fontSize: 13,
            }}>
              Restart
            </button>
          )}
        </div>
      </div>
      <div style={{ padding: "8px 12px", borderRadius: 8, fontSize: 13, background: bg, color }}>
        {message}
      </div>
    </div>
  );
}