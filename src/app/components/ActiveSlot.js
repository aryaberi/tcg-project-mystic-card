// components/ActiveSlot.js
export default function ActiveSlot({ card, label, onHover }) {
  return (
    <div 
        // Event Hover
        onMouseEnter={() => card && onHover && onHover(card)}
        className="w-32 h-44 border-2 border-dashed border-yellow-500/50 rounded-lg flex items-center justify-center bg-black/20 relative transition hover:border-white/50 cursor-help"
    >
      <div className="absolute top-[-10px] bg-slate-900 px-2 text-xs text-yellow-500 font-bold">{label} Active</div>
      
      {card ? (
         <div className="w-full h-full p-2 bg-slate-800 rounded flex flex-col items-center animate-pulse-once">
            <div className="text-4xl my-2">{card.type === 'MAGIC' ? card.image : (card.element === 'Fire' ? '🔥' : card.element === 'Water' ? '💧' : '🌿')}</div>
            <div className="font-bold text-white text-center text-sm">{card.name}</div>
            
            <div className="mt-auto w-full">
              <div className="flex justify-between text-xs font-bold mb-1">
                <span className="text-green-400">HP {card.hp}/{card.maxHp}</span>
                <span className="text-red-400">ATK {card.att + (card.bonusAtt || 0)}</span>
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
                  style={{ width: `${Math.min(100, (card.hp / card.maxHp) * 100)}%` }}
                ></div>
              </div>
            </div>
         </div>
      ) : (
        <span className="text-gray-500 font-bold text-xs">Empty Slot</span>
      )}
    </div>
  );
}