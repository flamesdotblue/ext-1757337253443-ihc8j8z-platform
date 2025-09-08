// Core chess and ability utilities

export const abilityCatalog = {
  addKnight: {
    name: 'Knight Moves',
    desc: 'Adds full knight (L-shape) movement to this piece.',
    cost: 6,
  },
  addDiag: {
    name: 'Diagonal Slide',
    desc: 'Adds bishop-like diagonal sliding.',
    cost: 7,
  },
  addOrtho: {
    name: 'Orthogonal Slide',
    desc: 'Adds rook-like file/rank sliding.',
    cost: 7,
  },
  jumpSlide: {
    name: 'Jumping Slides',
    desc: 'Sliding moves ignore blockers (rooks/bishops/queens).',
    cost: 10,
  },
  teleport2: {
    name: 'Teleport (2)',
    desc: 'Once per charge, relocate up to 2 tiles to an empty square.',
    cost: 9,
  },
  pawnBoost: {
    name: 'Pawn Boost',
    desc: 'Pawn may move back 1 and capture back-diagonally.',
    cost: 3,
  },
};

export const initialBoard = () => {
  const empty = Array.from({ length: 8 }, () => Array(8).fill(null));

  const mk = (type, color) => ({
    id: `${type}-${color}-${Math.random().toString(36).slice(2, 8)}`,
    type,
    color,
    hasMoved: false,
    abilities: [],
    charges: { teleport: 1 },
  });

  // Pawns
  for (let x = 0; x < 8; x++) {
    empty[1][x] = mk('pawn', 'black');
    empty[6][x] = mk('pawn', 'white');
  }
  // Rooks
  empty[0][0] = mk('rook', 'black');
  empty[0][7] = mk('rook', 'black');
  empty[7][0] = mk('rook', 'white');
  empty[7][7] = mk('rook', 'white');
  // Knights
  empty[0][1] = mk('knight', 'black');
  empty[0][6] = mk('knight', 'black');
  empty[7][1] = mk('knight', 'white');
  empty[7][6] = mk('knight', 'white');
  // Bishops
  empty[0][2] = mk('bishop', 'black');
  empty[0][5] = mk('bishop', 'black');
  empty[7][2] = mk('bishop', 'white');
  empty[7][5] = mk('bishop', 'white');
  // Queens
  empty[0][3] = mk('queen', 'black');
  empty[7][3] = mk('queen', 'white');
  // Kings
  empty[0][4] = mk('king', 'black');
  empty[7][4] = mk('king', 'white');

  return empty;
};

export const cloneBoard = (b) => b.map((row) => row.map((c) => (c ? { ...c, abilities: [...c.abilities], charges: { ...c.charges } } : null)));

export const inBounds = (x, y) => x >= 0 && x < 8 && y >= 0 && y < 8;
export const sameSquare = (a, b) => a && b && a.x === b.x && a.y === b.y;

export const pieceValue = (type) => {
  switch (type) {
    case 'pawn':
      return 1;
    case 'knight':
    case 'bishop':
      return 3;
    case 'rook':
      return 5;
    case 'queen':
      return 9;
    default:
      return 0;
  }
};

export const pieceGlyph = (p) => {
  const map = {
    white: { pawn: '♙', rook: '♖', knight: '♘', bishop: '♗', queen: '♕', king: '♔' },
    black: { pawn: '♟', rook: '♜', knight: '♞', bishop: '♝', queen: '♛', king: '♚' },
  };
  return map[p.color][p.type];
};

// Movement helpers
const dirsOrtho = [
  { dx: 1, dy: 0 },
  { dx: -1, dy: 0 },
  { dx: 0, dy: 1 },
  { dx: 0, dy: -1 },
];
const dirsDiag = [
  { dx: 1, dy: 1 },
  { dx: 1, dy: -1 },
  { dx: -1, dy: 1 },
  { dx: -1, dy: -1 },
];
const knightJumps = [
  { dx: 1, dy: 2 },
  { dx: 2, dy: 1 },
  { dx: -1, dy: 2 },
  { dx: -2, dy: 1 },
  { dx: 1, dy: -2 },
  { dx: 2, dy: -1 },
  { dx: -1, dy: -2 },
  { dx: -2, dy: -1 },
];

function slideMoves(board, x, y, color, dirs, canJump) {
  const moves = [];
  for (const d of dirs) {
    let nx = x + d.dx;
    let ny = y + d.dy;
    while (inBounds(nx, ny)) {
      const target = board[ny][nx];
      if (!target) {
        moves.push({ x: nx, y: ny });
        nx += d.dx;
        ny += d.dy;
        continue;
      }
      if (target.color !== color) {
        moves.push({ x: nx, y: ny });
      }
      if (canJump) {
        // If can jump, continue past blockers
        nx += d.dx;
        ny += d.dy;
        continue;
      }
      break;
    }
  }
  return moves;
}

export function getLegalMoves(board, x, y, piece) {
  if (!piece) return [];
  const { type, color, abilities } = piece;
  const jumpSlides = abilities.includes('jumpSlide');
  let moves = [];

  if (type === 'pawn') {
    const dir = color === 'white' ? -1 : 1;
    const startRank = color === 'white' ? 6 : 1;
    // forward
    const oneY = y + dir;
    if (inBounds(x, oneY) && !board[oneY][x]) moves.push({ x, y: oneY });
    const twoY = y + 2 * dir;
    if (y === startRank && !board[oneY][x] && inBounds(x, twoY) && !board[twoY][x]) moves.push({ x, y: twoY });
    // captures
    for (const dx of [-1, 1]) {
      const cx = x + dx;
      const cy = y + dir;
      if (inBounds(cx, cy) && board[cy][cx] && board[cy][cx].color !== color) moves.push({ x: cx, y: cy });
    }
    // pawn boost ability
    if (abilities.includes('pawnBoost')) {
      const by = y - dir; // move back 1
      if (inBounds(x, by) && !board[by][x]) moves.push({ x, y: by });
      for (const dx of [-1, 1]) {
        const cx = x + dx;
        const cy = y - dir;
        if (inBounds(cx, cy) && board[cy][cx] && board[cy][cx].color !== color) moves.push({ x: cx, y: cy });
      }
    }
  }

  if (type === 'rook' || type === 'queen' || abilities.includes('addOrtho')) {
    moves = moves.concat(slideMoves(board, x, y, color, dirsOrtho, jumpSlides));
  }
  if (type === 'bishop' || type === 'queen' || abilities.includes('addDiag')) {
    moves = moves.concat(slideMoves(board, x, y, color, dirsDiag, jumpSlides));
  }
  if (type === 'knight' || abilities.includes('addKnight')) {
    for (const k of knightJumps) {
      const nx = x + k.dx;
      const ny = y + k.dy;
      if (!inBounds(nx, ny)) continue;
      const t = board[ny][nx];
      if (!t || t.color !== color) moves.push({ x: nx, y: ny });
    }
  }
  if (type === 'king') {
    for (const d of [...dirsOrtho, ...dirsDiag]) {
      const nx = x + d.dx;
      const ny = y + d.dy;
      if (!inBounds(nx, ny)) continue;
      const t = board[ny][nx];
      if (!t || t.color !== color) moves.push({ x: nx, y: ny });
    }
  }

  // Remove origin square if accidentally included
  return moves.filter((m) => !(m.x === x && m.y === y));
}
