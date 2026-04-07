// pieces.js — movement rules for each chess piece
// Each function returns an array of valid [row, col] positions
// board is a 9x9 array where each cell is null or { type, player }

const GRID_SIZE = 9;
const inBounds = (r, c) => r >= 0 && r < GRID_SIZE && c >= 0 && c < GRID_SIZE;

// Slide in a direction until hitting a piece or the edge
function slide(board, row, col, player, directions) {
  const moves = [];
  for (const [dr, dc] of directions) {
    let r = row + dr;
    let c = col + dc;
    while (inBounds(r, c)) {
      if (board[r][c] === null) {
        moves.push([r, c]);
      } else {
        if (board[r][c].player !== player) moves.push([r, c]); // capture
        break;
      }
      r += dr;
      c += dc;
    }
  }
  return moves;
}

// Step once in each direction
function step(board, row, col, player, directions) {
  const moves = [];
  for (const [dr, dc] of directions) {
    const r = row + dr;
    const c = col + dc;
    if (inBounds(r, c) && (!board[r][c] || board[r][c].player !== player)) {
      moves.push([r, c]);
    }
  }
  return moves;
}

function getPawnMoves(board, row, col, player) {
  const moves = [];
  const dir = player === 1 ? -1 : 1; // player 1 moves up, player 2 moves down
  const startRow = player === 1 ? GRID_SIZE - 2 : 1;

  // Forward
  if (inBounds(row + dir, col) && !board[row + dir][col]) {
    moves.push([row + dir, col]);
    // Double move from start
    if (row === startRow && !board[row + 2 * dir][col]) {
      moves.push([row + 2 * dir, col]);
    }
  }
  // Diagonal captures
  for (const dc of [-1, 1]) {
    const r = row + dir;
    const c = col + dc;
    if (inBounds(r, c) && board[r][c] && board[r][c].player !== player) {
      moves.push([r, c]);
    }
  }
  return moves;
}

function getKnightMoves(board, row, col, player) {
  return step(board, row, col, player, [
    [-2, -1], [-2, 1], [-1, -2], [-1, 2],
    [1, -2],  [1, 2],  [2, -1],  [2, 1],
  ]);
}

function getBishopMoves(board, row, col, player) {
  return slide(board, row, col, player, [
    [-1, -1], [-1, 1], [1, -1], [1, 1],
  ]);
}

function getRookMoves(board, row, col, player) {
  return slide(board, row, col, player, [
    [-1, 0], [1, 0], [0, -1], [0, 1],
  ]);
}

function getQueenMoves(board, row, col, player) {
  return slide(board, row, col, player, [
    [-1, 0], [1, 0], [0, -1], [0, 1],
    [-1, -1], [-1, 1], [1, -1], [1, 1],
  ]);
}

function getKingMoves(board, row, col, player) {
  return step(board, row, col, player, [
    [-1, 0], [1, 0], [0, -1], [0, 1],
    [-1, -1], [-1, 1], [1, -1], [1, 1],
  ]);
}

function getValidMoves(board, row, col) {
  const piece = board[row][col];
  if (!piece) return [];
  const { type, player } = piece;
  switch (type) {
    case "P": return getPawnMoves(board, row, col, player);
    case "N": return getKnightMoves(board, row, col, player);
    case "B": return getBishopMoves(board, row, col, player);
    case "R": return getRookMoves(board, row, col, player);
    case "Q": return getQueenMoves(board, row, col, player);
    case "K": return getKingMoves(board, row, col, player);
    default: return [];
  }
}

module.exports = { getValidMoves };
