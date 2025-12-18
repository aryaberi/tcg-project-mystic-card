// utils/gameData.js

export const ELEMENTS = ["Fire", "Water", "Grass"];

export const IMAGES = {
  Fire: "https://placehold.co/100x100/red/white?text=Fire",
  Water: "https://placehold.co/100x100/blue/white?text=Water",
  Grass: "https://placehold.co/100x100/green/white?text=Grass",
};

const FUSION_MONSTERS = [
  { 
    name: "Volcanic Dragon", 
    element: "Fire", 
    cost: ["Fire", "Fire"], // Butuh 2 Fire
    att: 60, hp: 150, 
    desc: "Requires 2 Fire Monsters",
    image: "🐉" 
  },
  { 
    name: "Swamp King", 
    element: "Grass", 
    cost: ["Grass", "Water"], // Butuh 1 Grass + 1 Water
    att: 50, hp: 180, 
    desc: "Requires Grass + Water",
    image: "🐸" 
  },
  { 
    name: "Steam Golem", 
    element: "Water", 
    cost: ["Water", "Fire"], // Butuh 1 Water + 1 Fire
    att: 55, hp: 160, 
    desc: "Requires Water + Fire",
    image: "🤖" 
  }
];

const MAGIC_CARDS = [
  { name: "Potions", effect: "HEAL", val: 50, desc: "Heal 50 HP", image: "🧪" },
  { name: "Sword Buff", effect: "BUFF_ATK", val: 20, desc: "+20 Attack", image: "⚔️" },
  { name: "Elixir", effect: "HEAL", val: 100, desc: "Heal 100 HP", image: "🍷" },
  { name: "Iron Skin", effect: "DEFENSE", val: 20, desc: "-20 Dmg Received (1 Turn)", image: "🛡️" },
];

export const generateDeck = (count = 20) => {
  // 1. Buat 15 Monster
  const monsters = Array.from({ length: 15 }).map((_, i) => {
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
    };
  }).map(c => ({ ...c, maxHp: c.hp }));

  // 2. Buat 5 Magic Cards
  const magics = Array.from({ length: 5 }).map((_, i) => {
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
      bonusAtt: 0, defense: 0
    };
  });

  const deck = [...monsters, ...magics, ...bosses].sort(() => Math.random() - 0.5);
  return deck;
};