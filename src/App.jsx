import { useMemo, useState } from 'react';
import Hero from './components/Hero';
import GameBoard from './components/GameBoard';
import Shop from './components/Shop';
import ScorePanel from './components/ScorePanel';
import { initialBoard, getLegalMoves, cloneBoard, pieceValue, abilityCatalog, inBounds } from './utils/chess';

export default function App() {
  const [board, setBoard] = useState(() => initialBoard());
  const [turn, setTurn] = useState('white');
  const [selected, setSelected] = useState(null); // {x,y}
  const [legalMoves, setLegalMoves] = useState([]); // [{x,y}]
  const [pregame, setPregame] = useState(true);
  const [points, setPoints] = useState({ white: 12, black: 12 });
  const [captured, setCaptured] = useState({ white: {}, black: {} });
  const [teleportMode, setTeleportMode] = useState(null); // {x,y} of piece using teleport
  const [winner, setWinner] = useState(null);

  const handleSelect = (x, y) => {
    if (winner) return;
    const piece = board[y][x];
    if (!piece) {
      setSelected(null);
      setLegalMoves([]);
      return;
    }
    if (!pregame && piece.color !== turn) return;
    const moves = getLegalMoves(board, x, y, piece);
    setSelected({ x, y });
    setLegalMoves(moves);
  };

  const endTurn = () => setTurn((t) => (t === 'white' ? 'black' : 'white'));

  const movePiece = (toX, toY) => {
    if (!selected || winner) return;
    const { x, y } = selected;
    const piece = board[y][x];

    if (teleportMode && teleportMode.x === x && teleportMode.y === y) {
      // Teleport action
      const dx = Math.abs(toX - x);
      const dy = Math.abs(toY - y);
      if (inBounds(toX, toY) && !board[toY][toX] && Math.max(dx, dy) <= 2 && piece.charges.teleport > 0) {
        const next = cloneBoard(board);
        next[y][x] = null;
        next[toY][toX] = { ...piece, charges: { ...piece.charges, teleport: piece.charges.teleport - 1 } };
        setBoard(next);
        setTeleportMode(null);
        setSelected(null);
        setLegalMoves([]);
        if (!pregame) endTurn();
      }
      return;
    }

    const isLegal = legalMoves.some((m) => m.x === toX && m.y === toY);
    if (!isLegal) return;

    const target = board[toY][toX];
    const next = cloneBoard(board);

    // Capture and points
    if (target) {
      const value = pieceValue(target.type);
      setPoints((p) => ({ ...p, [piece.color]: p[piece.color] + value }));
      setCaptured((c) => ({
        ...c,
        [piece.color]: {
          ...c[piece.color],
          [target.type]: (c[piece.color][target.type] || 0) + 1,
        },
      }));
    }

    // Move
    next[y][x] = null;
    next[toY][toX] = { ...piece, hasMoved: true };

    // Check for king capture to end game
    if (target && target.type === 'king') {
      setWinner(piece.color);
      setPoints((p) => ({ ...p, [piece.color]: p[piece.color] + 20 }));
    }

    setBoard(next);
    setSelected(null);
    setLegalMoves([]);

    if (!pregame && !winner) endTurn();
  };

  const resetGame = () => {
    setBoard(initialBoard());
    setTurn('white');
    setSelected(null);
    setLegalMoves([]);
    setPregame(true);
    setPoints({ white: 12, black: 12 });
    setCaptured({ white: {}, black: {} });
    setTeleportMode(null);
    setWinner(null);
  };

  const applyAbility = (abilityKey) => {
    if (!selected) return;
    const { x, y } = selected;
    const piece = board[y][x];
    const ability = abilityCatalog[abilityKey];
    if (!ability) return;

    // During pregame, allow both colors. During game, only current turn's color
    if (!pregame && piece.color !== turn) return;

    const cost = ability.cost;
    if (points[piece.color] < cost) return;

    if (piece.abilities.includes(abilityKey)) return;

    const next = cloneBoard(board);
    next[y][x] = { ...piece, abilities: [...piece.abilities, abilityKey] };
    setBoard(next);
    setPoints((p) => ({ ...p, [piece.color]: p[piece.color] - cost }));
  };

  const startGame = () => {
    setPregame(false);
    setTurn('white');
  };

  const onTeleportRequest = () => {
    if (!selected) return;
    const { x, y } = selected;
    const piece = board[y][x];
    if (!piece) return;
    if (!piece.abilities.includes('teleport2') || piece.charges.teleport <= 0) return;
    if (!pregame && piece.color !== turn) return;
    setTeleportMode({ x, y });
  };

  const canTeleport = useMemo(() => {
    if (!selected) return false;
    const piece = board[selected.y][selected.x];
    return !!piece && piece.abilities.includes('teleport2') && piece.charges.teleport > 0;
  }, [selected, board]);

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col">
      <Hero />

      <div className="container mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8">
          <ScorePanel
            turn={turn}
            pregame={pregame}
            points={points}
            captured={captured}
            winner={winner}
            onReset={resetGame}
            onStart={startGame}
          />

          <GameBoard
            board={board}
            turn={turn}
            pregame={pregame}
            selected={selected}
            legalMoves={legalMoves}
            teleportMode={teleportMode}
            onSelect={handleSelect}
            onMove={movePiece}
          />
        </div>

        <div className="lg:col-span-4">
          <Shop
            selected={selected}
            board={board}
            applyAbility={applyAbility}
            points={points}
            pregame={pregame}
            turn={turn}
            canTeleport={canTeleport}
            onTeleportRequest={onTeleportRequest}
          />
        </div>
      </div>

      {teleportMode && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-indigo-600 text-white px-4 py-2 rounded-full shadow-lg">
          Teleport mode: click an empty square within 2 tiles to relocate. Click again to cancel.
          <button
            className="ml-3 underline"
            onClick={() => setTeleportMode(null)}
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}
