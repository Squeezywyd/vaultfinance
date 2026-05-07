// Shared PIN pad components used by both SetupScreen and LockScreen

export function PinDots({ filled, total = 6, shake = false }) {
  return (
    <div className={`flex gap-4 justify-center my-8 ${shake ? 'animate-shake' : ''}`}>
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={`w-4 h-4 rounded-full border-2 transition-all duration-150 ${
            i < filled
              ? 'bg-indigo-500 border-indigo-500 scale-110'
              : 'border-white/30'
          }`}
        />
      ))}
    </div>
  );
}

export function NumberPad({ onPress, onDelete, extraKey }) {
  const digits = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  return (
    <div className="grid grid-cols-3 gap-3 px-6 w-full max-w-xs mx-auto">
      {digits.map(d => (
        <PadKey key={d} label={d} onPress={() => onPress(String(d))} />
      ))}

      {/* Bottom row: extra | 0 | delete */}
      <div className="h-16 flex items-center justify-center">
        {extraKey ?? <div />}
      </div>
      <PadKey label={0} onPress={() => onPress('0')} />
      <button
        onPointerDown={e => { e.preventDefault(); onDelete(); }}
        className="h-16 rounded-2xl text-white/60 text-2xl flex items-center justify-center active:bg-white/10 transition-colors select-none"
      >
        ⌫
      </button>
    </div>
  );
}

function PadKey({ label, onPress }) {
  return (
    <button
      onPointerDown={e => { e.preventDefault(); onPress(); }}
      className="h-16 rounded-2xl bg-white/5 border border-white/10 text-white text-2xl font-light flex items-center justify-center active:bg-indigo-500/20 active:scale-95 transition-all select-none"
    >
      {label}
    </button>
  );
}
