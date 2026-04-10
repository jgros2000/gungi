// src/components/Board.jsx
import { useState } from "react";
import { getValidMoves, PLACEMENT_ROWS } from "../utils/moves";

const GRID_SIZE = 9;

export default function Board({
  board,
  playerNumber,
  phase,
  currentTurn,
  ready,
  playersCount,
  draggingPiece,       // piece type being dragged from tray (or null)
  onPlacePiece,
  onRemovePiece,
  onMovePiece,
}) {
  const [selectedCell, setSelectedCell] = useState(null);
  const [validMoves, setValidMoves]     = useState([]);
  const [dragOverCell, setDragOverCell] = useState(null); // { row, col } hovered during drag

  const isMyTurn      = currentTurn === playerNumber;
  const canInteract   = playersCount === 2;
  const myRows        = PLACEMENT_ROWS[playerNumber]; // rows this player can place on

  // Player 2 sees the board flipped — we render rows/cols in reverse order
  const flip = playerNumber === 2;
  const displayRows = flip ? [...Array(GRID_SIZE).keys()].reverse() : [...Array(GRID_SIZE).keys()];
  const displayCols = flip ? [...Array(GRID_SIZE).keys()].reverse() : [...Array(GRID_SIZE).keys()];

  // ── Click handler (used during playing phase) ──────────────────────────────
  const handleCellClick = (row, col) => {
    if (!canInteract || phase !== "playing" || !isMyTurn) return;

    const cell = board[row][col];

    if (selectedCell) {
      const isTarget = validMoves.some(([r, c]) => r === row && c === col);
      if (isTarget) {
        onMovePiece(selectedCell.row, selectedCell.col, row, col);
        setSelectedCell(null);
        setValidMoves([]);
        return;
      }
      if (cell && cell.player === playerNumber) {
        setSelectedCell({ row, col });
        setValidMoves(getValidMoves(board, row, col));
        return;
      }
      setSelectedCell(null);
      setValidMoves([]);
      return;
    }

    if (cell && cell.player === playerNumber) {
      setSelectedCell({ row, col });
      setValidMoves(getValidMoves(board, row, col));
    }
  };

  // ── Drag-and-drop handlers ─────────────────────────────────────────────────
  const handleDragOver = (e, row, col) => {
    if (phase !== "placement" || ready[playerNumber]) return;
    if (!myRows.includes(row)) return; // not in placement zone
    e.preventDefault(); // allow drop
    e.dataTransfer.dropEffect = "copy";
    setDragOverCell({ row, col });
  };

  const handleDragLeave = () => setDragOverCell(null);

  const handleDrop = (e, row, col) => {
    setDragOverCell(null);
    if (phase !== "placement" || ready[playerNumber]) return;
    if (!myRows.includes(row)) return;
    const type = e.dataTransfer.getData("pieceType");
    if (!type) return;
    onPlacePiece(row, col, type);
  };

  // ── Cell background color ──────────────────────────────────────────────────
  const getCellBg = (row, col) => {
    const isLight   = (row + col) % 2 === 0;
    const isSelected  = selectedCell?.row === row && selectedCell?.col === col;
    const isValidMove = validMoves.some(([r, c]) => r === row && c === col);
    const isCapture   = isValidMove && board[row][col] && board[row][col].player !== playerNumber;
    const isDragOver  = dragOverCell?.row === row && dragOverCell?.col === col;
    const isMyZone    = myRows.includes(row);
    const isDragging  = !!draggingPiece;

    if (isSelected)   return "#9FE1CB";
    if (isCapture)    return "#F5C4B3";
    if (isValidMove)  return "#C0DD97";
    if (isDragOver && isMyZone) return "#B5D4F4";  // blue highlight on valid drop target

    // During dragging, tint the placement zone subtly
    if (isDragging && phase === "placement" && isMyZone) {
      return isLight ? "#e8f4fd" : "#cce4f6";
    }

    return isLight ? "#F1EFE8" : "#B4B2A9";
  };

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))`,
        border: "2px solid #888",
        borderRadius: 8,
        overflow: "hidden",
        width: "100%",
      }}
    >
      {displayRows.map((rIdx) =>
        displayCols.map((cIdx) => {
          const cell = board[rIdx][cIdx];
          const isMyZone    = myRows.includes(rIdx);
          const isValidMove = validMoves.some(([r, c]) => r === rIdx && c === cIdx);

          return (
            <div
              key={`${rIdx}-${cIdx}`}
              onClick={() => handleCellClick(rIdx, cIdx)}
              onDragOver={(e) => handleDragOver(e, rIdx, cIdx)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, rIdx, cIdx)}
              title={
                phase === "placement" && !isMyZone
                  ? "You can only place in your first 3 rows"
                  : undefined
              }
              style={{
                aspectRatio: "1",
                background: getCellBg(rIdx, cIdx),
                border: "0.5px solid rgba(0,0,0,0.08)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: canInteract ? (phase === "placement" && isMyZone ? "copy" : "pointer") : "default",
                fontSize: "clamp(11px, 2.8vw, 20px)",
                fontWeight: 700,
                color: cell
                  ? (cell.player === 1 ? "#185FA5" : "#A32D2D")
                  : "transparent",
                position: "relative",
                userSelect: "none",
                transition: "background 0.1s",
                // Subtle zone border during placement
                outline: phase === "placement" && isMyZone && !ready[playerNumber]
                  ? "1.5px dashed rgba(24,95,165,0.25)"
                  : "none",
                outlineOffset: "-2px",
              }}
            >
              {cell ? cell.type : ""}

              {/* Green dot for valid empty move targets */}
              {isValidMove && !cell && (
                <div style={{
                  position: "absolute",
                  width: "28%", height: "28%",
                  borderRadius: "50%",
                  background: "rgba(99,153,34,0.5)",
                  pointerEvents: "none",
                }} />
              )}
            </div>
          );
        })
      )}
    </div>
  );
}
