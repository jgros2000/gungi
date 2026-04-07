const GRID_SIZE = 9;
const inBounds = (r, c) => r >= 0 && r < GRID_SIZE && c >= 0 && c < GRID_SIZE;

export function slide(board, row, col, player, directions) {
  const moves = [];
  for (const [dr, dc] of directions) {
    let r = row + dr, c = col + dc;
    while (inBounds(r, c)) {
      if (!board[r][c]) { moves.push([r, c]); }
      else { if (board[r][c].player !== player) moves.push([r, c]); break; }
      r += dr; c += dc;
    }
  }
  return moves;
}

export function step(board, row, col, player, directions) {
  return directions
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
        if (inBounds(r, c) && board[r][c]?.player !== player && board[r][c]) moves.push([r, c]);
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