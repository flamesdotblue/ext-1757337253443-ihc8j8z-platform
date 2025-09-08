export default function ScorePanel({ turn, pregame, points, captured, winner, onReset, onStart }) {
  return (
    <div className="mb-4 flex flex-col md:flex-row items-stretch gap-3">
      <div className="flex-1 rounded-xl border border-neutral-800 bg-neutral-900/70 p-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-neutral-400">{pregame ? 'Setup Phase' : winner ? 'Game Over' : 'Now Playing'}</div>
            <div className="text-xl font-semibold">{winner ? `${capitalize(winner)} wins!` : pregame ? 'Configure your armies' : `${capitalize(turn)} to move`}</div>
          </div>
          <div className="flex items-center gap-2">
            {pregame ? (
              <button className="px-3 py-2 rounded-md bg-emerald-600 text-white text-sm font-medium" onClick={onStart}>Start Game</button>
            ) : (
              <button className="px-3 py-2 rounded-md bg-neutral-800 text-neutral-200 text-sm font-medium" onClick={onReset}>Reset</button>
            )}
          </div>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-md bg-neutral-800/50 p-3">
            <div className="text-neutral-400">White points</div>
            <div className="text-lg font-semibold">{points.white}</div>
          </div>
          <div className="rounded-md bg-neutral-800/50 p-3">
            <div className="text-neutral-400">Black points</div>
            <div className="text-lg font-semibold">{points.black}</div>
          </div>
        </div>
      </div>
      <div className="w-full md:w-80 rounded-xl border border-neutral-800 bg-neutral-900/70 p-4">
        <h3 className="font-semibold">Captured Pieces</h3>
        <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
          <div>
            <div className="text-neutral-400">White captured</div>
            <CaptureList map={captured.white} />
          </div>
          <div>
            <div className="text-neutral-400">Black captured</div>
            <CaptureList map={captured.black} />
          </div>
        </div>
      </div>
    </div>
  );
}

function CaptureList({ map }) {
  const entries = Object.entries(map || {});
  if (!entries.length) return <div className="text-neutral-500">None</div>;
  return (
    <ul className="space-y-1">
      {entries.map(([k, v]) => (
        <li key={k} className="flex items-center justify-between">
          <span className="capitalize">{k}</span>
          <span className="text-neutral-300">x{v}</span>
        </li>
      ))}
    </ul>
  );
}

function capitalize(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
