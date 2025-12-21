// utils/gameData.js

export const ELEMENTS = ["Fire", "Water", "Grass"];

export const IMAGES = {
  Fire: "🔥",
  Water: "💧",
  Grass: "🌿",
};

const FUSION_MONSTERS = [
  { 
    name: "Volcanic Dragon", 
    element: "Fire", 
    cost: ["Fire", "Fire"], // Butuh 2 Fire
    att: 60, hp: 150, 
    desc: "Requires 2 Fire Monsters",
    image: "🐉" ,
    ability: { type: "RECOIL", val: 20, name: "Overheat" },
    desc: "Attack deals 20 DMG to self.",
  },
  { 
    name: "Swamp King", 
    element: "Grass", 
    cost: ["Grass", "Water"], // Butuh 1 Grass + 1 Water
    att: 50, hp: 180, 
    desc: "Requires Grass + Water",
    image: "🐸",
    ability: { type: "FROZEN", val: 0, name: "Recharge" },
    desc: "Cannot attack next turn after attacking.", 
  },
  { 
    name: "Steam Golem", 
    element: "Water", 
    cost: ["Water", "Fire"], // Butuh 1 Water + 1 Fire
    att: 55, hp: 160, 
    desc: "Requires Water + Fire",
    ability: { type: "GROWTH", val: 10, name: "Photosynthesis" },
    desc: "Gains +10 ATK every turn start in active spot.",
    image: "🤖" 
  }
];

const MAGIC_CARDS = [
  { name: "Potions", effect: "HEAL", val: 50, desc: "Heal 50 HP", image: "🧪" },
  { name: "Sword Buff", effect: "BUFF_ATK", val: 20, desc: "+20 Attack", image: "⚔️" },
  { name: "Elixir", effect: "HEAL", val: 100, desc: "Heal 100 HP", image: "🍷" },
  { name: "Iron Skin", effect: "DEFENSE", val: 20, desc: "-20 Dmg Received (1 Turn)", image: "🛡️" },
];

// --- KARTU INSTANT BARU ---
const INSTANT_CARDS = [
  { 
    name: "Chaos Shuffle", 
    effect: "GLOBAL_SHUFFLE", 
    val: 5, 
    desc: "Both players discard hand & draw 5 cards.", 
    image: "🌀" 
  },
  { 
    name: "Whirlwind", 
    effect: "GLOBAL_BOUNCE", 
    val: 0, 
    desc: "Return ALL Bench monsters to Hand.", 
    image: "🌪️" 
  },
];

export const generateDeck = (count = 20) => {
  // 1. Buat 15 Monster
  const monsters = Array.from({ length: 12 }).map((_, i) => {
    const el = ELEMENTS[Math.floor(Math.random() * ELEMENTS.length)];
    return {
      id: crypto.randomUUID(),
      type: "MONSTER",
      name: `${el} Mon ${i + 1}`,
      element: el,
      att: Math.floor(Math.random() * 20) + 10,
      hp: Math.floor(Math.random() * 50) + 50,
      maxHp: 0, 
      image: IMAGES[el],
      bonusAtt: 0,
      defense: 0,
      isReady: true,
    };
  }).map(c => ({ ...c, maxHp: c.hp }));

  // 2. Buat 5 Magic Cards
  const magics = Array.from({ length: 3 }).map((_, i) => {
    const m = MAGIC_CARDS[Math.floor(Math.random() * MAGIC_CARDS.length)];
    return {
      id: crypto.randomUUID(),
      type: "MAGIC",
      name: m.name,
      effect: m.effect,
      val: m.val,
      desc: m.desc,
      image: m.image, // Kita pakai emoji untuk icon magic
      element: "Magic"
    };
  });

  const bosses = Array.from({ length: 3 }).map((_, i) => {
    const b = FUSION_MONSTERS[Math.floor(Math.random() * FUSION_MONSTERS.length)];
    return {
      id: crypto.randomUUID(),
      type: "FUSION",
      name: b.name,
      element: b.element,
      cost: b.cost, // Array syarat elemen
      att: b.att,
      hp: b.hp,
      maxHp: b.hp,
      image: b.image,
      desc: b.desc,
      bonusAtt: 0, defense: 0,
      ability: b.ability, // Pastikan ini kebawa
      isFrozen: false,
    };
  });

  // 4. INSTANT (2 Kartu) - BARU
  const instants = Array.from({ length: 2 }).map((_, i) => {
    const m = INSTANT_CARDS[Math.floor(Math.random() * INSTANT_CARDS.length)];
    return {
      id: crypto.randomUUID(),
      type: "INSTANT", // Tipe Baru
      name: m.name,
      effect: m.effect,
      val: m.val,
      desc: m.desc,
      image: m.image, 
      element: "Instant"
    };
  });


  const deck = [...monsters, ...magics, ...bosses, ...instants].sort(() => Math.random() - 0.5);
  return deck;
};