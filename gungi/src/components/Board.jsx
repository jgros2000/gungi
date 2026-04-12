// src/components/Board.jsx
import { useState } from "react";
import { getValidMoves, top, PLACEMENT_ROWS } from "../utils/moves";

const GRID_SIZE  = 9;
const STACK_OFFSET = 6; // px each disc shifts upward

const PLAYER_COLORS = {
  1: { bg: "#2563EB", border: "#1D4ED8", text: "#fff" },
  2: { bg: "#DC2626", border: "#B91C1C", text: "#fff" },
};

function DiscStack({ stack }) {
  if (stack.length === 0) return null;

  // Total vertical space the stack occupies so the cell can reserve it
  const totalOffset = (stack.length - 1) * STACK_OFFSET;

  return (
    <div style={{
      position: "absolute",
      // Center horizontally, anchor to bottom of cell
      left: "50%",
      bottom: 6,
      transform: "translateX(-50%)",
      width: 34,
      // Height grows with stack so discs don't clip into the cell above
      height: 34 + totalOffset,
      pointerEvents: "none",
    }}>
      {stack.map((piece, i) => {
        const c = PLAYER_COLORS[piece.player];
        const isTop = i === stack.length - 1;
        const bottomOffset = i * STACK_OFFSET;

        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: 0,
              bottom: bottomOffset,
              width: 34,
              height: 34,
              borderRadius: "50%",
              background: c.bg,
              border: `2px solid ${c.border}`,
              boxShadow: isTop
                ? "0 2px 5px rgba(0,0,0,0.3)"
                : "0 1px 2px rgba(0,0,0,0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: i + 1,
            }}
          >
            {/* Only top disc shows label */}
            {isTop && (
              <span style={{
                fontSize: 12,
                fontWeight: 700,
                color: c.text,
                userSelect: "none",
              }}>
                {piece.type}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function Board({
  board,
  playerNumber,
  phase,
  placementTurn,
  currentTurn,
  ready,
  playersCount,
  draggingPiece,
  onPlacePiece,
  onMovePiece,
}) {
  const [selectedCell, setSelectedCell] = useState(null);
  const [validMoves,   setValidMoves]   = useState([]);
  const [dragOverCell, setDragOverCell] = useState(null);

  const isMyTurn    = Number(currentTurn)   === Number(playerNumber);
  const isMyPlace   = Number(placementTurn) === Number(playerNumber);
  const canInteract = playersCount === 2;
  const myRows      = PLACEMENT_ROWS[playerNumber];
  const flip        = Number(playerNumber) === 2;

  const displayRows = flip ? [...Array(GRID_SIZE).keys()].reverse() : [...Array(GRID_SIZE).keys()];
  const displayCols = flip ? [...Array(GRID_SIZE).keys()].reverse() : [...Array(GRID_SIZE).keys()];

  // ── Click ─────────────────────────────────────────────────────────────────
  const handleCellClick = (row, col) => {
    if (!canInteract || phase !== "playing" || !isMyTurn) return;
    const topPiece = top(board[row][col]);

    if (selectedCell) {
      const isTarget = validMoves.some(([r, c]) => r === row && c === col);
      if (isTarget) {
        onMovePiece(selectedCell.row, selectedCell.col, row, col);
        setSelectedCell(null);
        setValidMoves([]);
        return;
      }
      if (topPiece && Number(topPiece.player) === Number(playerNumber)) {
        setSelectedCell({ row, col });
        setValidMoves(getValidMoves(board, row, col));
        return;
      }
      setSelectedCell(null);
      setValidMoves([]);
      return;
    }
    if (topPiece && Number(topPiece.player) === Number(playerNumber)) {
      setSelectedCell({ row, col });
      setValidMoves(getValidMoves(board, row, col));
    }
  };

  // ── Drag and drop ─────────────────────────────────────────────────────────
  const handleDragOver = (e, row, col) => {
    e.preventDefault();
    if (phase !== "placement" || ready[playerNumber] || !isMyPlace) return;
    if (!myRows.includes(row)) { e.dataTransfer.dropEffect = "none"; return; }
    e.dataTransfer.dropEffect = "copy";
    setDragOverCell({ row, col });
  };

  const handleDrop = (e, row, col) => {
    e.preventDefault();
    setDragOverCell(null);
    if (phase !== "placement" || ready[playerNumber] || !isMyPlace) return;
    if (!myRows.includes(row)) return;
    const type = e.dataTransfer.getData("pieceType");
    if (type) onPlacePiece(row, col, type);
  };

  // ── Cell background ───────────────────────────────────────────────────────
  const getTileBg = (row, col) => {
    const isLight    = (row + col) % 2 === 0;
    const isSelected = selectedCell?.row === row && selectedCell?.col === col;
    const isValid    = validMoves.some(([r, c]) => r === row && c === col);
    const isDragOver = dragOverCell?.row === row && dragOverCell?.col === col;
    const isMyZone   = myRows.includes(row);

    if (isSelected)             return "#6EE7CA";
    if (isDragOver && isMyZone) return "#93C5FD";
    if (isValid)                return top(board[row][col]) ? "#FDBA74" : "#86EFAC";
    if (draggingPiece && phase === "placement" && isMyZone)
      return isLight ? "#DBEAFE" : "#BFDBFE";
    return isLight ? "#F0EDE4" : "#B0ADA4";
  };

  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))`,
      border: "2px solid #7A7167",
      borderRadius: 8,
      overflow: "visible",
      width: "100%",
      background: "#7A7167",
      gap: "1px",
    }}>
      {displayRows.map((rIdx) =>
        displayCols.map((cIdx) => {
          const stack  = board[rIdx][cIdx];
          const isValid  = validMoves.some(([r, c]) => r === rIdx && c === cIdx);
          const isMyZone = myRows.includes(rIdx);

          return (
            <div
              key={`${rIdx}-${cIdx}`}
              onClick={() => handleCellClick(rIdx, cIdx)}
              onDragOver={(e) => handleDragOver(e, rIdx, cIdx)}
              onDragLeave={() => setDragOverCell(null)}
              onDrop={(e) => handleDrop(e, rIdx, cIdx)}
              style={{
                aspectRatio: "1",
                background: getTileBg(rIdx, cIdx),
                position: "relative",
                cursor: canInteract
                  ? (phase === "placement" && isMyZone ? "copy" : "pointer")
                  : "default",
                outline: phase === "placement" && isMyZone && !ready[playerNumber]
                  ? "1.5px dashed rgba(59,130,246,0.45)" : "none",
                outlineOffset: "-3px",
                boxShadow: isValid ? "inset 0 0 0 2px rgba(34,197,94,0.7)" : "none",
                overflow: "visible",
                zIndex: stack.length,
              }}
            >
              <DiscStack stack={stack} />

              {/* Valid move dot for empty cells */}
              {isValid && stack.length === 0 && (
                <div style={{
                  position: "absolute",
                  top: "50%", left: "50%",
                  transform: "translate(-50%, -50%)",
                  width: 10, height: 10,
                  borderRadius: "50%",
                  background: "rgba(34,197,94,0.8)",
                  pointerEvents: "none",
                  zIndex: 5,
                }} />
              )}

              {/* Stack count */}
              {stack.length > 1 && (
                <div style={{
                  position: "absolute",
                  top: 2, right: 3,
                  fontSize: 9,
                  fontWeight: 700,
                  color: "#fff",
                  background: "rgba(0,0,0,0.5)",
                  borderRadius: 6,
                  padding: "0 3px",
                  lineHeight: "14px",
                  zIndex: 20,
                  pointerEvents: "none",
                }}>
                  ×{stack.length}
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}