// components/GraveyardModal.js
import Card from "./Card";

export default function GraveyardModal({ isOpen, onClose, cards, title, onHover }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80  animate-in fade-in duration-200">
      
      {/* Container Modal */}
      <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl w-[800px] h-[600px] flex flex-col relative overflow-hidden">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-700 bg-slate-950 flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-200 flex items-center gap-2">
                🪦 {title} <span className="text-sm bg-slate-800 px-2 py-1 rounded text-gray-500">({cards.length} Cards)</span>
            </h2>
            <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl font-bold">&times;</button>
        </div>

        {/* Grid Kartu */}
        <div className="flex-1 overflow-y-auto p-6 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]">
            {cards.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-600">
                    <span className="text-6xl mb-4">⚰️</span>
                    <p>No cards in Graveyard yet.</p>
                </div>
            ) : (
                <div className="grid grid-cols-5 gap-4">
                    {cards.map((card, idx) => (
                        <div key={`${card.id}-${idx}`} className="scale-90 hover:scale-100 transition">
                             {/* Kita pakai Component Card yang sudah ada */}
                             <Card 
                                data={card} 
                                onHover={onHover} // Biar preview sidebar berubah
                                onClick={() => {}} // Gak ngapa-ngapain kalau diklik di grave
                             />
                        </div>
                    ))}
                </div>
            )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-950 border-t border-slate-700 text-center text-xs text-gray-500">
            Cards in Graveyard are removed from play.
        </div>
      </div>
    </div>
  );
}