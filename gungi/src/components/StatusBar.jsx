// ─── StatusBar ───────────────────────────────────────────────────────────────

function StatusBar({ phase, ready, currentTurn, playerNumber, playersCount, winner, onReady, onRestart }) {
  const isMyTurn = currentTurn === playerNumber;

  let message = "";
  if (playersCount < 2) message = "Waiting for opponent to connect...";
  else if (phase === "placement") {
    if (ready[playerNumber]) message = "Waiting for opponent to press Ready...";
    else message = "Place your pieces, then press Ready.";
  } else if (phase === "playing") {
    message = isMyTurn ? "Your turn — click one of your pieces." : "Opponent's turn...";
  } else if (phase === "ended") {
    message = winner === playerNumber ? "You win!" : "Opponent wins!";
  }

  const bgColor = phase === "ended"
    ? (winner === playerNumber ? "#EAF3DE" : "#FCEBEB")
    : playersCount === 2 && phase === "playing" && isMyTurn ? "#E6F1FB" : "#F1EFE8";

  const textColor = phase === "ended"
    ? (winner === playerNumber ? "#3B6D11" : "#A32D2D")
    : playersCount === 2 && phase === "playing" && isMyTurn ? "#185FA5" : "#5F5E5A";

  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <div>
          <span style={{ fontSize: 13, color: "#888" }}>You are </span>
          <span style={{ fontSize: 14, fontWeight: 500 }}>Player {playerNumber}</span>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {phase === "placement" && !ready[playerNumber] && playersCount === 2 && (
            <button onClick={onReady} style={{
              padding: "6px 16px", borderRadius: 8, border: "0.5px solid #3B6D11",
              background: "#EAF3DE", color: "#3B6D11", cursor: "pointer", fontSize: 13, fontWeight: 500,
            }}>
              Ready
            </button>
          )}
          {(phase === "ended") && (
            <button onClick={onRestart} style={{
              padding: "6px 16px", borderRadius: 8, border: "0.5px solid #ccc",
              background: "transparent", cursor: "pointer", fontSize: 13,
            }}>
              Restart
            </button>
          )}
        </div>
      </div>
      <div style={{ padding: "8px 12px", borderRadius: 8, fontSize: 13, background: bgColor, color: textColor }}>
        {message}
      </div>
    </div>
  );
}

export default StatusBar;