// src/components/Board.jsx
import { useState } from "react";
import { getValidMoves, top, PLACEMENT_ROWS } from "../utils/moves";
import "./Board.css";

const GRID_SIZE    = 9;
const STACK_OFFSET = 6; // px each disc shifts upward

function DiscStack({ stack }) {
  if (stack.length === 0) return null;

  const totalOffset = (stack.length - 1) * STACK_OFFSET;

  return (
    <div
      className="disc-stack"
      style={{ height: 34 + totalOffset }}
    >
      {stack.map((piece, i) => {
        const isTop = i === stack.length - 1;

        return (
          <div
            key={i}
            className={`disc player-${piece.player} ${isTop ? "top" : ""}`}
            style={{ bottom: i * STACK_OFFSET, zIndex: i + 1 }}
          >
            {isTop && (
              <span className="disc-label">{piece.type}</span>
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

  // ── Cell class list ───────────────────────────────────────────────────────
  const getCellClass = (row, col) => {
    const isLight    = (row + col) % 2 === 0;
    const isSelected = selectedCell?.row === row && selectedCell?.col === col;
    const isValid    = validMoves.some(([r, c]) => r === row && c === col);
    const isCapture  = isValid && top(board[row][col]) !== null;
    const isDragOver = dragOverCell?.row === row && dragOverCell?.col === col;
    const isMyZone   = myRows.includes(row);
    const isDragging = !!draggingPiece && phase === "placement" && isMyZone;

    const classes = ["cell"];

    // Background — priority order matters
    if (isSelected)              classes.push("selected");
    else if (isDragOver && isMyZone) classes.push("drag-over");
    else if (isCapture)          classes.push("capture");
    else if (isValid)            classes.push("valid");
    else if (isDragging)         classes.push("my-zone-drag", isLight ? "light" : "dark");
    else                         classes.push(isLight ? "light" : "dark");

    // Zone outline during placement
    if (phase === "placement" && isMyZone && !ready[playerNumber]) classes.push("my-zone");

    // Cursor
    if (!canInteract)                              classes.push("no-interact");
    else if (phase === "placement" && isMyZone)    classes.push("place");

    return classes.join(" ");
  };

  return (
    <div className="board">
      {displayRows.map((rIdx) =>
        displayCols.map((cIdx) => {
          const stack  = board[rIdx][cIdx];
          const isValid = validMoves.some(([r, c]) => r === rIdx && c === cIdx);

          return (
            <div
              key={`${rIdx}-${cIdx}`}
              className={getCellClass(rIdx, cIdx)}
              style={{ zIndex: stack.length }}
              onClick={() => handleCellClick(rIdx, cIdx)}
              onDragOver={(e) => handleDragOver(e, rIdx, cIdx)}
              onDragLeave={() => setDragOverCell(null)}
              onDrop={(e) => handleDrop(e, rIdx, cIdx)}
            >
              <DiscStack stack={stack} />

              {isValid && stack.length === 0 && (
                <div className="valid-dot" />
              )}

              {stack.length > 1 && (
                <div className="stack-badge">×{stack.length}</div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}