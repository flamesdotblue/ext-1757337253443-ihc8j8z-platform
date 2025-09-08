import { pieceGlyph, sameSquare } from '../utils/chess';

export default function GameBoard({ board, turn, pregame, selected, legalMoves, teleportMode, onSelect, onMove }) {
  return (
    <div className="aspect-square w-full rounded-xl overflow-hidden ring-1 ring-neutral-800 bg-neutral-900">
      <div className="grid grid-cols-8 grid-rows-8 w-full h-full">
        {board.map((row, y) =>
          row.map((cell, x) => {
            const dark = (x + y) % 2 === 1;
            const isSelected = selected && selected.x === x && selected.y === y;
            const canMoveHere = legalMoves.some((m) => sameSquare(m, { x, y }));
            const isTeleportSource = teleportMode && teleportMode.x === x && teleportMode.y === y;
            const isTeleportTarget = teleportMode && !cell && Math.max(Math.abs(teleportMode.x - x), Math.abs(teleportMode.y - y)) <= 2;

            return (
              <button
                key={`${x}-${y}`}
                className={[
                  'relative flex items-center justify-center text-2xl md:text-3xl font-semibold',
                  dark ? 'bg-emerald-900/50' : 'bg-emerald-100/20',
                  isSelected ? 'outline outline-4 outline-indigo-500' : '',
                  canMoveHere ? 'after:content-[\'\'] after:absolute after:w-3 after:h-3 after:rounded-full after:bg-indigo-400/80 after:ring-2 after:ring-white/40 after:shadow-lg' : '',
                ].join(' ')}
                onClick={() => {
                  if (teleportMode) {
                    onMove(x, y);
                  } else if (selected && canMoveHere) {
                    onMove(x, y);
                  } else if (cell) {
                    onSelect(x, y);
                  } else {
                    onSelect(x, y);
                  }
                }}
                style={{ position: 'relative' }}
              >
                {cell && (
                  <div className="flex flex-col items-center">
                    <span className={cell.color === 'white' ? 'text-white drop-shadow' : 'text-black drop-shadow-sm'}>
                      {pieceGlyph(cell)}
                    </span>
                    {cell.abilities.length > 0 && (
                      <div className="mt-1 flex gap-1">
                        {cell.abilities.map((a) => (
                          <span key={a} className="text-[10px] leading-3 px-1 py-0.5 rounded bg-indigo-600/80 text-white">
                            {abbr(a)}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                {isTeleportSource && (
                  <div className="absolute inset-0 ring-4 ring-yellow-400 pointer-events-none" />
                )}
                {isTeleportTarget && (
                  <div className="absolute inset-0 ring-4 ring-yellow-300/60 pointer-events-none" />
                )}
              </button>
            );
          })
        )}
      </div>
      <div className="px-3 py-2 text-sm text-neutral-300 border-t border-neutral-800">
        {pregame ? (
          <div>Pregame setup: select any piece to view and buy abilities for either side.</div>
        ) : (
          <div>Turn: <span className="font-semibold capitalize">{turn}</span></div>
        )}
      </div>
    </div>
  );
}

function abbr(key) {
  switch (key) {
    case 'addKnight':
      return 'KN';
    case 'addDiag':
      return 'DG';
    case 'addOrtho':
      return 'OR';
    case 'jumpSlide':
      return 'JP';
    case 'teleport2':
      return 'TP';
    case 'pawnBoost':
      return 'PB';
    default:
      return 'AB';
  }
}
