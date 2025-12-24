export const selfEffect=(card)=> {
    // 1. SAFETY CHECK: Cek dulu kartu punya ability atau tidak
    // Kalau kartu biasa (Monster Polos) masuk sini, code mu yang lama bakal Error
    if (!card.ability) return card;

    if (card.ability.type === "RECOIL") {
        const newHp = card.hp - card.ability.val
        return {
            ...card,
            // ERROR LAMA: hp - card.ability.value
            // FIX: card.hp - card.ability.value
            hp: newHp > 0 ? newHp : 10
        };
    }

    if (card.ability.type === "FROZEN") {
        return {
            ...card,
            isFrozen: true,
            countFrozen: 2
        };
    }

    // Kalau punya ability tapi bukan RECOIL/FROZEN (misal: PASSIVE_BUFF), balikin aja
    return card;
}