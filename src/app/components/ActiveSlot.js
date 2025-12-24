// components/ActiveSlot.js
import Card from "./Card";

export default function ActiveSlot({ card, label, onHover }) {
  // Cek status
  const isFrozen = card?.isFrozen;

  return (
    <div
      onMouseEnter={() => card && onHover && onHover(card)}
      className={`
            w-32 h-44 border-2 border-dashed rounded-lg flex items-center justify-center bg-black/20 relative transition hover:border-white/50 cursor-help
            ${
              isFrozen
                ? "border-blue-400 bg-blue-900/20"
                : "border-yellow-500/50"
            }
        `}
    >
      <div className="absolute top-[-10px] bg-slate-900 px-2 text-xs text-yellow-500 font-bold">
        {label} Active
      </div>

      {card ? (
       <Card data={card} isInActive={true}/>
      ) : (
        <span className="text-gray-500 font-bold text-xs">Empty Slot</span>
      )}
    </div>
  );
}
