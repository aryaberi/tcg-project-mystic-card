// --- Komponen Visual Deck (Internal) ---
import { motion } from "framer-motion";

export default function DeckSlot({ count, label, isCom, card = [] }) {
  return (
    <motion.div
      key={card?.id}
      layoutId={card?.id}
      layout
      transition={{ type: "spring", stiffness: 350, damping: 25 }}
      className={`w-24 h-32 bg-slate-800/80 border-2 border-slate-600 rounded-lg flex flex-col items-center justify-center relative shadow-xl ${
        isCom ? "transform rotate-180" : ""
      }`}
    >
      <div className="absolute top-[-4px] left-[2px] w-full h-full bg-slate-700/60 border border-slate-600 rounded-lg -z-10"></div>
      <div className="absolute top-[-8px] left-[4px] w-full h-full bg-slate-700/40 border border-slate-600 rounded-lg -z-20"></div>
      <span
        className={`text-gray-400 text-xs font-bold mb-1 ${
          isCom ? "transform rotate-180" : ""
        }`}
      >
        {label} DECK
      </span>
      <span
        className={`text-3xl font-bold text-white ${
          isCom ? "transform rotate-180" : ""
        }`}
      >
        {count}
      </span>
      <div className="w-10 h-1 bg-gray-500 mt-2 rounded-full"></div>
    </motion.div>
  );
}
