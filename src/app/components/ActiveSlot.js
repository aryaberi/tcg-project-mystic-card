// components/ActiveSlot.js
import { motion } from "framer-motion";
export default function ActiveSlot({ card, label, onHover }) {
  // Cek status
  const isFrozen = card?.isFrozen;

  return (
    <motion.div
      layoutId={card?.id}
      layout
      transition={{ type: "spring", stiffness: 350, damping: 25 }}
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
        <div
          className={`w-full h-full p-2 bg-slate-800 rounded flex flex-col items-center animate-pulse-once ${
            isFrozen ? "opacity-70 grayscale" : ""
          }`}
        >
          {/* ICON ABILITY (Pojok Kiri Atas) */}
          {card.ability && (
            <div
              className="absolute top-1 left-1 text-[10px] bg-gray-700 px-1 rounded text-white border border-gray-500 z-10"
              title={card.ability.name}
            >
              {card.ability.type === "RECOIL" && "💥"}
              {card.ability.type === "FROZEN" && "❄️"}
              {card.ability.type === "GROWTH" && "📈"}
            </div>
          )}

          {/* STATUS FROZEN (Overlay Besar) */}
          {isFrozen && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-blue-500/20 rounded font-black text-blue-200 tracking-widest text-sm rotate-[-15deg] border-2 border-blue-400">
              RECHARGE
            </div>
          )}

          <div className="text-4xl my-2">{card.image}</div>
          <div className="font-bold text-white text-center text-sm">
            {card.name}
          </div>

          <div className="mt-auto w-full">
            {/* ... (HP Bar & Stats sama seperti sebelumnya) ... */}
            <div className="flex justify-between text-xs font-bold mb-1">
              <span className="text-green-400">
                HP {card.hp}/{card.maxHp}
              </span>
              <span className="text-red-400">
                ATK {card.att + (card.bonusAtt || 0)}
              </span>
            </div>
            {/* Indikator Buff di Active Slot */}
            {(card.defense > 0 || card.bonusAtt > 0) && (
              <div className="text-[10px] text-center bg-gray-700 rounded mb-1 text-yellow-300">
                {card.bonusAtt > 0 && `⚔️+${card.bonusAtt} `}
                {card.defense > 0 && `🛡️+${card.defense}`}
              </div>
            )}

            <div className="w-full h-2 bg-gray-700 rounded-full">
              <div
                className="h-full bg-green-500 rounded-full transition-all duration-300"
                style={{
                  width: `${Math.min(100, (card.hp / card.maxHp) * 100)}%`,
                }}
              ></div>
            </div>
          </div>
        </div>
      ) : (
        <span className="text-gray-500 font-bold text-xs">Empty Slot</span>
      )}
    </motion.div>
  );
}
