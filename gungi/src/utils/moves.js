// src/utils/moves.js — mirrors backend pieces.js for client-side highlighting

const GRID_SIZE = 9;
export const MAX_HEIGHT   = 3;
export const PIECE_LIMITS = { K: 1, Q: 1, R: 2, B: 2, N: 2, P: 8 };
export const PIECE_NAMES  = { K: "King", Q: "Queen", R: "Rook", B: "Bishop", N: "Knight", P: "Pawn" };
export const PIECES       = ["K", "Q", "R", "B", "N", "P"];
export const PLACEMENT_ROWS = { 1: [6, 7, 8], 2: [0, 1, 2] };

export const inBounds = (r, c) => r >= 0 && r < GRID_SIZE && c >= 0 && c < GRID_SIZE;

export function top(stack) {
  if (!stack || stack.length === 0) return null;
  return stack[stack.length - 1];
}

function canLand(board, fromRow, fromCol, r, c) {
  const attacker = board[fromRow][fromCol];
  const target   = board[r][c];
  const attackerPlayer = top(attacker)?.player;

  if (!target || target.length === 0) return true;

  const targetPlayer = top(target).player;
  if (targetPlayer === attackerPlayer) {
    return attacker.length + target.length <= MAX_HEIGHT;
  } else {
    return attacker.length >= target.length;
  }
}

function slide(board, row, col, dirs) {
  const moves = [];
  for (const [dr, dc] of dirs) {
    let r = row + dr, c = col + dc;
    while (inBounds(r, c)) {
      const t = top(board[r][c]);
      if (!t) {
        moves.push([r, c]);
      } else {
        if (canLand(board, row, col, r, c)) moves.push([r, c]);
        break;
      }
      r += dr; c += dc;
    }
  }
  return moves;
}

function stepFiltered(board, row, col, dirs) {
  return dirs
    .map(([dr, dc]) => [row + dr, col + dc])
    .filter(([r, c]) => inBounds(r, c) && canLand(board, row, col, r, c));
}

function getPawnMoves(board, row, col, player) {
  const moves    = [];
  const dir      = player === 1 ? -1 : 1;
  const startRow = player === 1 ? GRID_SIZE - 2 : 1;
  const attacker = board[row][col];

  if (inBounds(row + dir, col)) {
    const target = board[row + dir][col];
    const t      = top(target);
    if (!t) {
      moves.push([row + dir, col]);
      if (row === startRow && !top(board[row + 2 * dir]?.[col]))
        moves.push([row + 2 * dir, col]);
    } else if (t.player === player && attacker.length + target.length <= MAX_HEIGHT) {
      moves.push([row + dir, col]);
    }
  }
  for (const dc of [-1, 1]) {
    const r = row + dir, c = col + dc;
    if (inBounds(r, c)) {
      const target = board[r][c];
      const t      = top(target);
      if (t && t.player !== player && attacker.length >= target.length)
        moves.push([r, c]);
    }
  }
  return moves;
}

export function getValidMoves(board, row, col) {
  const piece = top(board[row][col]);
  if (!piece) return [];
  const { type, player } = piece;

  switch (type) {
    case "P": return getPawnMoves(board, row, col, player);
    case "N": return stepFiltered(board, row, col, [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]]);
    case "B": return slide(board, row, col, [[-1,-1],[-1,1],[1,-1],[1,1]]);
    case "R": return slide(board, row, col, [[-1,0],[1,0],[0,-1],[0,1]]);
    case "Q": return slide(board, row, col, [[-1,0],[1,0],[0,-1],[0,1],[-1,-1],[-1,1],[1,-1],[1,1]]);
    case "K": return stepFiltered(board, row, col, [[-1,0],[1,0],[0,-1],[0,1],[-1,-1],[-1,1],[1,-1],[1,1]]);
    default:  return [];
  }
}

export function countPieces(board, player) {
  const counts = { K: 0, Q: 0, R: 0, B: 0, N: 0, P: 0 };
  for (const row of board)
    for (const stack of row)
      for (const piece of stack)
        if (piece.player === player) counts[piece.type]++;
  return counts;
}