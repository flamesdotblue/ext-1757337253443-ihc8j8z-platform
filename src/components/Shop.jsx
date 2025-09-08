import { abilityCatalog } from '../utils/chess';

export default function Shop({ selected, board, applyAbility, points, pregame, turn, canTeleport, onTeleportRequest }) {
  const piece = selected ? board[selected.y][selected.x] : null;
  const side = piece ? piece.color : turn;

  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-900/70 p-4">
      <h2 className="text-lg font-semibold">Upgrades & Abilities</h2>
      <p className="text-sm text-neutral-400">Spend points to augment pieces with new powers. Points are earned by captures and wins.</p>

      <div className="mt-3 p-3 rounded-lg bg-neutral-800/50 flex items-center justify-between">
        <div>
          <div className="text-sm">{pregame ? 'Configuring' : 'Turn'}: <span className="font-medium capitalize">{side}</span></div>
          <div className="text-xs text-neutral-300">Points available: <span className="font-semibold">{points[side]}</span></div>
        </div>
        {piece && (
          <div className="text-right">
            <div className="text-sm font-medium">Selected: {pieceLabel(piece)}</div>
            <div className="text-xs text-neutral-300">Abilities: {piece.abilities.length ? piece.abilities.map(a => catalogName(a)).join(', ') : 'None'}</div>
          </div>
        )}
      </div>

      {piece ? (
        <div className="mt-4 space-y-2">
          {Object.entries(abilityCatalog).map(([key, cfg]) => {
            const owned = piece.abilities.includes(key);
            const affordable = points[piece.color] >= cfg.cost;
            const canBuyNow = (pregame || piece.color === turn) && !owned && affordable;
            return (
              <div key={key} className="flex items-center justify-between rounded-md border border-neutral-800/80 bg-neutral-800/30 px-3 py-2">
                <div>
                  <div className="text-sm font-medium">{cfg.name}</div>
                  <div className="text-xs text-neutral-300">{cfg.desc}</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs">Cost: <span className="font-semibold">{cfg.cost}</span></span>
                  <button
                    className={`px-2 py-1 rounded text-xs font-medium ${canBuyNow ? 'bg-indigo-600 text-white' : 'bg-neutral-800 text-neutral-400 cursor-not-allowed'}`}
                    onClick={() => canBuyNow && applyAbility(key)}
                  >
                    {owned ? 'Owned' : 'Buy'}
                  </button>
                </div>
              </div>
            );
          })}

          {piece && piece.abilities.includes('teleport2') && (
            <button
              className={`w-full mt-2 px-3 py-2 rounded-md text-sm font-medium ${canTeleport ? 'bg-yellow-500 text-black' : 'bg-neutral-800 text-neutral-400 cursor-not-allowed'}`}
              onClick={() => canTeleport && onTeleportRequest()}
            >
              Use Teleport (once per charge)
            </button>
          )}
        </div>
      ) : (
        <div className="mt-4 text-sm text-neutral-400">Select a piece on the board to view and purchase abilities.</div>
      )}

      <div className="mt-6 text-xs text-neutral-400">
        Tips:
        <ul className="list-disc ml-5 mt-2 space-y-1">
          <li>Capture enemy pieces to earn points: pawn 1, knight/bishop 3, rook 5, queen 9.</li>
          <li>Win by capturing the enemy king to gain 20 bonus points.</li>
          <li>Pregame lets you upgrade both sides. During the game, only the side to move can upgrade their pieces.</li>
        </ul>
      </div>
    </div>
  );
}

function pieceLabel(p) {
  return `${capitalize(p.color)} ${capitalize(p.type)}`;
}
function capitalize(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
function catalogName(k) { return abilityCatalog[k]?.name || k; }
