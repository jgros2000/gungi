import { useState} from "react";
import { getValidMoves} from "../utils/moves.js";
import PiecePicker from './PiecePicker.jsx';

const GRID_SIZE = 9;

function Board({ board, playerNumber, phase, currentTurn, ready, playersCount, onPlacePiece, onRemovePiece, onMovePiece }) {
  const [selectedCell, setSelectedCell] = useState(null);   // { row, col }
  const [validMoves, setValidMoves] = useState([]);         // [[row, col], ...]
  const [pickerCell, setPickerCell] = useState(null);       // { row, col } — where picker was opened

  const isMyTurn = currentTurn === playerNumber;
  const canInteract = playersCount === 2;

  const handleCellClick = (row, col) => {
    if (!canInteract) return;

    // ── PLACEMENT PHASE ──
    if (phase === "placement" && !ready[playerNumber]) {
      const cell = board[row][col];

      // Right-click own piece to remove (we handle left click for both place/remove)
      if (cell && cell.player === playerNumber) {
        // Clicking own piece removes it
        onRemovePiece(row, col);
        return;
      }
      if (cell && cell.player !== playerNumber) return; // can't touch opponent's pieces

      // Open picker to choose which piece to place
      setPickerCell({ row, col });
      return;
    }

    // ── PLAYING PHASE ──
    if (phase === "playing" && isMyTurn) {
      const cell = board[row][col];

      // If a piece is already selected
      if (selectedCell) {
        const isValidTarget = validMoves.some(([r, c]) => r === row && c === col);

        if (isValidTarget) {
          // Execute the move
          onMovePiece(selectedCell.row, selectedCell.col, row, col);
          setSelectedCell(null);
          setValidMoves([]);
          return;
        }

        // Clicking own piece switches selection
        if (cell && cell.player === playerNumber) {
          setSelectedCell({ row, col });
          setValidMoves(getValidMoves(board, row, col));
          return;
        }

        // Clicking empty non-valid cell deselects
        setSelectedCell(null);
        setValidMoves([]);
        return;
      }

      // No piece selected yet — select own piece
      if (cell && cell.player === playerNumber) {
        setSelectedCell({ row, col });
        setValidMoves(getValidMoves(board, row, col));
      }
    }
  };

  const handlePickerSelect = (piece) => {
    if (!pickerCell) return;
    onPlacePiece(pickerCell.row, pickerCell.col, piece);
    setPickerCell(null);
  };

  const getCellStyle = (row, col) => {
    const isLight = (row + col) % 2 === 0;
    const isSelected = selectedCell?.row === row && selectedCell?.col === col;
    const isValidMove = validMoves.some(([r, c]) => r === row && c === col);
    const piece = board[row][col];
    const isValidCapture = isValidMove && piece && piece.player !== playerNumber;

    let bg = isLight ? "#F1EFE8" : "#B4B2A9";
    if (isSelected) bg = "#9FE1CB";
    else if (isValidCapture) bg = "#F5C4B3";
    else if (isValidMove) bg = "#C0DD97";

    return {
      width: "100%", aspectRatio: "1",
      background: bg,
      border: "0.5px solid rgba(0,0,0,0.1)",
      display: "flex", alignItems: "center", justifyContent: "center",
      cursor: canInteract ? "pointer" : "default",
      fontSize: "clamp(12px, 3vw, 22px)",
      fontWeight: 600,
      color: piece ? (piece.player === 1 ? "#185FA5" : "#A32D2D") : "transparent",
      position: "relative",
      transition: "background 0.1s",
      userSelect: "none",
    };
  };

  return (
    <div style={{ position: "relative" }}>
      <div style={{
        display: "grid",
        gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
        border: "2px solid #888",
        borderRadius: 8,
        overflow: "hidden",
        width: "100%",
      }}>
        {board.map((row, rIdx) =>
          row.map((cell, cIdx) => (
            <div
              key={`${rIdx}-${cIdx}`}
              style={getCellStyle(rIdx, cIdx)}
              onClick={() => handleCellClick(rIdx, cIdx)}
            >
              {cell ? cell.type : ""}
              {/* Dot indicator for valid empty moves */}
              {validMoves.some(([r, c]) => r === rIdx && c === cIdx) && !cell && (
                <div style={{
                  position: "absolute", width: "28%", height: "28%",
                  borderRadius: "50%", background: "rgba(99,153,34,0.5)",
                  pointerEvents: "none",
                }} />
              )}
            </div>
          ))
        )}
      </div>

      {pickerCell && (
        <PiecePicker
          onSelect={handlePickerSelect}
          onCancel={() => setPickerCell(null)}
        />
      )}
    </div>
  );
}

export default Board;