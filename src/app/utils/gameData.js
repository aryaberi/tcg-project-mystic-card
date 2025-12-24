// utils/gameData.js

export const ELEMENTS = ["Fire", "Water", "Grass"];

export const IMAGES = {
  Fire: "🔥",
  Water: "💧",
  Grass: "🌿",
};

const MONSTERS_BASIC = [
  { 
    name: "Grasschick", 
    element: "Grass", 
    att: 20, hp: 60, 
    image: "/Image/Monster_Basic/chicken_grass.jpg" ,
    ability: "",
    desc: "Anak ayam hutan",
  },
  { 
    name: "Toya Toga", 
    element: "Water", 
    att: 20, hp: 80, 
    image: "/Image/Monster_Basic/Water_turtoise.jpg",
    ability: "",
    desc: "Kura-kura penjaga air suci", 
  },
  { 
    name: "Pig Hell", 
    element: "Fire", 
    att: 25, hp: 50, 
    image: "/Image/Monster_Basic/Fire_Pig.jpg" ,
    ability: "",
    desc: "Babi neraka",

  },
  { 
    name: "Tutle Bon", 
    element: "Grass", 
    att: 20, hp: 80, 
    image: "/Image/Monster_Basic/Tutle_Bon.jpg" ,
    ability: "",
    desc: "Kura kura jaga kebon",
  },
  { 
    name: "D. Horsea", 
    element: "Water", 
    att: 30, hp: 60, 
    image: "/Image/Monster_Basic/D.Horsea.jpg",
    ability: "",
    desc: "Naga kuda laut", 
  },
  { 
    name: "Emberling", 
    element: "Fire", 
    att: 30, hp: 40, 
    image: "/Image/Monster_Basic/Emberling.jpg" ,
    ability: "",
    desc: "Babi neraka",

  },
  { 
    name: "Epen Tree", 
    element: "Grass", 
    att: 25, hp: 100, 
    image: "/Image/Monster_Basic/Epen_Tree.jpg" ,
    ability: "",
    desc: "Anak ayam hutan",
  },
  { 
    name: "Blizard Horse", 
    element: "Water", 
    att: 30, hp: 70, 
    image: "/Image/Monster_Basic/Blizard_Horse.jpg",
    ability: "",
    desc: "Kura-kura penjaga air suci", 
  },
  { 
    name: "Fire Fello", 
    element: "Fire", 
    att: 40, hp: 80, 
    image: "/Image/Monster_Basic/Fire_Fello.jpg" ,
    ability: "",
    desc: "Babi neraka",

  }
];

const FUSION_MONSTERS = [
  { 
    name: "Red Scorpio", 
    element: "Fire", 
    cost: ["Fire", "Fire"], // Butuh 2 Fire
    att: 60, hp: 150, 
    image: "/Image/Monster_Fusion/Red_Scorpio.jpg" ,
    ability: { type: "RECOIL", val: 20, name: "Overheat" },
    desc: "Attack deals 20 DMG to self.",
  },
  { 
    name: "Swamp King", 
    element: "Grass", 
    cost: ["Grass", "Water"], // Butuh 1 Grass + 1 Water
    att: 100, hp: 120, 
    image: "/Image/Monster_Fusion/Swamp king.jpg",
    ability: { type: "FROZEN", val: 0, name: "Recharge" },
    desc: "Cannot attack next turn after attacking.", 
  },
  { 
    name: "Vulcanic Robo", 
    element: "Fire", 
    cost: ["Water", "Fire"], // Butuh 1 Water + 1 Fire
    att: 55, hp: 140, 
    ability: { type: "GROWTH", val: 10, name: "Photosynthesis" },
    desc: "Gains +10 ATK every turn start in active spot.",
    image: "/Image/Monster_Fusion/vulcanic_robo.jpg" 
  },{ 
    name: "Frozen Fire Wolf", 
    element: "Water", 
    cost: ["Water", "Fire"], // Butuh 1 Water + 1 Fire
    att: 55, hp: 140, 
    ability: { type: "GROWTH", val: 10, name: "Photosynthesis" },
    desc: "Gains +10 ATK every turn start in active spot.",
    image: "/Image/Monster_Fusion/Frozen_Fire_Wolf.jpg" 
  }
];

const MAGIC_CARDS = [
  { name: "Potions", effect: "HEAL", val: 20, desc: "Heal 50 HP", image: "/Image/Magic/Potion.jpg" },
  { name: "Sword Buff", effect: "BUFF_ATK", val: 20, desc: "+20 Attack", image: "/Image/Magic/Dragon_Slayer.jpg" },
  { name: "Elixir", effect: "HEAL", val: 100, desc: "Heal 100 HP", image: "/Image/Magic/Elixir.jpg" },
  { name: "Iron Skin", effect: "DEFENSE", val: 20, desc: "-20 Dmg Received (1 Turn)", image: "/Image/Magic/Guard.jpg" },
];

// --- KARTU INSTANT BARU ---
const INSTANT_CARDS = [
  { 
    name: "Chaos Shuffle", 
    effect: "GLOBAL_SHUFFLE", 
    val: 5, 
    desc: "Both players discard hand & draw 5 cards.", 
    image: "/Image/Magic/Shuffle_hand.jpg" 
  },
  { 
    name: "Whirlwind", 
    effect: "GLOBAL_BOUNCE", 
    val: 0, 
    desc: "Return ALL Bench monsters to Hand.", 
    image: "/Image/Magic/Tornado.jpg" 
  },
];

export const generateDeck = (count = 20) => {
  // 1. Buat 15 Monster
  const monsters = Array.from({ length: 12 }).map((_, i) => {
    const mb = MONSTERS_BASIC[Math.floor(Math.random() * MONSTERS_BASIC.length)];
    return {
      id: crypto.randomUUID(),
      type: "MONSTER",
      name: mb.name,
      element: mb.element,
      att: mb.att,
      hp: mb.hp,
      maxHp: 0, 
      image: mb.image,
      desc: mb.desc,
      bonusAtt: 0,
      defense: 0,
      isReady: false,
      ability: mb.ability, // Pastikan ini kebawa
      isFrozen: false,
      countFrozen : 0
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
      countFrozen : 0
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