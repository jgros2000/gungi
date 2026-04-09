// src/components/PieceTray.jsx
// Draggable piece tray shown during placement phase.
// Each piece shows how many the player has left to place.

import { PIECES, PIECE_NAMES, PIECE_LIMITS, countPieces } from "../utils/moves";

export default function PieceTray({ board, playerNumber, onDragStart }) {
  const placed = countPieces(board, playerNumber);

  return (
    <div style={{
      marginTop: 12,
      padding: "12px 16px",
      border: "0.5px solid #ddd",
      borderRadius: 10,
      background: "#fafaf8",
    }}>
      <p style={{ fontSize: 12, color: "#888", marginBottom: 10 }}>
        Drag a piece onto your zone (first 3 rows)
      </p>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {PIECES.map((type) => {
          const remaining = PIECE_LIMITS[type] - (placed[type] || 0);
          const exhausted = remaining <= 0;

          return (
            <div
              key={type}
              draggable={!exhausted}
              onDragStart={(e) => {
                if (exhausted) { e.preventDefault(); return; }
                onDragStart(type);
                // Store piece type in drag event so drop handler can read it
                e.dataTransfer.setData("pieceType", type);
                e.dataTransfer.effectAllowed = "copy";
              }}
              title={`${PIECE_NAMES[type]} — ${remaining} left`}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                width: 52,
                height: 56,
                border: `0.5px solid ${exhausted ? "#e0e0e0" : "#bbb"}`,
                borderRadius: 8,
                background: exhausted ? "#f0f0f0" : "white",
                cursor: exhausted ? "not-allowed" : "grab",
                opacity: exhausted ? 0.4 : 1,
                userSelect: "none",
                transition: "box-shadow 0.1s, transform 0.1s",
              }}
              onMouseEnter={(e) => {
                if (!exhausted) e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.12)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <span style={{
                fontSize: 20,
                fontWeight: 700,
                color: playerNumber === 1 ? "#185FA5" : "#A32D2D",
              }}>
                {type}
              </span>
              <span style={{ fontSize: 10, color: "#aaa", marginTop: 2 }}>
                {remaining}/{PIECE_LIMITS[type]}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
