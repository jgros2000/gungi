// src/utils/moves.js
// Mirrors backend pieces.js — used only for highlighting valid moves client-side.
// The server always has the final word on legality.

const GRID_SIZE = 9;
export const PIECE_LIMITS = { K: 1, Q: 1, R: 2, B: 2, N: 2, P: 8 };
export const PIECE_NAMES  = { K: "King", Q: "Queen", R: "Rook", B: "Bishop", N: "Knight", P: "Pawn" };
export const PIECES = ["K", "Q", "R", "B", "N", "P"];

// Placement rows per player (rows the player is allowed to place on)
export const PLACEMENT_ROWS = { 1: [6, 7, 8], 2: [0, 1, 2] };

export const inBounds = (r, c) => r >= 0 && r < GRID_SIZE && c >= 0 && c < GRID_SIZE;

function slide(board, row, col, player, dirs) {
  const moves = [];
  for (const [dr, dc] of dirs) {
    let r = row + dr, c = col + dc;
    while (inBounds(r, c)) {
      if (!board[r][c]) { moves.push([r, c]); }
      else { if (board[r][c].player !== player) moves.push([r, c]); break; }
      r += dr; c += dc;
    }
  }
  return moves;
}

function step(board, row, col, player, dirs) {
  return dirs
    .map(([dr, dc]) => [row + dr, col + dc])
    .filter(([r, c]) => inBounds(r, c) && (!board[r][c] || board[r][c].player !== player));
}

export function getValidMoves(board, row, col) {
  const piece = board[row][col];
  if (!piece) return [];
  const { type, player } = piece;
  const dir = player === 1 ? -1 : 1;
  const startRow = player === 1 ? GRID_SIZE - 2 : 1;

  switch (type) {
    case "P": {
      const moves = [];
      if (inBounds(row + dir, col) && !board[row + dir][col]) {
        moves.push([row + dir, col]);
        if (row === startRow && !board[row + 2 * dir]?.[col]) moves.push([row + 2 * dir, col]);
      }
      for (const dc of [-1, 1]) {
        const r = row + dir, c = col + dc;
        if (inBounds(r, c) && board[r][c] && board[r][c].player !== player) moves.push([r, c]);
      }
      return moves;
    }
    case "N": return step(board, row, col, player, [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]]);
    case "B": return slide(board, row, col, player, [[-1,-1],[-1,1],[1,-1],[1,1]]);
    case "R": return slide(board, row, col, player, [[-1,0],[1,0],[0,-1],[0,1]]);
    case "Q": return slide(board, row, col, player, [[-1,0],[1,0],[0,-1],[0,1],[-1,-1],[-1,1],[1,-1],[1,1]]);
    case "K": return step(board, row, col, player, [[-1,0],[1,0],[0,-1],[0,1],[-1,-1],[-1,1],[1,-1],[1,1]]);
    default: return [];
  }
}

// Count how many of each piece type a player has on the board
export function countPieces(board, player) {
  const counts = { K: 0, Q: 0, R: 0, B: 0, N: 0, P: 0 };
  for (const row of board) {
    for (const cell of row) {
      if (cell && cell.player === player) counts[cell.type]++;
    }
  }
  return counts;
}
