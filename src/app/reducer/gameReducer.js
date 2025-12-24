// gameReducer.js

import { generateDeck } from "../utils/gameData";
import { selfEffect } from "../utils/abbilytyApply";

export const initialState = {
  playerHand: [],
  playerBench: [],
  playerGraveyard: [],
  playerDeck: [],
  playerActive: null,
  playerKO: 0,
  comHand: [],
  comBench: [],
  comGraveyard: [],
  comDeck: [],
  comActive: null,
  comKO: 0,

  turn: "PLAYER",
  winner: null,
};

export function gameReducer(state, action) {
  const getKeys = (who) => {
    const prefix = who === "PLAYER" ? "player" : "com";
    return {
      deckKey: `${prefix}Deck`,
      handKey: `${prefix}Hand`,
      benchKey: `${prefix}Bench`,
      graveKey: `${prefix}Graveyard`,
      activeKey: `${prefix}Active`,
      KOKey: `${prefix}KO`,
    };
  };

  const isWeaknes = (cardAttacker, cardAttacked) => {
    return (
      (cardAttacker.element === "Fire" && cardAttacked.element === "Grass") ||
      (cardAttacker.element === "Grass" && cardAttacked.element === "Water") ||
      (cardAttacker.element === "Water" && cardAttacked.element === "Fire")
    );
  };

  const findSacrifices = (recipe, bench) => {
    let foundSacrifices = [];
    let tempBench = [...bench]; // Copy bench biar gak ngerusak array asli saat checking

    // Loop setiap bahan yang diminta resep
    for (const element of recipe) {
      // Cari kartu di bench yang namanya sesuai bahan
      const matchIndex = tempBench.findIndex(
        (card) => card.element === element && card.isReady === true
      );

      if (matchIndex === -1) {
        return null; // GAGAL: Ada satu bahan yang gak ketemu
      }

      // Kalau ketemu, masukkan ke daftar calon tumbal
      foundSacrifices.push(tempBench[matchIndex]);

      // Hapus dari tempBench supaya kartu yang sama gak dipake 2x
      // (misal resep butuh 2 Blue Dragon, tapi di bench cuma ada 1)
      tempBench.splice(matchIndex, 1);
    }

    return foundSacrifices; // BERHASIL: Mengembalikan array kartu yang mau dikorbankan
  };

  switch (action.type) {
    case "SET_WINNER": {
      const { who } = action.payload;
      return {
        ...state,
        winner: who,
      };
    }

    case "RESET_SCORE": {
      return {
        playerHand: [],
        playerBench: [],
        playerGraveyard: [],
        playerDeck: [],
        playerActive: null,
        playerKO: 0,
        comHand: [],
        comBench: [],
        comGraveyard: [],
        comDeck: [],
        comActive: null,
        comKO: 0,

        turn: "PLAYER",
        winner: null,
      };
    }
    case "GENERATE_DECK": {
      const { who } = action.payload;
      const deckKey = who === "PLAYER" ? "playerDeck" : "comDeck";
      return {
        ...state,
        [deckKey]: generateDeck(20),
      };
    }

    // KASUS: MAINKAN KARTU (Pindah Hand -> Field)
    case "DRAW_CARD": {
      const { who } = action.payload;
      const handKey = who === "PLAYER" ? "playerHand" : "comHand";
      const deckKey = who === "PLAYER" ? "playerDeck" : "comDeck";
      const currentDeck = state[deckKey];
      const currentCHand = state[handKey];
      if (currentDeck.length === 0 || currentCHand.length >= 7) return state;
      const newCard = currentDeck[currentDeck.length - 1];

      const newHand = [...state[handKey], newCard];
      // console.log(newCard,newHand)
      return {
        ...state,
        [deckKey]: state[deckKey].slice(0, -1),
        [handKey]: [...state[handKey], newCard],
      };
    }
    case "PLAY_CARD": {
      const { card, who } = action.payload; // who = 'PLAYER' atau 'COM'

      // Tentukan target array berdasarkan siapa yang main
      const handKey = who === "PLAYER" ? "playerHand" : "comHand";
      const fieldKey = who === "PLAYER" ? "playerBench" : "comBench";
      const currentCBench = state[fieldKey];

      // 1. Validasi: Pastikan kartu benar-benar ada di tangan (Anti Duplikat!)
      const cardExists = state[handKey].find((c) => c.id === card.id);
      if (!cardExists) return state; // Batalkan jika kartu hantu

      if (currentCBench.length >= 5) return state;

      return {
        ...state, // Copy state lama
        // Update Hand (Filter)
        [handKey]: state[handKey].filter((c) => c.id !== card.id),
        // Update Field (Push)
        [fieldKey]: [...state[fieldKey], card],
      };
    }

    case "PLAY_ACTIVE": {
      const { card, who } = action.payload;
      const { benchKey, activeKey } = getKeys(who);
      return {
        ...state,
        [benchKey]: state[benchKey].filter((c) => c.id !== card.id),
        [activeKey]: card,
      };
    }
    case "PLAY_ACTIVE_COM": {
      const { who } = action.payload;
      const { benchKey, activeKey } = getKeys(who);
      const currentCBench = [...state[benchKey]];
      const strongestMonster = currentCBench.reduce((p, c) =>
        p.hp > c.hp ? p : c
      );
      return {
        ...state,
        [benchKey]: state[benchKey].filter((c) => c.id !== strongestMonster.id),
        [activeKey]: strongestMonster,
      };
    }

    case "ATTACK": {
      const { who } = action.payload;
      const oposite = who === "PLAYER" ? "COM" : "PLAYER";
      const { activeKey } = getKeys(who);
      const { activeKey: opositeActiveKey, graveKey, KOKey } = getKeys(oposite);

      const currentActive = state[activeKey];
      const currentOpositeActive = state[opositeActiveKey];

      if (!currentActive || !currentOpositeActive) {
        return { ...state };
      }
      const bonusWeaknes = isWeaknes(currentActive, currentOpositeActive);
      const totalAtt = currentActive.att + (currentActive.bonusAtt || 0) + (bonusWeaknes ? 20 : 0);
      const damageDealt = Math.max(0, totalAtt - currentOpositeActive.defense);

      const predictedNewHp = currentOpositeActive.hp - damageDealt;

      const updatedOpositeCard = {
        ...currentOpositeActive, // Copy semua properti lama (nama, att, def, id, dll)
        hp: predictedNewHp, // Timpa properti hp dengan yang baru
      };

      let newActive = selfEffect(currentActive);

      if (predictedNewHp <= 0) {
        const newScore =
          state[KOKey] + (currentOpositeActive.type === "FUSION" ? 2 : 1);

        return {
          ...state,
          [KOKey]: newScore,
          [activeKey]: newActive,
          [opositeActiveKey]: null,
          [graveKey]: [...state[graveKey], updatedOpositeCard],
        };
      } else {
        return {
          ...state,
          [opositeActiveKey]: updatedOpositeCard,
          [activeKey]: newActive,
        };
      }
    }

    // KASUS: INSTANT MAGIC (Pindah Hand -> Graveyard + Effect)
    case "CAST_INSTANT": {
      const { card, who } = action.payload;
      const handKey = who === "PLAYER" ? "playerHand" : "comHand";
      const graveKey = who === "PLAYER" ? "playerGraveyard" : "comGraveyard";

      return {
        ...state,
        [handKey]: state[handKey].filter((c) => c.id !== card.id),
        [graveKey]: [...state[graveKey], card],
        // Note: Logic efek (draw/shuffle) bisa dihandle di case lain atau digabung
      };
    }

    case "APPLY_MAGIC_PLAYER": {
      const { card, who, targetCard, isActiveSlot } = action.payload;
      const { activeKey, benchKey, handKey, graveKey } = getKeys(who);
      let updatedTargetCard =
        who === "PLAYER" ? { ...targetCard } : { ...state[activeKey] };

      if (card.effect === "HEAL") {
        updatedTargetCard.hp = Math.min(
          updatedTargetCard.maxHp,
          updatedTargetCard.hp + card.val
        );
      } else if (card.effect === "BUFF_ATK") {
        updatedTargetCard.bonusAtt =
          (updatedTargetCard.bonusAtt || 0) + card.val;
      } else if (card.effect === "DEFENSE") {
        updatedTargetCard.defense += card.val;
      }

      const newHand = state[handKey].filter((c) => c.id !== card.id);
      const newGrave = [...state[graveKey], card];

      if (isActiveSlot) {
        return {
          ...state,
          [handKey]: newHand, // Hand berkurang
          [graveKey]: newGrave, // Graveyard nambah
          [activeKey]: updatedTargetCard, // Active Card terupdate
        };
      } else {
        const newBench = state[benchKey].map((benchCard) => {
          if (benchCard.id === targetCard.id) {
            return updatedTargetCard; // Ganti dengan yang sudah di-buff
          }
          return benchCard; // Kartu lain biarkan saja
        });

        return {
          ...state,
          [handKey]: newHand,
          [graveKey]: newGrave,
          [benchKey]: newBench, // Bench terupdate
        };
      }
    }

    case "TRY_FUSION_SUMMON": {
      const { who, card } = action.payload; // Card = Kartu Fusion yang mau dimainkan
      const { handKey, benchKey, graveKey } = getKeys(who);

      // 1. AMBIL DATA TERBARU (Fresh from oven!)
      const currentBench = state[benchKey];
      const currentHand = state[handKey];

      // 2. LOGIC PENCARIAN (Di sini aman karena datanya update)
      const sacrifices = findSacrifices(card.cost, currentBench);

      // 3. JIKA GAGAL (Bahan gak ada)
      if (!sacrifices) {
        // Kembalikan state apa adanya (AI gagal fusion, tidak terjadi apa-apa)
        return state;
      }

      // 4. JIKA BERHASIL (Bahan lengkap) -> LAKUKAN FUSION
      // (Ini logic remove/add yang tadi kita bahas)
      const sacrificeIds = sacrifices.map((s) => s.id);

      const newHand = currentHand.filter((c) => c.id !== card.id);
      const newBench = currentBench.filter((c) => !sacrificeIds.includes(c.id));
      const finalBench = [...newBench, card]; // Masukkan Boss
      const newGrave = [...state[graveKey], ...sacrifices];

      return {
        ...state,
        [handKey]: newHand,
        [benchKey]: finalBench,
        [graveKey]: newGrave,
      };
    }

    case "SUMMON_FUSION": {
      const { who, sacrifices, card } = action.payload;
      const { handKey, benchKey, graveKey } = getKeys(who);

      const materialArray = Array.isArray(sacrifices)
        ? sacrifices
        : [sacrifices];

      const materialIds = materialArray.map((m) => m.id);
      const newHand = state[handKey].filter((c) => c.id !== card.id);

      const benchAfterSacrifice = state[benchKey].filter(
        (benchCard) => !materialIds.includes(benchCard.id)
      );

      const newBench = [...benchAfterSacrifice, card];

      const newGrave = [...state[graveKey], ...materialArray];

      return {
        ...state,
        [handKey]: newHand,
        [benchKey]: newBench,
        [graveKey]: newGrave,
      };
    }

    case "SKILL_RESHUFFLE_DISCARD": {
      const { playerHand, playerGraveyard, comHand, comGraveyard } = state;

      return {
        ...state,
        playerGraveyard: [...playerGraveyard, ...playerHand],
        comGraveyard: [...comGraveyard, ...comHand],
        playerHand: [],
        comHand: [],
      };
    }

    case "SKILL_GLOBAL_BOUNCE": {
      const { who, card } = action.payload;
      const oposite = who === "PLAYER" ? "COM" : "PLAYER";
      const { graveKey, handKey, benchKey } = getKeys(who);
      const { handKey: opositeHandKey, benchKey: opositeBenchKey } =
        getKeys(oposite);
      const newHand = state[handKey].filter((c) => c.id !== card.id);

      const resetCardStats = (cardToReset) => ({
        ...cardToReset,
        hp: cardToReset.maxHp,
        isReady: false,
        bonusAtt: 0,
        defense: 0,
      });

      // 3. Ambil kartu dari Bench & Reset statusnya
      const bouncedMyBench = state[benchKey].map(resetCardStats);
      const bouncedOpositeBench = state[opositeBenchKey].map(resetCardStats);

      return {
        ...state,
        [graveKey]: [...state[graveKey], card],
        [handKey]: [...newHand, ...bouncedMyBench],
        [opositeHandKey]: [...state[opositeHandKey], ...bouncedOpositeBench],
        [benchKey]: [],
        [opositeBenchKey]: [],
      };
    }

    case "END_TURN":
      const currentTurn = state.turn;
      const oposite = state.turn === "PLAYER" ? "COM" : "PLAYER";

      const { activeKey, benchKey } = getKeys(currentTurn);
      const { activeKey: opositeActiveKey } = getKeys(oposite);

      const currentActive = state[activeKey];
      const currentCBench = state[benchKey];

      const newBench = currentCBench.map((card) => {
        return { ...card, isReady: true };
      });
      const currentOpositeActive = state[opositeActiveKey];

      const newCountFrozen =
        currentActive?.countFrozen - 1 > 0 ? currentActive?.countFrozen - 1 : 0;

      const updatedturnCard = {
        ...currentActive, // Copy semua properti lama (nama, att, def, id, dll)
        bonusAtt: 0, // Timpa properti hp dengan yang baru
        countFrozen: newCountFrozen,
        isFrozen: newCountFrozen > 0,
      };

      const updatedOpositeCard = {
        ...currentOpositeActive, // Copy semua properti lama (nama, att, def, id, dll)
        defense: 0, // Timpa properti hp dengan yang baru
      };

      return {
        ...state,
        turn: state.turn === "PLAYER" ? "COM" : "PLAYER",
        [activeKey]: currentActive ? updatedturnCard : null,
        [benchKey]: newBench,
        [opositeActiveKey]: currentOpositeActive ? updatedOpositeCard : null,
      };

    default:
      return state;
  }
}
